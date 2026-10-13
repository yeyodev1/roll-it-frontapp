import { computed, ref, type Ref } from 'vue'

export const CHART_W = 600
export const CHART_H = 200
const PAD_TOP = 8

function niceCeil(value: number): number {
  if (value <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(value))
  const f = value / exp
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * exp
}

interface LineInput {
  labels: string[]
  series: number[]
  compare: (number | null)[]
}

/**
 * Geometría e interacción del LineChart: escalas, paths SVG y el punto activo
 * bajo el dedo/puntero/teclado. El componente solo pinta.
 */
export function useLineChart(input: () => LineInput, box: Ref<HTMLElement | null>) {
  const count = computed(() => input().series.length)
  const max = computed(() =>
    niceCeil(Math.max(...input().series, ...input().compare.map((v) => v ?? 0), 0)),
  )
  const ticks = computed(() =>
    [1, 0.5, 0].map((t) => ({ value: max.value * t, top: (1 - t) * 100 })),
  )

  function x(i: number): number {
    return count.value <= 1 ? CHART_W / 2 : (i / (count.value - 1)) * CHART_W
  }
  function y(v: number): number {
    return PAD_TOP + (1 - v / max.value) * (CHART_H - PAD_TOP)
  }

  function pathOf(values: (number | null)[]): string {
    let d = ''
    let pen = false
    values.forEach((v, i) => {
      if (v === null || v === undefined) {
        pen = false
        return
      }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `
      pen = true
    })
    return d.trim()
  }

  const mainPath = computed(() => pathOf(input().series))
  const comparePath = computed(() => pathOf(input().compare.slice(0, count.value)))
  const areaPath = computed(() =>
    count.value > 1 ? `${mainPath.value} L${CHART_W},${CHART_H} L0,${CHART_H} Z` : '',
  )

  const active = ref<number | null>(null)

  function pick(event: PointerEvent) {
    const rect = box.value?.getBoundingClientRect()
    if (!rect || !count.value) return
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    active.value = Math.round(ratio * (count.value - 1))
  }

  // En táctil el tooltip se queda hasta el próximo toque; con mouse se va al salir.
  function leave(event: PointerEvent) {
    if (event.pointerType === 'mouse') active.value = null
  }

  function onKey(event: KeyboardEvent) {
    if (!count.value) return
    const cur = active.value ?? count.value - 1
    if (event.key === 'ArrowRight') active.value = Math.min(cur + 1, count.value - 1)
    else if (event.key === 'ArrowLeft') active.value = Math.max(cur - 1, 0)
    else if (event.key === 'Escape') active.value = null
    else return
    event.preventDefault()
  }

  const activeLeft = computed(() => (active.value === null ? 0 : (x(active.value) / CHART_W) * 100))
  const activeTop = computed(() =>
    active.value === null ? 0 : (y(input().series[active.value] ?? 0) / CHART_H) * 100,
  )
  const tipAlign = computed(() =>
    activeLeft.value < 18 ? 'start' : activeLeft.value > 82 ? 'end' : 'mid',
  )

  const xLabels = computed(() => {
    const n = count.value
    if (!n) return []
    const idx = n <= 2 ? [...Array(n).keys()] : [0, Math.floor((n - 1) / 2), n - 1]
    return idx.map((i) => ({ text: input().labels[i] ?? '', left: (x(i) / CHART_W) * 100 }))
  })

  return {
    ticks,
    y,
    mainPath,
    comparePath,
    areaPath,
    active,
    activeLeft,
    activeTop,
    tipAlign,
    xLabels,
    pick,
    leave,
    onKey,
  }
}
