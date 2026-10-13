import { computed, ref, watch, type Ref } from 'vue'
import { inventoryService } from '@/services/inventory.service'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { ApiError, StockRow } from '@/types'

const copy = inventoryCopy.adjust

export function useInventoryAdjust(row: Ref<StockRow | null>, onSaved: (row: StockRow) => void) {
  const toast = useToastStore()
  const quantity = ref<number | null>(null)
  const type = ref<'adjustment' | 'waste'>('waste')
  const note = ref('')
  const minStock = ref(0)
  const maxStock = ref(0)
  const saving = ref(false)

  watch(
    row,
    (value) => {
      quantity.value = null
      type.value = 'waste'
      note.value = ''
      minStock.value = value?.minStock ?? 0
      maxStock.value = value?.maxStock ?? 0
    },
    { immediate: true },
  )

  // La merma siempre resta: si escriben "2" en merma se entiende "−2".
  const signed = computed(() => {
    const value = Number(quantity.value) || 0
    return type.value === 'waste' ? -Math.abs(value) : value
  })

  const preview = computed(() => (row.value ? row.value.quantity + signed.value : 0))

  async function saveAdjust() {
    if (!row.value || saving.value) return
    if (!signed.value) return toast.error(copy.quantityRequired)
    if (!note.value.trim()) return toast.error(copy.noteRequired)
    saving.value = true
    try {
      const updated = await inventoryService.adjust({
        branch: row.value.branch._id,
        ingredient: row.value.ingredient._id,
        quantity: signed.value,
        type: type.value,
        note: note.value.trim(),
      })
      toast.success(copy.saved)
      onSaved(updated)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  async function saveThresholds() {
    if (!row.value || saving.value) return
    saving.value = true
    try {
      const updated = await inventoryService.setThresholds({
        branch: row.value.branch._id,
        ingredient: row.value.ingredient._id,
        minStock: Number(minStock.value) || 0,
        maxStock: Number(maxStock.value) || 0,
      })
      toast.success(copy.thresholdsSaved)
      onSaved(updated)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return {
    quantity,
    type,
    note,
    minStock,
    maxStock,
    saving,
    signed,
    preview,
    saveAdjust,
    saveThresholds,
  }
}
