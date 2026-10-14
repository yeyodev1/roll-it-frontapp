import { ref } from 'vue'

/**
 * Punto activo de un gráfico bajo el puntero, el dedo o el teclado.
 * `count` es la cantidad de posiciones (días, meses); `indexAt` traduce la x
 * del puntero (0..1) a una de ellas.
 */
export function useChartHover(count: () => number, indexAt: (ratio: number) => number) {
  const active = ref<number | null>(null)

  function pick(event: PointerEvent) {
    const el = event.currentTarget as HTMLElement | null
    const rect = el?.getBoundingClientRect()
    if (!rect || !count()) return
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    active.value = indexAt(ratio)
  }

  // En táctil el tooltip se queda hasta el próximo toque; con mouse se va al salir.
  function leave(event: PointerEvent) {
    if (event.pointerType === 'mouse') active.value = null
  }

  function onKey(event: KeyboardEvent) {
    const n = count()
    if (!n) return
    const cur = active.value ?? n - 1
    if (event.key === 'ArrowRight') active.value = Math.min(cur + 1, n - 1)
    else if (event.key === 'ArrowLeft') active.value = Math.max(cur - 1, 0)
    else if (event.key === 'Escape') active.value = null
    else return
    event.preventDefault()
  }

  return { active, pick, leave, onKey, clear: () => (active.value = null) }
}
