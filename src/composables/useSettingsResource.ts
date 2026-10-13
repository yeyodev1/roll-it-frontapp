import { ref, type Ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { ApiError } from '@/types'

interface ResourceOptions<T, F> {
  load: () => Promise<T[]>
  idOf: (item: T) => string
  empty: () => F
  toForm: (item: T) => F
  /** Convierte el formulario en el body del API (p. ej. dólares → centavos). */
  toPayload?: (form: F, editingId: string | null) => unknown
  create?: (payload: never) => Promise<T>
  update: (id: string, payload: never) => Promise<T>
  validate?: (form: F, editingId: string | null) => string | null
}

/**
 * CRUD de una pestaña de Ajustes: lista, formulario en hoja lateral y
 * activar/desactivar. Cada pestaña solo declara cómo se ve su formulario.
 */
export function useSettingsResource<T, F extends object>(options: ResourceOptions<T, F>) {
  const toast = useToastStore()
  const copy = inventoryCopy.settings
  const items = ref([]) as Ref<T[]>
  const loading = ref(false)
  const saving = ref(false)
  const sheetOpen = ref(false)
  const editingId = ref<string | null>(null)
  const form = ref(options.empty()) as Ref<F>

  async function load() {
    loading.value = true
    try {
      items.value = await options.load()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  function openNew() {
    editingId.value = null
    form.value = options.empty()
    sheetOpen.value = true
  }

  function openEdit(item: T) {
    editingId.value = options.idOf(item)
    form.value = options.toForm(item)
    sheetOpen.value = true
  }

  function replace(item: T) {
    const id = options.idOf(item)
    const index = items.value.findIndex((i) => options.idOf(i) === id)
    if (index === -1) items.value.unshift(item)
    else items.value.splice(index, 1, item)
  }

  async function save() {
    if (saving.value) return
    const error = options.validate?.(form.value, editingId.value)
    if (error) return toast.error(error)
    const payload = (
      options.toPayload ? options.toPayload(form.value, editingId.value) : form.value
    ) as never
    saving.value = true
    try {
      const item = editingId.value
        ? await options.update(editingId.value, payload)
        : await options.create!(payload)
      replace(item)
      toast.success(editingId.value ? copy.saved : copy.created)
      sheetOpen.value = false
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  async function toggleActive(item: T & { isActive: boolean }) {
    try {
      replace(await options.update(options.idOf(item), { isActive: !item.isActive } as never))
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  return {
    items,
    loading,
    saving,
    sheetOpen,
    editingId,
    form,
    load,
    openNew,
    openEdit,
    save,
    toggleActive,
  }
}
