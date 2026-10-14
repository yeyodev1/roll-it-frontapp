import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useBodyScroll } from './useBodyScroll'

const GAP = 6
const MARGIN = 8
// Bajo md (768px) el panel se abre como hoja inferior, con opciones grandes para el pulgar.
const MOBILE_QUERY = '(max-width: 767px)'

/**
 * Posición de un panel flotante anclado a su botón: debajo si cabe, arriba si
 * no, y nunca fuera de la pantalla. En el celular no se posiciona: es una hoja
 * inferior y congela el scroll del fondo.
 *
 * También cierra al tocar fuera (fuera del panel y fuera del ancla).
 */
export function usePopover(
  open: Ref<boolean>,
  anchor: () => HTMLElement | null,
  panel: Ref<HTMLElement | null>,
  options: { minWidth?: number; onOutside: () => void },
) {
  const mobile = ref(false)
  const style = ref<Record<string, string>>({})
  const placement = ref<'bottom' | 'top'>('bottom')
  let media: MediaQueryList | null = null

  function position() {
    const el = anchor()
    if (!open.value || mobile.value || !el) return
    const rect = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const width = Math.min(Math.max(rect.width, options.minWidth ?? 0), vw - MARGIN * 2)
    const left = Math.min(Math.max(rect.left, MARGIN), vw - width - MARGIN)
    const below = vh - rect.bottom - GAP - MARGIN
    const above = rect.top - GAP - MARGIN
    const wanted = Math.min(panel.value?.scrollHeight ?? 320, 360)
    const down = below >= wanted || below >= above
    placement.value = down ? 'bottom' : 'top'
    const base = {
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${Math.max(down ? below : above, 140)}px`,
    }
    style.value = down
      ? { ...base, top: `${rect.bottom + GAP}px` }
      : { ...base, bottom: `${vh - rect.top + GAP}px` }
  }

  function onPointer(event: PointerEvent) {
    const target = event.target as Node
    if (panel.value?.contains(target) || anchor()?.contains(target)) return
    options.onOutside()
  }

  function listen(on: boolean) {
    const method = on ? 'addEventListener' : 'removeEventListener'
    document[method]('pointerdown', onPointer as EventListener, true)
    window[method]('resize', position)
    // En captura: también se mueve si hace scroll un contenedor (la hoja de Ajustes, p. ej.).
    window[method]('scroll', position, true)
  }

  watch(open, async (value) => {
    if (value) {
      mobile.value = media?.matches ?? false
      await nextTick()
      position()
      listen(true)
    } else {
      listen(false)
    }
  })

  function onMedia() {
    mobile.value = media?.matches ?? false
    position()
  }

  onMounted(() => {
    media = window.matchMedia(MOBILE_QUERY)
    mobile.value = media.matches
    media.addEventListener('change', onMedia)
  })

  onBeforeUnmount(() => {
    listen(false)
    media?.removeEventListener('change', onMedia)
  })

  useBodyScroll(computed(() => open.value && mobile.value))

  return { mobile, style, placement, position }
}
