import { ref } from 'vue'
import { invoiceService } from '@/services/invoice.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Invoice, InvoiceStatus } from '@/types'

export type InvoiceCounts = Record<InvoiceStatus, number>

const STATUSES: InvoiceStatus[] = ['review', 'confirmed', 'rejected']

export function useInvoiceList() {
  const toast = useToastStore()
  const items = ref<Invoice[]>([])
  const page = ref(1)
  const pages = ref(1)
  const total = ref(0)
  const status = ref<InvoiceStatus | ''>('')
  const counts = ref<InvoiceCounts>({ review: 0, confirmed: 0, rejected: 0 })
  const loading = ref(false)
  const error = ref('')

  /**
   * Cuántas hay por estado en la sucursal: el total de cada lista filtrada.
   * Si falla no se avisa: la lista principal ya muestra el error.
   */
  async function loadCounts(branch: string) {
    const scope = branch === 'all' ? '' : branch
    try {
      const totals = await Promise.all(
        STATUSES.map((s) => invoiceService.list({ branch: scope, status: s, page: 1 })),
      )
      counts.value = Object.fromEntries(
        STATUSES.map((s, i) => [s, totals[i]!.total]),
      ) as InvoiceCounts
    } catch {
      // sin contadores
    }
  }

  async function load(branch: string, withCounts = false) {
    loading.value = true
    error.value = ''
    if (withCounts) loadCounts(branch)
    try {
      const data = await invoiceService.list({
        branch: branch === 'all' ? '' : branch,
        status: status.value,
        page: page.value,
      })
      items.value = data.items
      total.value = data.total
      pages.value = Math.max(1, data.pages)
    } catch (e) {
      error.value = (e as ApiError).message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  return { items, page, pages, total, status, counts, loading, error, load }
}
