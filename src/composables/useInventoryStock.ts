import { computed, ref } from 'vue'
import { inventoryService, type StockCounts } from '@/services/inventory.service'
import { useToastStore } from '@/stores/toast'
import { useAutoRefresh } from './useAutoRefresh'
import type { ApiError, StockRow, StockStatus } from '@/types'

/** Quita tildes y mayúsculas para que "salmon" encuentre "Salmón". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Lo urgente primero: agotado, por acabarse, sobrestock y al final lo que está bien.
const ORDER: Record<StockStatus, number> = { out: 0, low: 1, over: 2, ok: 3 }

export function useInventoryStock() {
  const toast = useToastStore()
  const rows = ref<StockRow[]>([])
  const counts = ref<StockCounts>({ out: 0, low: 0, ok: 0, over: 0 })
  const loading = ref(false)
  const error = ref('')
  const status = ref<StockStatus | ''>('')
  const search = ref('')

  const filtered = computed(() => {
    const term = normalize(search.value)
    return rows.value
      .filter((r) => !status.value || r.status === status.value)
      .filter((r) => !term || normalize(r.ingredient.name).includes(term))
      .sort(
        (a, b) =>
          ORDER[a.status] - ORDER[b.status] ||
          a.ingredient.name.localeCompare(b.ingredient.name, 'es'),
      )
  })

  let current: string | null = null
  let lastRequest = 0

  /**
   * `silent` es el refresco en segundo plano: no pinta skeleton y, si falla,
   * deja la lista que ya se ve sin repetir el aviso.
   */
  async function load(branch: string, silent = false) {
    current = branch
    const id = ++lastRequest
    if (!silent) {
      loading.value = true
      error.value = ''
    }
    try {
      const data = await inventoryService.list(branch)
      if (id !== lastRequest) return
      rows.value = data.rows
      counts.value = data.counts
      error.value = ''
      auto.markFresh()
    } catch (e) {
      if (id !== lastRequest || (silent && rows.value.length)) return
      error.value = (e as ApiError).message
      toast.error(error.value)
    } finally {
      if (id === lastRequest && !silent) loading.value = false
    }
  }

  // El stock baja con cada venta que llega de SmartMenu: se refresca solo cada minuto.
  const auto = useAutoRefresh(async () => {
    if (current !== null && !loading.value) await load(current, true)
  })

  /** Reemplaza la fila tras un ajuste sin recargar toda la lista. */
  function replaceRow(row: StockRow) {
    const index = rows.value.findIndex(
      (r) => r.ingredient._id === row.ingredient._id && r.branch._id === row.branch._id,
    )
    if (index === -1) return
    const previous = rows.value[index]!.status
    rows.value.splice(index, 1, row)
    if (previous !== row.status) {
      counts.value = { ...counts.value, [previous]: counts.value[previous] - 1 }
      counts.value = { ...counts.value, [row.status]: counts.value[row.status] + 1 }
    }
  }

  function toggleStatus(value: StockStatus) {
    status.value = status.value === value ? '' : value
  }

  return {
    rows,
    counts,
    loading,
    error,
    status,
    search,
    filtered,
    load,
    replaceRow,
    toggleStatus,
    updatedAt: auto.updatedAt,
    refreshing: auto.refreshing,
  }
}
