import { computed, reactive, ref } from 'vue'
import { invoiceService, type InvoiceLinePayload } from '@/services/invoice.service'
import { useInventoryIngredients } from './useInventoryIngredients'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'
import type { ApiError, Invoice } from '@/types'

const copy = inventoryCopy.invoice

export interface LineDraft {
  key: number
  rawName: string
  ingredient: string | null
  quantity: number | null
  rawQuantity: number
  rawUnit: string
  totalDollars: number | null
}

let nextKey = 1

function toDraft(line: Invoice['lines'][number]): LineDraft {
  return {
    key: nextKey++,
    rawName: line.rawName,
    ingredient: line.ingredient?._id || null,
    quantity: line.quantity,
    rawQuantity: line.rawQuantity,
    rawUnit: line.rawUnit,
    totalDollars: line.totalCents ? line.totalCents / 100 : null,
  }
}

function toPayload(line: LineDraft): InvoiceLinePayload {
  const quantity = Number(line.quantity) || 0
  const totalCents = Math.round((Number(line.totalDollars) || 0) * 100)
  return {
    rawName: line.rawName,
    ingredient: line.ingredient,
    quantity,
    rawQuantity: line.rawQuantity,
    rawUnit: line.rawUnit,
    totalCents,
    unitCostCents: quantity ? Math.round(totalCents / quantity) : 0,
  }
}

export function useInvoiceEditor() {
  const toast = useToastStore()
  const { loadIngredients, byId } = useInventoryIngredients()
  const invoice = ref<Invoice | null>(null)
  const loading = ref(false)
  const busy = ref(false)
  const form = reactive({ supplier: '', invoiceNumber: '', date: '' })
  const lines = ref<LineDraft[]>([])

  const editable = computed(() => invoice.value?.status === 'review')
  const unlinked = computed(() => lines.value.filter((l) => !l.ingredient).length)
  const totalCents = computed(() =>
    lines.value.reduce((sum, l) => sum + Math.round((Number(l.totalDollars) || 0) * 100), 0),
  )

  // Lo que va a entrar al stock, en palabras: "+2,5 kg Salmón".
  const summary = computed(() =>
    lines.value
      .filter((l) => l.ingredient && Number(l.quantity) > 0)
      .map((l) => {
        const ingredient = byId(l.ingredient)
        return `+${formatQty(Number(l.quantity), ingredient?.unit)} ${ingredient?.name || l.rawName}`
      }),
  )

  function fill(data: Invoice) {
    invoice.value = data
    form.supplier = data.supplier
    form.invoiceNumber = data.invoiceNumber
    form.date = data.date ? data.date.slice(0, 10) : ''
    lines.value = data.lines.map(toDraft)
  }

  async function load(id: string) {
    loading.value = true
    try {
      const [data] = await Promise.all([invoiceService.getOne(id), loadIngredients()])
      fill(data)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  function addLine() {
    lines.value.push({
      key: nextKey++,
      rawName: '',
      ingredient: null,
      quantity: null,
      rawQuantity: 0,
      rawUnit: '',
      totalDollars: null,
    })
  }

  function removeLine(key: number) {
    lines.value = lines.value.filter((l) => l.key !== key)
  }

  async function run(action: () => Promise<Invoice>, message: string) {
    if (busy.value) return false
    busy.value = true
    try {
      fill(await action())
      toast.success(message)
      return true
    } catch (e) {
      toast.error((e as ApiError).message)
      return false
    } finally {
      busy.value = false
    }
  }

  function payload() {
    return {
      supplier: form.supplier.trim(),
      invoiceNumber: form.invoiceNumber.trim(),
      date: form.date || undefined,
      lines: lines.value.map(toPayload),
    }
  }

  const id = () => invoice.value!._id
  const save = () => run(() => invoiceService.update(id(), payload()), copy.saved)
  // Se guarda antes de confirmar para que lo que se suma sea lo que se ve en pantalla.
  const confirm = () =>
    run(async () => {
      await invoiceService.update(id(), payload())
      return invoiceService.confirm(id())
    }, copy.confirmed)
  const reject = () => run(() => invoiceService.reject(id()), copy.rejected)

  return {
    invoice,
    loading,
    busy,
    form,
    lines,
    editable,
    unlinked,
    totalCents,
    summary,
    load,
    addLine,
    removeLine,
    save,
    confirm,
    reject,
  }
}
