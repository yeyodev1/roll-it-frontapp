import { computed, type Ref } from 'vue'
import { axisTicks, smoothPath, type Pt } from '@/utils/chartScale'

export interface AreaInput {
  labels: string[]
  series: number[]
  compare: (number | null)[]
  height: number
}

// Margen para las cifras del eje (izquierda) y las fechas (abajo).
export const AREA_PAD = { left: 46, right: 8, top: 12, bottom: 26 }

/** Geometría del AreaChart en píxeles reales: escalas, curvas y etiquetas del eje x. */
export function useAreaChart(input: () => AreaInput, width: Ref<number>) {
  const count = computed(() => input().series.length)
  const innerW = computed(() => Math.max(width.value - AREA_PAD.left - AREA_PAD.right, 10))
  const innerH = computed(() => input().height - AREA_PAD.top - AREA_PAD.bottom)
  const axis = computed(() => axisTicks([...input().series, ...input().compare], 4))

  const x = (i: number) =>
    AREA_PAD.left + (count.value <= 1 ? innerW.value / 2 : (i / (count.value - 1)) * innerW.value)
  const y = (v: number) => AREA_PAD.top + (1 - v / axis.value.max) * innerH.value
  const baseY = computed(() => AREA_PAD.top + innerH.value)

  const points = computed<Pt[]>(() => input().series.map((v, i) => ({ x: x(i), y: y(v) })))
  const line = computed(() => smoothPath(points.value))
  const area = computed(() => {
    const pts = points.value
    if (pts.length < 2) return ''
    return `${line.value} L${pts[pts.length - 1]!.x},${baseY.value} L${pts[0]!.x},${baseY.value} Z`
  })

  // La comparación puede tener huecos (null): se dibuja por tramos.
  const compareLine = computed(() => {
    const parts: Pt[][] = [[]]
    input()
      .compare.slice(0, count.value)
      .forEach((v, i) => {
        if (v === null || v === undefined) {
          if (parts[parts.length - 1]!.length) parts.push([])
        } else parts[parts.length - 1]!.push({ x: x(i), y: y(v) })
      })
    return parts
      .filter((p) => p.length > 1)
      .map(smoothPath)
      .join(' ')
  })

  const gridLines = computed(() => axis.value.ticks.map((v) => ({ value: v, y: y(v) })))

  // Una etiqueta cada ~80px: en el celular salen 4, en escritorio hasta 8.
  const xLabels = computed(() => {
    const n = count.value
    if (!n) return []
    const slots = Math.max(2, Math.min(n, Math.floor(innerW.value / 80)))
    const idx = new Set<number>()
    for (let k = 0; k < slots; k++) idx.add(Math.round((k * (n - 1)) / Math.max(slots - 1, 1)))
    return [...idx].map((i, k, all) => ({
      i,
      x: x(i),
      text: input().labels[i] ?? '',
      anchor: k === 0 ? 'start' : k === all.length - 1 ? 'end' : 'middle',
    }))
  })

  const indexAt = (ratio: number) => {
    const px = ratio * width.value
    const r = (px - AREA_PAD.left) / innerW.value
    return Math.min(Math.max(Math.round(r * (count.value - 1)), 0), Math.max(count.value - 1, 0))
  }

  return { count, x, y, baseY, line, area, compareLine, gridLines, xLabels, indexAt }
}
