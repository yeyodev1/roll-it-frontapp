import { computed, type Ref } from 'vue'
import { axisTicks, roundedTopBar } from '@/utils/chartScale'

export interface BarInput {
  series: (number | null)[]
  compare: (number | null)[]
  height: number
}

export const BAR_PAD = { left: 46, right: 4, top: 12, bottom: 26 }
// Hueco de 2px entre la barra actual y la de comparación (separa sin bordes).
const PAIR_GAP = 2

/** Geometría del BarChart: una columna por etiqueta, con barra de comparación opcional a la izquierda. */
export function useBarChart(input: () => BarInput, width: Ref<number>) {
  const count = computed(() => input().series.length)
  const paired = computed(() => input().compare.some((v) => v != null))
  const innerW = computed(() => Math.max(width.value - BAR_PAD.left - BAR_PAD.right, 10))
  const innerH = computed(() => input().height - BAR_PAD.top - BAR_PAD.bottom)
  const axis = computed(() => axisTicks([...input().series, ...input().compare], 4))
  const baseY = computed(() => BAR_PAD.top + innerH.value)

  const slot = computed(() => innerW.value / Math.max(count.value, 1))
  // La barra ocupa ~62% de su columna; con comparación, las dos juntas.
  const barW = computed(() => {
    const total = Math.min(slot.value * 0.6, paired.value ? 44 : 32)
    return paired.value ? (total - PAIR_GAP) / 2 : total
  })
  const radius = computed(() => Math.min(6, barW.value / 2))

  const y = (v: number) => BAR_PAD.top + (1 - v / axis.value.max) * innerH.value
  const center = (i: number) => BAR_PAD.left + slot.value * (i + 0.5)

  function bar(v: number | null | undefined, x: number) {
    if (v == null || v <= 0) return ''
    const top = y(v)
    return roundedTopBar(x, top, barW.value, baseY.value - top, radius.value)
  }

  const bars = computed(() =>
    input().series.map((v, i) => {
      const c = center(i)
      const curX = paired.value ? c + PAIR_GAP / 2 : c - barW.value / 2
      const prevX = c - PAIR_GAP / 2 - barW.value
      return {
        i,
        center: c,
        current: bar(v, curX),
        previous: paired.value ? bar(input().compare[i], prevX) : '',
        top: y(Math.max(v ?? 0, input().compare[i] ?? 0)),
      }
    }),
  )

  const gridLines = computed(() => axis.value.ticks.map((v) => ({ value: v, y: y(v) })))
  // Con poco ancho se muestra una etiqueta sí y otra no.
  const labelEvery = computed(() => (slot.value < 26 ? 2 : 1))

  const indexAt = (ratio: number) => {
    const px = ratio * width.value - BAR_PAD.left
    return Math.min(Math.max(Math.floor(px / slot.value), 0), Math.max(count.value - 1, 0))
  }

  return { count, paired, slot, baseY, bars, gridLines, labelEvery, indexAt }
}
