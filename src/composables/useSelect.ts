import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { normalize } from './useInventoryStock'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  icon?: string
  /** Texto chico a la derecha ("kg", "3 sucursales"). */
  hint?: string
  /** Texto extra que también encuentra el buscador (alias de un insumo, p. ej.). */
  keywords?: string
}

const TYPEAHEAD_MS = 600

/**
 * Comportamiento de AppSelect como listbox accesible: opción activa, flechas,
 * Inicio/Fin, Enter/Espacio, Esc, búsqueda y "typeahead" (escribir las primeras
 * letras salta a la opción). El componente solo pinta.
 */
export function useSelect<T extends string>(
  options: () => SelectOption<T>[],
  model: Ref<T | undefined>,
  config: {
    searchable: () => boolean
    optionId: (index: number) => string
    focusTrigger: () => void
    focusInside: () => void
  },
) {
  const open = ref(false)
  const query = ref('')
  const active = ref(-1)
  let buffer = ''
  let bufferTimer: ReturnType<typeof setTimeout> | null = null

  const selected = computed(() => options().find((o) => o.value === model.value) ?? null)

  const filtered = computed(() => {
    const term = normalize(query.value)
    if (!term) return options()
    return options().filter((o) =>
      normalize(`${o.label} ${o.hint ?? ''} ${o.keywords ?? ''}`).includes(term),
    )
  })

  // La opción activa siempre a la vista al moverse con el teclado.
  watch(active, async (i) => {
    await nextTick()
    if (i >= 0) document.getElementById(config.optionId(i))?.scrollIntoView({ block: 'nearest' })
  })

  // La búsqueda cambia la lista: la primera coincidencia queda lista para Enter.
  watch(query, () => (active.value = filtered.value.length ? 0 : -1))

  async function show() {
    if (open.value) return
    query.value = ''
    const index = filtered.value.findIndex((o) => o.value === model.value)
    active.value = index >= 0 ? index : filtered.value.length ? 0 : -1
    open.value = true
    await nextTick()
    config.focusInside()
  }

  function hide(refocus = true) {
    if (!open.value) return
    open.value = false
    if (refocus) config.focusTrigger()
  }

  function choose(option: SelectOption<T> | undefined) {
    if (!option) return
    model.value = option.value
    hide()
  }

  function move(delta: number) {
    const n = filtered.value.length
    if (!n) return
    active.value = active.value < 0 ? 0 : (active.value + delta + n) % n
  }

  function typeahead(key: string) {
    buffer += normalize(key)
    if (bufferTimer) clearTimeout(bufferTimer)
    bufferTimer = setTimeout(() => (buffer = ''), TYPEAHEAD_MS)
    const list = filtered.value
    // Repetir la misma letra recorre las opciones que empiezan con ella.
    const same = buffer.split('').every((c) => c === buffer[0])
    const term = same ? buffer[0]! : buffer
    const start = same ? active.value + 1 : Math.max(active.value, 0)
    for (let i = 0; i < list.length; i++) {
      const index = (start + i) % list.length
      if (normalize(list[index]!.label).startsWith(term)) {
        active.value = index
        return
      }
    }
  }

  const printable = (e: KeyboardEvent) =>
    e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey

  function onTriggerKey(event: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      show()
    } else if (printable(event)) {
      event.preventDefault()
      show().then(() => {
        if (config.searchable()) query.value = event.key
        else typeahead(event.key)
      })
    }
  }

  function onListKey(event: KeyboardEvent) {
    const typing = config.searchable()
    const handlers: Record<string, () => void> = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => (active.value = filtered.value.length ? 0 : -1),
      End: () => (active.value = filtered.value.length - 1),
      Enter: () => choose(filtered.value[active.value]),
      Tab: () => hide(false),
    }
    // Con buscador, Espacio escribe; sin buscador, elige.
    if (!typing) handlers[' '] = () => choose(filtered.value[active.value])
    if (typing && (event.key === 'Home' || event.key === 'End')) return
    const handler = handlers[event.key]
    if (handler) {
      if (event.key !== 'Tab') event.preventDefault()
      handler()
    } else if (!typing && printable(event)) {
      typeahead(event.key)
    }
  }

  return { open, query, active, selected, filtered, show, hide, choose, onTriggerKey, onListKey }
}
