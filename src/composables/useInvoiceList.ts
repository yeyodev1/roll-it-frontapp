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

  async function load(branch: string) {
    loading.value = true
    try {
      const data = await invoiceService.list({
        branch: branch === 'all' ? '' : branch,
        status: status.value,
        page: page.value,
      })
      items.value = data.items
      pages.value = Math.max(1, data.pages)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  return { items, page, pages, status, loading, load }
}
