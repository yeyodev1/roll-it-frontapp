import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { invoiceService } from '@/services/invoice.service'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { ApiError } from '@/types'

export function useInvoiceUpload() {
  const router = useRouter()
  const toast = useToastStore()
  const preview = ref('')
  const uploading = ref(false)

  function clearPreview() {
    if (preview.value) URL.revokeObjectURL(preview.value)
    preview.value = ''
  }

  async function upload(file: File, branch: string) {
    if (!branch) return toast.error(inventoryCopy.invoices.branchFirst)
    clearPreview()
    preview.value = URL.createObjectURL(file)
    uploading.value = true
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('branch', branch)
      const invoice = await invoiceService.upload(form)
      toast.success(inventoryCopy.invoices.uploaded)
      router.push({ name: 'InvoiceDetail', params: { id: invoice._id } })
    } catch (e) {
      toast.error((e as ApiError).message)
      clearPreview()
    } finally {
      uploading.value = false
    }
  }

  onBeforeUnmount(clearPreview)

  return { preview, uploading, upload }
}
