import { computed, onMounted, onUnmounted, ref } from 'vue'
import { syncService } from '@/services/sync.service'
import type { AgentInfo, AgentState, SyncStatus } from '@/types'

// Mismo umbral que el back: con un aviso cada pocos minutos, 10 sin noticias es que se cayó.
const LIVE_MS = 10 * 60 * 1000
const POLL_MS = 60_000

// Estado de módulo: la barra de filtros y Ajustes comparten una sola consulta.
const statuses = ref<SyncStatus[]>([])
const loading = ref(false)
let users = 0
let timer: ReturnType<typeof setInterval> | null = null
let inflight: Promise<void> | null = null

/**
 * El estado se recalcula con la hora del navegador: si la página queda
 * abierta, un agente que deja de avisar pasa a "Sin conexión" sin recargar.
 */
export function agentState(agent: AgentInfo | undefined, now = Date.now()): AgentState {
  if (!agent?.lastSeenAt) return 'none'
  return now - new Date(agent.lastSeenAt).getTime() < LIVE_MS ? 'live' : 'offline'
}

async function load() {
  if (inflight) return inflight
  loading.value = true
  inflight = syncService
    .status()
    .then((data) => {
      statuses.value = data
    })
    .catch(() => {
      // La pastilla es secundaria: si falla se queda con lo último que tenía.
    })
    .finally(() => {
      loading.value = false
      inflight = null
    })
  return inflight
}

/** Estado de los agentes por sucursal, refrescado cada minuto mientras alguien lo muestre. */
export function useAgentStatus() {
  onMounted(() => {
    users += 1
    void load()
    if (!timer) timer = setInterval(load, POLL_MS)
  })
  onUnmounted(() => {
    users -= 1
    if (users <= 0 && timer) {
      clearInterval(timer)
      timer = null
      users = 0
    }
  })

  // Se recalcula con cada consulta (una por minuto), que es cuando puede cambiar.
  const byBranch = computed(
    () => new Map(statuses.value.map((s) => [s.branch._id, agentState(s.agent)])),
  )

  return { statuses, loading, byBranch, load }
}
