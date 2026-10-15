import { computed, ref, watch } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from './useDashboardData'
import { useFiltersStore } from '@/stores/filters'
import { formatCents, formatDate, formatQty } from '@/utils/format'
import type { KpiTone } from '@/components/ui/KpiCard.vue'
import type { BadgeTone } from '@/components/ui/AppBadge.vue'
import type { WaiterMetric, WaiterStats } from '@/types'

export type WaiterView = 'all' | 'attention' | 'top'
export type Trend = 'up' | 'down' | 'flat'

const copy = dashboardCopy.waiters
const LEVEL_TONE: Record<WaiterStats['level'], BadgeTone> = {
  top: 'success',
  ok: 'info',
  attention: 'danger',
}
const LEVEL_COLOR: Record<WaiterStats['level'], string> = {
  top: 'var(--success)',
  ok: 'var(--info)',
  attention: 'var(--danger)',
}

// Menos de 3% de diferencia con el equipo es "igual": no merece flecha.
function cmp(value: number, base: number): Trend {
  if (!base) return 'flat'
  const diff = (value - base) / base
  return Math.abs(diff) < 0.03 ? 'flat' : diff > 0 ? 'up' : 'down'
}

// Un día 'YYYY-MM-DD' a mediodía de Ecuador: a medianoche UTC se pintaría el día anterior.
const dayLabel = (key: string) => formatDate(`${key}T12:00:00-05:00`)

/** Meseros listos para pintar: KPIs del equipo, ranking filtrable y reparto por nivel. */
export function useWaiters() {
  const state = useDashboardData(dashboardService.waiters.bind(dashboardService))
  const { data } = state
  const filters = useFiltersStore()
  const view = ref<WaiterView>('all')

  // Con el cierre de mes no hay venta en $ por mesera: esas columnas y KPIs se ocultan, no van en cero.
  const metrics = computed<WaiterMetric[]>(
    () => data.value?.metrics ?? ['avgTicket', 'ticketsPerDay', 'itemsPerTicket'],
  )
  const fromClosings = computed(() => data.value?.source === 'closings')
  const perTicketLabel = computed(() =>
    fromClosings.value ? copy.perTicketClosing : copy.perTicket,
  )

  // Rango vacío pero con cierres cargados en otras fechas: se ofrece ir a ellas.
  const closings = computed(() => {
    const r = data.value?.closingsRange
    if (!r || data.value?.waiters.length) return null
    return { ...r, text: copy.noRankingText(dayLabel(r.from), dayLabel(r.to)) }
  })
  function jumpToClosings() {
    if (closings.value) filters.setRange(closings.value.from, closings.value.to)
  }

  // El puesto se fija por puntaje antes de filtrar: no cambia al filtrar.
  const ranked = computed(() =>
    [...(data.value?.waiters ?? [])]
      .sort((a, b) => b.score - a.score)
      .map((s, i) => ({ s, rank: i + 1 })),
  )

  const counts = computed(() => ({
    all: ranked.value.length,
    attention: ranked.value.filter((r) => r.s.level === 'attention').length,
    top: ranked.value.filter((r) => r.s.level === 'top').length,
  }))

  // Si al cambiar de fechas el filtro queda vacío, se vuelve a ver a todos.
  watch(counts, (c) => {
    if (!c[view.value]) view.value = 'all'
  })

  const tabs = computed(() => [
    { value: 'all' as WaiterView, label: copy.all, count: counts.value.all },
    { value: 'attention' as WaiterView, label: copy.attentionFirst, count: counts.value.attention },
    { value: 'top' as WaiterView, label: copy.topOnly, count: counts.value.top },
  ])

  const team = computed(() => data.value?.teamAvg)

  const rows = computed(() => {
    const t = team.value
    if (!t) return []
    return ranked.value
      .filter((r) => view.value === 'all' || r.s.level === view.value)
      .map(({ s, rank }) => ({
        id: `${s.waiter._id}-${s.branch._id}`,
        rank,
        name: s.waiter.name,
        branch: `${s.branch.name} · ${copy.days(s.daysWorked)}`,
        level: s.level,
        levelLabel: site.waiterLevels[s.level],
        tone: LEVEL_TONE[s.level],
        color: LEVEL_COLOR[s.level],
        score: Math.round(Math.min(Math.max(s.score, 0), 100)),
        avgTicket: s.avgTicketCents === null ? '—' : formatCents(s.avgTicketCents),
        avgTrend: cmp(s.avgTicketCents ?? 0, t.avgTicketCents ?? 0),
        perDay: formatQty(s.ticketsPerDay),
        perDayTrend: cmp(s.ticketsPerDay, t.ticketsPerDay),
        perTicket: formatQty(s.itemsPerTicket),
        perTicketTrend: cmp(s.itemsPerTicket, t.itemsPerTicket),
        reasons: s.reasons,
      }))
  })

  const kpis = computed(() => {
    const t = team.value
    if (!t) return []
    const cards = [
      {
        key: 'evaluated',
        label: copy.evaluated,
        value: formatQty(counts.value.all),
        sub: copy.evaluatedSub(counts.value.top, counts.value.attention),
        help: site.help.waiterScore,
        icon: 'fa-solid fa-users',
        tone: 'ink' as KpiTone,
      },
      {
        key: 'avgTicket',
        label: copy.avgTicket,
        value: formatCents(t.avgTicketCents ?? 0),
        help: site.help.avgTicket,
        icon: 'fa-solid fa-receipt',
        tone: 'accent' as KpiTone,
        sub: copy.teamAvgSub,
      },
      {
        key: 'ticketsPerDay',
        label: copy.perDay,
        value: formatQty(t.ticketsPerDay),
        help: site.help.perDay,
        icon: 'fa-solid fa-chair',
        tone: 'blue' as KpiTone,
        sub: copy.teamAvgSub,
      },
      {
        key: 'itemsPerTicket',
        label: perTicketLabel.value,
        value: formatQty(t.itemsPerTicket),
        help: site.help.perTicket,
        icon: 'fa-solid fa-bowl-food',
        tone: 'amber' as KpiTone,
        sub: copy.teamAvgSub,
      },
    ]
    return cards
      .filter((c) => c.key === 'evaluated' || metrics.value.includes(c.key as WaiterMetric))
      .map(({ key: _key, ...card }) => card)
  })

  const levels = computed(() =>
    (['top', 'ok', 'attention'] as const).map((l) => ({
      label: site.waiterLevels[l],
      value: ranked.value.filter((r) => r.s.level === l).length,
      display: copy.people(ranked.value.filter((r) => r.s.level === l).length),
      color: LEVEL_COLOR[l],
    })),
  )

  return {
    ...state,
    view,
    tabs,
    team,
    rows,
    kpis,
    levels,
    ranked,
    metrics,
    fromClosings,
    perTicketLabel,
    closings,
    jumpToClosings,
  }
}
