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
import { chartColor } from '@/utils/chartScale'
import type { KpiTone } from '@/components/ui/KpiCard.vue'

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
    const days = d.daily
    return [
      {
        label: copy.sales,
        value: formatCents(d.salesCents),
        delta: variation(d.salesCents, d.previous.salesCents),
        deltaLabel: copy.vsPrevious,
        help: `${site.help.sales} ${site.help.vsPrevious}`,
        icon: 'fa-solid fa-sack-dollar',
        tone: 'accent' as KpiTone,
        spark: days.map((x) => x.salesCents),
      },
      {
        label: copy.tickets,
        value: formatQty(d.tickets),
        delta: variation(d.tickets, d.previous.tickets),
        deltaLabel: copy.vsPrevious,
        help: site.help.tickets,
        icon: 'fa-solid fa-receipt',
        tone: 'blue' as KpiTone,
        spark: days.map((x) => x.tickets),
      },
      {
        label: copy.avgTicket,
        // Sin tickets no hay promedio: un "$0,00" haría pensar que se vendió gratis.
        value: d.tickets ? formatCents(d.avgTicketCents) : '—',
        delta: d.tickets ? variation(d.avgTicketCents, d.previous.avgTicketCents) : null,
        deltaLabel: copy.vsPrevious,
        help: site.help.avgTicket,
        icon: 'fa-solid fa-utensils',
        tone: 'amber' as KpiTone,
        spark: days.map((x) => (x.tickets ? x.salesCents / x.tickets : 0)),
      },
      {
        label: copy.itemsSold,
        value: formatQty(d.itemsSold),
        delta: null,
        sub: d.tickets ? `${formatQty(d.itemsSold / d.tickets)} ${copy.perTicket}` : undefined,
        help: site.help.itemsSold,
        icon: 'fa-solid fa-bowl-food',
        tone: 'violet' as KpiTone,
      },
    ]
  })

  const daily = computed(() => ({
    labels: data.value?.daily.map((d) => dayLabel(d.date)) ?? [],
    series: data.value?.daily.map((d) => d.salesCents) ?? [],
  }))

  const periodDelta = computed(() =>
    data.value ? variation(data.value.salesCents, data.value.previous.salesCents) : null,
  )

  // El color sigue a la sucursal (su lugar en la lista), no a su puesto en el ranking.
  const colorOf = (id: string) => {
    const i = filters.branches.findIndex((b) => b._id === id)
    return chartColor(i < 0 ? 0 : i)
  }

  const branches = computed(() =>
    [...(data.value?.byBranch ?? [])]
      .sort((a, b) => b.salesCents - a.salesCents)
      .map((b, i) => ({
        id: b.branch._id,
        rank: i + 1,
        label: b.branch.name,
        value: b.salesCents,
        display: formatCents(b.salesCents),
        tickets: formatQty(b.tickets),
        avgTicket: b.tickets ? formatCents(b.avgTicketCents) : '—',
        share: b.share,
        shareText: formatPercent(b.share),
        color: colorOf(b.branch._id),
      })),
  )
  const multiBranch = computed(() => filters.branch === 'all' && branches.value.length > 1)

  const alerts = computed(() => data.value?.inventoryAlerts ?? { out: 0, low: 0 })
  const hasAlerts = computed(() => alerts.value.out + alerts.value.low > 0)
  const isEmpty = computed(() => Boolean(data.value && !data.value.tickets))

  return { ...state, kpis, daily, periodDelta, branches, multiBranch, alerts, hasAlerts, isEmpty }
}
