import { ref } from 'vue'
import { syncService } from '@/services/sync.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, SyncStatus } from '@/types'

export function useSettingsSync() {
  const toast = useToastStore()
  const items = ref<SyncStatus[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      items.value = await syncService.status()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, load }
}
