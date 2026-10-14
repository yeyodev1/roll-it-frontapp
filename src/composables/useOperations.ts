import { computed } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy, slotShort } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from './useDashboardData'
import { formatCents, formatPercent, formatQty } from '@/utils/format'
import { compactCents } from '@/utils/chartFormat'
import { chartColor } from '@/utils/chartScale'
import type { KpiTone } from '@/components/ui/KpiCard.vue'
import type { DonutItem } from '@/components/charts/DonutChart.vue'

const copy = dashboardCopy.operations
// El donut se lee con 4 colores; más categorías van juntas en "Otras".
const DONUT_MAX = 4

/** Operaciones listas para pintar: franjas, plato y categoría líder, ranking y donut. */
export function useOperations() {
  const state = useDashboardData(dashboardService.operations.bind(dashboardService))
  const { data } = state

  const kpis = computed(() => {
    const d = data.value
    if (!d) return []
    const top = d.topProducts[0]
    const cat = d.byCategory[0]
    return [
      {
        label: copy.best,
        value: d.bestSlot ? slotShort(d.bestSlot.weekday, d.bestSlot.hour) : '—',
        sub: d.bestSlot ? formatCents(d.bestSlot.salesCents) : undefined,
        help: site.help.bestSlot,
        icon: 'fa-solid fa-fire',
        tone: 'accent' as KpiTone,
      },
      {
        label: copy.worst,
        value: d.worstOpenSlot ? slotShort(d.worstOpenSlot.weekday, d.worstOpenSlot.hour) : '—',
        sub: d.worstOpenSlot ? formatCents(d.worstOpenSlot.salesCents) : undefined,
        help: site.help.worstSlot,
        icon: 'fa-solid fa-snowflake',
        tone: 'blue' as KpiTone,
      },
      {
        label: copy.star,
        value: top ? formatCents(top.salesCents) : '—',
        sub: top?.name,
        help: site.help.topProducts,
        icon: 'fa-solid fa-star',
        tone: 'amber' as KpiTone,
      },
      {
        label: copy.leadCategory,
        value: cat ? formatPercent(cat.share) : '—',
        sub: cat ? `${cat.category || '—'} · ${compactCents(cat.salesCents)}` : undefined,
        help: site.help.byCategory,
        icon: 'fa-solid fa-layer-group',
        tone: 'violet' as KpiTone,
      },
    ]
  })

  const products = computed(() => {
    const list = data.value?.topProducts ?? []
    const max = Math.max(...list.map((p) => p.salesCents), 1)
    return list.slice(0, 10).map((p, i) => ({
      id: p.name,
      rank: i + 1,
      name: p.name,
      category: p.category || '—',
      quantity: formatQty(p.quantity),
      sales: formatCents(p.salesCents),
      share: formatPercent(p.share),
      bar: p.salesCents / max,
    }))
  })

  const categories = computed<DonutItem[]>(() => {
    const list = data.value?.byCategory ?? []
    const head = list.slice(0, DONUT_MAX - 1)
    const rest = list.slice(DONUT_MAX - 1)
    const items = head.map((c, i) => ({
      label: c.category || '—',
      value: c.salesCents,
      display: formatCents(c.salesCents),
      color: chartColor(i),
    }))
    if (rest.length === 1) {
      const c = rest[0]!
      items.push({
        label: c.category || '—',
        value: c.salesCents,
        display: formatCents(c.salesCents),
        color: chartColor(DONUT_MAX - 1),
      })
    } else if (rest.length) {
      const cents = rest.reduce((a, c) => a + c.salesCents, 0)
      items.push({
        label: copy.otherCategories,
        value: cents,
        display: formatCents(cents),
        color: chartColor(DONUT_MAX - 1),
      })
    }
    return items
  })

  const totalCents = computed(() =>
    (data.value?.byCategory ?? []).reduce((a, c) => a + c.salesCents, 0),
  )

  const isEmpty = computed(() =>
    Boolean(data.value && !data.value.heatmap.length && !data.value.topProducts.length),
  )

  return { ...state, kpis, products, categories, totalCents, isEmpty }
}
