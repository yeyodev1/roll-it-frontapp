import { onBeforeUnmount, onMounted, ref, useTemplateRef, type Ref } from 'vue'

/**
 * Ancho real del contenedor de un gráfico. El SVG dibuja en píxeles reales
 * (viewBox = ancho × alto) para que barras redondeadas y trazos no se deformen
 * al estirarse; se recalcula con ResizeObserver al girar el celular o abrir el menú.
 *
 * El componente marca su contenedor con `ref="box"` (o el nombre que pase en `key`).
 */
export function useChartBox(fallback = 600, key = 'box'): { width: Ref<number> } {
  const box = useTemplateRef<HTMLElement>(key)
  const width = ref(fallback)
  let observer: ResizeObserver | null = null

  onMounted(() => {
    if (!box.value) return
    width.value = box.value.clientWidth || fallback
    observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry?.contentRect.width ?? 0)
      if (w > 0 && w !== width.value) width.value = w
    })
    observer.observe(box.value)
  })
  onBeforeUnmount(() => observer?.disconnect())

  return { width }
}
