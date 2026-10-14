import { computed, ref, watch } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from './useDashboardData'
import { formatCents, formatQty } from '@/utils/format'
import type { KpiTone } from '@/components/ui/KpiCard.vue'
import type { BadgeTone } from '@/components/ui/AppBadge.vue'
import type { WaiterStats } from '@/types'

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

/** Meseros listos para pintar: KPIs del equipo, ranking filtrable y reparto por nivel. */
export function useWaiters() {
  const state = useDashboardData(dashboardService.waiters.bind(dashboardService))
  const { data } = state
  const view = ref<WaiterView>('all')

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
        avgTicket: formatCents(s.avgTicketCents),
        avgTrend: cmp(s.avgTicketCents, t.avgTicketCents),
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
    return [
      {
        label: copy.evaluated,
        value: formatQty(counts.value.all),
        sub: copy.evaluatedSub(counts.value.top, counts.value.attention),
        help: site.help.waiterScore,
        icon: 'fa-solid fa-users',
        tone: 'ink' as KpiTone,
      },
      {
        label: copy.avgTicket,
        value: formatCents(t.avgTicketCents),
        help: site.help.avgTicket,
        icon: 'fa-solid fa-receipt',
        tone: 'accent' as KpiTone,
        sub: copy.teamAvgSub,
      },
      {
        label: copy.perDay,
        value: formatQty(t.ticketsPerDay),
        help: site.help.perDay,
        icon: 'fa-solid fa-chair',
        tone: 'blue' as KpiTone,
        sub: copy.teamAvgSub,
      },
      {
        label: copy.perTicket,
        value: formatQty(t.itemsPerTicket),
        help: site.help.perTicket,
        icon: 'fa-solid fa-bowl-food',
        tone: 'amber' as KpiTone,
        sub: copy.teamAvgSub,
      },
    ]
  })

  const levels = computed(() =>
    (['top', 'ok', 'attention'] as const).map((l) => ({
      label: site.waiterLevels[l],
      value: ranked.value.filter((r) => r.s.level === l).length,
      display: copy.people(ranked.value.filter((r) => r.s.level === l).length),
      color: LEVEL_COLOR[l],
    })),
  )

  return { ...state, view, tabs, team, rows, kpis, levels, ranked }
}
