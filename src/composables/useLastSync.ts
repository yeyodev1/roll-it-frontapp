import { computed, ref } from 'vue'
import { useFiltersStore } from '@/stores/filters'

// Lo publica la vista que ya trajo el dato fresco (el resumen del CEO trae lastSyncAt).
// Se guarda con la sucursal a la que corresponde para no mostrarlo en otra.
const reported = ref<{ branch: string; value: string | null } | null>(null)

/**
 * Cuándo llegó la última venta desde SmartMenu para la sucursal elegida.
 *
 * Usa lo último que reportó una vista; si ninguna lo hizo, lo deduce de las
 * sucursales cargadas al arrancar.
 */
export function useLastSync() {
  const filters = useFiltersStore()

  const fromBranches = computed(() => {
    const list =
      filters.branch === 'all'
        ? filters.branches
        : filters.branches.filter((b) => b._id === filters.branch)
    const dates = list.map((b) => b.lastSyncAt).filter((d): d is string => Boolean(d))
    if (!dates.length) return null
    return dates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
  })

  const lastSyncAt = computed(() =>
    reported.value?.branch === filters.branch ? reported.value.value : fromBranches.value,
  )

  function report(value: string | null) {
    reported.value = { branch: filters.branch, value }
  }

  return { lastSyncAt, report }
}
