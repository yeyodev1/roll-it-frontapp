import { getCurrentScope, onScopeDispose, ref } from 'vue'

const DEFAULT_INTERVAL = 60_000
// Volver a la pestaña al toque no debe disparar otra petición si la última es reciente.
const MIN_GAP = 15_000

/**
 * Refresco en segundo plano: cada `interval` ms mientras la pestaña está a la
 * vista y apenas el usuario vuelve a ella. No muestra skeleton: quien lo usa
 * solo cambia los datos cuando la respuesta llega.
 *
 * `markFresh()` lo llama quien carga cada vez que trae datos nuevos, para que
 * "Actualizado hace X" y el reloj partan de ahí.
 */
export function useAutoRefresh(refresh: () => Promise<unknown>, interval = DEFAULT_INTERVAL) {
  const updatedAt = ref<string | null>(null)
  const refreshing = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  function markFresh() {
    updatedAt.value = new Date().toISOString()
  }

  async function tick() {
    if (refreshing.value || document.visibilityState !== 'visible') return
    refreshing.value = true
    try {
      await refresh()
    } finally {
      refreshing.value = false
    }
  }

  function onVisible() {
    if (document.visibilityState !== 'visible') return
    const last = updatedAt.value ? Date.parse(updatedAt.value) : 0
    if (Date.now() - last > MIN_GAP) tick()
  }

  function start() {
    if (timer) return
    timer = setInterval(tick, interval)
    document.addEventListener('visibilitychange', onVisible)
  }

  function stop() {
    if (timer) clearInterval(timer)
    timer = null
    document.removeEventListener('visibilitychange', onVisible)
  }

  start()
  // onScopeDispose cubre el desmontaje del componente (equivale a onUnmounted).
  if (getCurrentScope()) onScopeDispose(stop)

  return { updatedAt, refreshing, markFresh, stop }
}
