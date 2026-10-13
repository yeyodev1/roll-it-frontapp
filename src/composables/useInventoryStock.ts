import { computed, ref } from 'vue'
import { inventoryService, type StockCounts } from '@/services/inventory.service'
import { useToastStore } from '@/stores/toast'
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

  async function load(branch: string) {
    loading.value = true
    try {
      const data = await inventoryService.list(branch)
      rows.value = data.rows
      counts.value = data.counts
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

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

  return { rows, counts, loading, status, search, filtered, load, replaceRow, toggleStatus }
}
