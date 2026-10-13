import { computed, ref } from 'vue'
import { inventoryService } from '@/services/inventory.service'
import { useInventoryIngredients } from './useInventoryIngredients'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { ApiError, IngredientUnit } from '@/types'

export interface InitialRow {
  id: string
  name: string
  unit: IngredientUnit
  original: number
  quantity: number | null
}

export function useInventoryInitial() {
  const toast = useToastStore()
  const { loadIngredients, active } = useInventoryIngredients()
  const rows = ref<InitialRow[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const search = ref('')

  const changed = computed(() =>
    rows.value.filter((r) => r.quantity !== null && Number(r.quantity) !== r.original),
  )

  async function load(branch: string) {
    if (!branch) {
      rows.value = []
      return
    }
    loading.value = true
    try {
      const [, stock] = await Promise.all([loadIngredients(), inventoryService.list(branch)])
      const current = new Map(stock.rows.map((r) => [r.ingredient._id, r.quantity]))
      rows.value = active.value.map((i) => {
        const original = current.get(i._id) ?? 0
        return { id: i._id, name: i.name, unit: i.unit, original, quantity: original }
      })
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  async function save(branch: string) {
    if (!branch || !changed.value.length || saving.value) return
    saving.value = true
    try {
      const items = changed.value.map((r) => ({ ingredient: r.id, quantity: Number(r.quantity) }))
      const result = await inventoryService.setInitial(branch, items)
      toast.success(inventoryCopy.initial.saved(result.updated))
      changed.value.forEach((r) => {
        r.original = Number(r.quantity)
      })
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return { rows, loading, saving, search, changed, load, save }
}
