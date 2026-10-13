import { ref, shallowRef, watch, type Ref } from 'vue'
import { useFiltersStore } from '@/stores/filters'
import { useToastStore } from '@/stores/toast'
import type { DashboardQuery } from '@/services/dashboard.service'
import type { ApiError } from '@/types'

/**
 * Carga datos del panel y los recarga cada vez que cambian sucursal o fechas.
 *
 * Si el usuario cambia el filtro dos veces seguidas, solo cuenta la última
 * respuesta: una petición lenta no puede pisar a una más nueva.
 */
export function useDashboardData<T>(fetcher: (query: DashboardQuery) => Promise<T>) {
  const filters = useFiltersStore()
  const toast = useToastStore()

  const data = shallowRef<T | null>(null) as Ref<T | null>
  const loading = ref(true)
  const error = ref('')
  let lastRequest = 0

  async function load() {
    const id = ++lastRequest
    loading.value = true
    error.value = ''
    try {
      const result = await fetcher({ ...filters.query })
      if (id === lastRequest) data.value = result
    } catch (e) {
      if (id !== lastRequest) return
      error.value = (e as ApiError).message
      toast.error(error.value)
    } finally {
      if (id === lastRequest) loading.value = false
    }
  }

  watch(() => filters.query, load, { deep: true, immediate: true })

  return { data, loading, error, reload: load }
}
