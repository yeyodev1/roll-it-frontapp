import { ref } from 'vue'
import { invoiceService } from '@/services/invoice.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Invoice, InvoiceStatus } from '@/types'

export function useInvoiceList() {
  const toast = useToastStore()
  const items = ref<Invoice[]>([])
  const page = ref(1)
  const pages = ref(1)
  const status = ref<InvoiceStatus | ''>('')
  const loading = ref(false)
  const error = ref('')

  async function load(branch: string) {
    loading.value = true
    error.value = ''
    try {
      const data = await invoiceService.list({
        branch: branch === 'all' ? '' : branch,
        status: status.value,
        page: page.value,
      })
      items.value = data.items
      pages.value = Math.max(1, data.pages)
    } catch (e) {
      error.value = (e as ApiError).message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  return { items, page, pages, status, loading, error, load }
}
