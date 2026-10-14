import { ref } from 'vue'
import { syncService } from '@/services/sync.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, SyncStatus } from '@/types'

export function useSettingsSync() {
  const toast = useToastStore()
  const items = ref<SyncStatus[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      items.value = await syncService.status()
    } catch (e) {
      error.value = (e as ApiError).message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, load }
}
