import { computed, ref, shallowRef } from 'vue'
import { syncService } from '@/services/sync.service'
import { branchService } from '@/services/branch.service'
import { useFiltersStore } from '@/stores/filters'
import { useToastStore } from '@/stores/toast'
import { dashboardCopy } from '@/config/dashboardCopy'
import type { ApiError, SalesReportResult } from '@/types'

const copy = dashboardCopy.salesUpload
const MAX_BYTES = 15 * 1024 * 1024
const ACCEPTED = /\.(xls|xlsx|csv)$/i
// Si el servidor no avanza (pending igual dos vueltas seguidas) se corta: nada de bucles eternos.
const MAX_ROUNDS = 20

export type UploadPhase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

/** Junta las vueltas de un mismo archivo: lo creado se suma, "sin cambios" es lo de la primera. */
function merge(prev: SalesReportResult | null, next: SalesReportResult): SalesReportResult {
  if (!prev) return next
  return {
    ...next,
    unchanged: prev.unchanged,
    created: prev.created + next.created,
    updated: prev.updated + next.updated,
    received: prev.received + next.received,
    inventoryApplied: prev.inventoryApplied + next.inventoryApplied,
    unmappedProducts: [...new Set([...prev.unmappedProducts, ...next.unmappedProducts])],
  }
}

/**
 * Sube el reporte de ventas de SmartMenu. Si el servidor no alcanza a cargarlo
 * todo (`pending > 0`), `resume()` re-sube el mismo archivo hasta terminar. Al
 * acabar recarga las sucursales: los filtros se re-anclan al nuevo último día
 * y las vistas del panel recargan.
 */
export function useSalesReportUpload(onDone?: (result: SalesReportResult) => void) {
  const filters = useFiltersStore()
  const toast = useToastStore()

  const phase = ref<UploadPhase>('idle')
  const progress = ref(0)
  const round = ref(0)
  const error = ref('')
  const file = shallowRef<File | null>(null)
  const branch = ref('auto')
  const result = shallowRef<SalesReportResult | null>(null)

  const busy = computed(() => phase.value === 'uploading' || phase.value === 'processing')
  const pending = computed(() => result.value?.pending ?? 0)

  function validate(f: File): string {
    if (!ACCEPTED.test(f.name)) return copy.wrongType
    if (f.size > MAX_BYTES) return copy.tooBig
    return ''
  }

  async function send(): Promise<SalesReportResult> {
    phase.value = 'uploading'
    progress.value = 0
    const slug = branch.value === 'auto' ? undefined : branch.value
    return syncService.upload(file.value!, slug, (ratio) => {
      progress.value = ratio
      if (ratio >= 1) phase.value = 'processing'
    })
  }

  async function finish(final: SalesReportResult) {
    phase.value = 'done'
    if (final.pending) return
    try {
      filters.setBranches(await branchService.list())
    } catch {
      // Las ventas ya quedaron cargadas: el refresco automático pondrá las fechas al día.
    }
    filters.bumpData()
    toast.success(copy.toast(final.created))
    onDone?.(final)
  }

  /** Re-sube el mismo archivo mientras queden tickets y el servidor avance. */
  async function loop(first: boolean) {
    error.value = ''
    if (first) {
      result.value = null
      round.value = 0
    }
    try {
      let last = -1
      do {
        round.value++
        result.value = merge(result.value, await send())
        if (result.value.pending === last) break
        last = result.value.pending
      } while (!first && result.value.pending > 0 && round.value < MAX_ROUNDS)
      await finish(result.value)
    } catch (e) {
      error.value = (e as ApiError).message
      phase.value = 'error'
    }
  }

  function start(f: File) {
    const invalid = validate(f)
    file.value = f
    if (invalid) {
      error.value = invalid
      phase.value = 'error'
      return
    }
    return loop(true)
  }

  function resume() {
    if (file.value && !busy.value) return loop(false)
  }

  function retry() {
    if (!file.value) return reset()
    return result.value ? loop(false) : start(file.value)
  }

  function reset() {
    phase.value = 'idle'
    progress.value = 0
    error.value = ''
    file.value = null
    result.value = null
    round.value = 0
  }

  return {
    phase,
    progress,
    round,
    error,
    file,
    branch,
    result,
    busy,
    pending,
    start,
    resume,
    retry,
    reset,
  }
}
