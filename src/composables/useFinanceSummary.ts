import { computed } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from './useDashboardData'
import { formatCents, formatQty, variation } from '@/utils/format'
import { compactCents, monthLabel, monthYearLabel } from '@/utils/chartFormat'
import type { KpiTone } from '@/components/ui/KpiCard.vue'

const copy = dashboardCopy.finance
const pad = (n: number) => String(n).padStart(2, '0')

/** Datos de Finanzas listos para pintar: KPIs, barras del año contra el anterior y tabla mensual. */
export function useFinanceSummary() {
  const state = useDashboardData(dashboardService.finance.bind(dashboardService))
  const { data } = state

  const month = computed(() => data.value?.currentMonth)
  const progress = computed(() => {
    const m = month.value
    return m && m.daysInMonth ? Math.min(m.daysElapsed / m.daysInMonth, 1) : 0
  })

  const byMonth = computed(() => new Map((data.value?.monthly ?? []).map((m) => [m.month, m])))
  const year = computed(() => Number(month.value?.month.slice(0, 4) ?? new Date().getFullYear()))
  const currentIdx = computed(() => Number(month.value?.month.slice(5, 7) ?? 1) - 1)

  const kpis = computed(() => {
    const m = month.value
    const y = data.value?.yearToDate
    if (!m || !y) return []
    // Mes sin ventas (datos importados hasta el mes anterior): "—" en vez de un $0,00 que asusta.
    const empty = !m.salesCents
    return [
      {
        label: copy.monthSold,
        value: empty ? '—' : formatCents(m.salesCents),
        help: empty ? copy.noMonthData : site.help.sales,
        icon: 'fa-solid fa-cash-register',
        tone: 'accent' as KpiTone,
        // Meses cerrados: el mes en curso, a medias, se vería como una caída.
        spark: (data.value?.monthly ?? []).slice(-13, -1).map((x) => x.salesCents),
      },
      {
        key: 'projection',
        label: copy.projection,
        value: empty ? '—' : formatCents(m.projectedCents),
        delta: empty ? null : m.vsLastYear,
        deltaLabel: copy.vsLastYear,
        help: `${site.help.projection} ${site.help.vsLastYear}`,
        icon: 'fa-solid fa-chart-line',
        tone: 'blue' as KpiTone,
      },
      {
        label: copy.lastYear,
        value: m.lastYearCents === null ? '—' : formatCents(m.lastYearCents),
        help: site.help.vsLastYear,
        icon: 'fa-solid fa-clock-rotate-left',
        tone: 'ink' as KpiTone,
        sub: m.lastYearCents === null ? copy.noLastYear : undefined,
      },
      {
        label: copy.ytd,
        value: formatCents(y.salesCents),
        delta:
          y.lastYearSameRangeCents === null
            ? null
            : variation(y.salesCents, y.lastYearSameRangeCents),
        deltaLabel: copy.vsLastYear,
        sub:
          y.lastYearSameRangeCents === null
            ? copy.noLastYear
            : copy.ytdSub(compactCents(y.lastYearSameRangeCents)),
        help: site.help.ytd,
        icon: 'fa-solid fa-calendar-check',
        tone: 'violet' as KpiTone,
      },
    ]
  })

  // Enero a diciembre de este año contra el anterior. Meses sin dato (o que no
  // llegaron) quedan en null: no se dibujan como una caída a $0.
  const bars = computed(() => {
    const at = (y: number, m: number) => byMonth.value.get(`${y}-${pad(m + 1)}`)?.salesCents
    const labels = Array.from({ length: 12 }, (_, m) => monthLabel(`${year.value}-${pad(m + 1)}`))
    const series = labels.map((_, m) => {
      const v = at(year.value, m)
      return m > currentIdx.value || !v ? null : v
    })
    const compare = labels.map((_, m) => at(year.value - 1, m) || null)
    return { labels, series, compare, current: String(year.value), prev: String(year.value - 1) }
  })

  // Tabla: meses de este año con ventas, el más reciente primero.
  const rows = computed(() => {
    const out = []
    for (let m = currentIdx.value; m >= 0; m--) {
      const key = `${year.value}-${pad(m + 1)}`
      const cur = byMonth.value.get(key)
      if (!cur?.salesCents) continue
      const prev = byMonth.value.get(`${year.value - 1}-${pad(m + 1)}`)
      const live = m === currentIdx.value
      out.push({
        id: key,
        month: monthYearLabel(key),
        live,
        sales: formatCents(cur.salesCents),
        tickets: formatQty(cur.tickets),
        avgTicket: cur.tickets ? formatCents(cur.avgTicketCents) : '—',
        lastYear: prev?.salesCents ? formatCents(prev.salesCents) : '—',
        // El mes en curso se compara por su proyección: medio mes contra uno entero engaña.
        delta: live
          ? (month.value?.vsLastYear ?? null)
          : prev?.salesCents
            ? variation(cur.salesCents, prev.salesCents)
            : null,
      })
    }
    return out
  })

  return { ...state, month, progress, kpis, bars, rows }
}
