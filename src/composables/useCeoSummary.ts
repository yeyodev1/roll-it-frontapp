import { computed, watch } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { branchService } from '@/services/branch.service'
import { useDashboardData } from './useDashboardData'
import { useLastSync } from './useLastSync'
import { useFiltersStore } from '@/stores/filters'
import { formatCents, formatPercent, formatQty, variation } from '@/utils/format'
import { dayLabel } from '@/utils/chartFormat'

const copy = dashboardCopy.ceo

/**
 * Datos del Panel CEO ya listos para pintar. En cada refresco recarga también
 * las sucursales: así `dataUntil` (último día con ventas) se mueve solo cuando
 * SmartMenu manda ventas nuevas.
 */
export function useCeoSummary() {
  const filters = useFiltersStore()
  const { report } = useLastSync()
  const state = useDashboardData(dashboardService.summary.bind(dashboardService), {
    onRefresh: async () => filters.setBranches(await branchService.list()),
  })
  const { data } = state

  watch(data, (d) => d && report(d.lastSyncAt))

  const kpis = computed(() => {
    const d = data.value
    if (!d) return []
    return [
      {
        label: copy.sales,
        value: formatCents(d.salesCents),
        delta: variation(d.salesCents, d.previous.salesCents),
        help: `${site.help.sales} ${site.help.vsPrevious}`,
        icon: 'fa-solid fa-sack-dollar',
      },
      {
        label: copy.tickets,
        value: formatQty(d.tickets),
        delta: variation(d.tickets, d.previous.tickets),
        help: site.help.tickets,
        icon: 'fa-solid fa-receipt',
      },
      {
        label: copy.avgTicket,
        // Sin tickets no hay promedio: un "$0,00" haría pensar que se vendió gratis.
        value: d.tickets ? formatCents(d.avgTicketCents) : '—',
        delta: d.tickets ? variation(d.avgTicketCents, d.previous.avgTicketCents) : null,
        help: site.help.avgTicket,
        icon: 'fa-solid fa-utensils',
      },
      {
        label: copy.itemsSold,
        value: formatQty(d.itemsSold),
        delta: null,
        help: site.help.itemsSold,
        icon: 'fa-solid fa-bowl-food',
      },
    ]
  })

  const daily = computed(() => ({
    labels: data.value?.daily.map((d) => dayLabel(d.date)) ?? [],
    series: data.value?.daily.map((d) => d.salesCents) ?? [],
  }))

  const branches = computed(() =>
    (data.value?.byBranch ?? []).map((b) => ({
      label: b.branch.name,
      value: b.salesCents,
      display: formatCents(b.salesCents),
      sub: formatPercent(b.share),
    })),
  )

  const alerts = computed(() => data.value?.inventoryAlerts ?? { out: 0, low: 0 })
  const hasAlerts = computed(() => alerts.value.out + alerts.value.low > 0)
  const isEmpty = computed(() => Boolean(data.value && !data.value.tickets))

  return { ...state, kpis, daily, branches, alerts, hasAlerts, isEmpty }
}
