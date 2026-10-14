import { reactive, ref, watch } from 'vue'
import { inventoryService } from '@/services/inventory.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Movement, MovementType } from '@/types'

const PAGE_SIZE = 30

export function useInventoryMovements() {
  const toast = useToastStore()
  const items = ref<Movement[]>([])
  const total = ref(0)
  const pages = ref(1)
  const page = ref(1)
  const loading = ref(false)
  const error = ref('')
  const filters = reactive({ branch: '', ingredient: '', type: '' as MovementType | '' })

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const data = await inventoryService.movements({
        branch: filters.branch === 'all' ? '' : filters.branch,
        ingredient: filters.ingredient,
        type: filters.type,
        page: page.value,
        limit: PAGE_SIZE,
      })
      items.value = data.items
      total.value = data.total
      pages.value = Math.max(1, data.pages)
    } catch (e) {
      error.value = (e as ApiError).message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Cambiar un filtro vuelve a la primera página; cambiar de página solo recarga.
  watch(
    () => ({ ...filters }),
    () => {
      if (page.value !== 1) page.value = 1
      else load()
    },
  )
  watch(page, load)

  return { items, total, pages, page, loading, error, filters, load }
}
