import { ref } from 'vue'
import { inventoryService } from '@/services/inventory.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, StockRow } from '@/types'

export function useInventoryAsk() {
  const toast = useToastStore()
  const question = ref('')
  const answer = ref('')
  const rows = ref<StockRow[]>([])
  const asking = ref(false)

  async function ask(branch: string) {
    const q = question.value.trim()
    if (!q || asking.value) return
    asking.value = true
    try {
      const data = await inventoryService.ask(q, branch === 'all' ? '' : branch)
      answer.value = data.answer
      rows.value = data.rows
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      asking.value = false
    }
  }

  function clear() {
    question.value = ''
    answer.value = ''
    rows.value = []
  }

  return { question, answer, rows, asking, ask, clear }
}
