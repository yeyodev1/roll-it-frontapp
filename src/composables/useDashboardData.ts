import { ref, shallowRef, watch, type Ref } from 'vue'
import { useFiltersStore } from '@/stores/filters'
import { useToastStore } from '@/stores/toast'
import { useAutoRefresh } from './useAutoRefresh'
import type { DashboardQuery } from '@/services/dashboard.service'
import type { ApiError } from '@/types'

interface DashboardOptions {
  /** Algo extra que recargar en cada refresco (el CEO recarga sucursales y con eso `dataUntil`). */
  onRefresh?: () => Promise<unknown>
}

/**
 * Carga datos del panel, los recarga cada vez que cambian sucursal o fechas y
 * los refresca solos en segundo plano (cada minuto y al volver a la pestaña).
 *
 * - `loading` solo es true en la carga inicial o al cambiar el filtro: es lo
 *   que pinta el skeleton. Los refrescos cambian los datos sin parpadeo.
 * - Si el usuario cambia el filtro dos veces seguidas, solo cuenta la última
 *   respuesta: una petición lenta no puede pisar a una más nueva.
 * - No pide nada hasta que hay sucursales (`filters.ready`): el rango ya está
 *   anclado al último día con datos y no se hace una petición de más.
 */
export function useDashboardData<T>(
  fetcher: (query: DashboardQuery) => Promise<T>,
  options: DashboardOptions = {},
) {
  const filters = useFiltersStore()
  const toast = useToastStore()

  const data = shallowRef<T | null>(null) as Ref<T | null>
  const loading = ref(true)
  const error = ref('')
  let lastRequest = 0

  async function fetchNow(silent: boolean) {
    const id = ++lastRequest
    if (!silent) {
      loading.value = true
      error.value = ''
    }
    try {
      const result = await fetcher({ ...filters.query })
      if (id !== lastRequest) return
      data.value = result
      error.value = ''
      auto.markFresh()
    } catch (e) {
      if (id !== lastRequest) return
      const message = (e as ApiError).message
      // Un refresco fallido no tapa los datos que ya se ven ni repite el aviso cada minuto.
      if (silent && data.value) return
      error.value = message
      toast.error(message)
    } finally {
      if (id === lastRequest && !silent) loading.value = false
    }
  }

  async function refresh() {
    if (!filters.ready || loading.value) return
    // Las sucursales primero: si cambia `dataUntil`, el rango se re-ancla y el
    // watcher hace la carga completa; si no, basta con refrescar en silencio.
    const before = filters.queryString
    if (options.onRefresh) await options.onRefresh().catch(() => undefined)
    if (filters.queryString === before) await fetchNow(true)
  }

  const auto = useAutoRefresh(refresh)

  watch(
    () => [filters.ready, filters.queryString, filters.dataVersion] as const,
    ([ready]) => {
      if (ready) fetchNow(false)
    },
    { immediate: true },
  )

  return {
    data,
    loading,
    error,
    updatedAt: auto.updatedAt,
    refreshing: auto.refreshing,
    reload: () => fetchNow(false),
  }
}
