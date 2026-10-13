import { computed, onUnmounted, ref, type MaybeRefOrGetter, toValue } from 'vue'
import { dashboardCopy } from '@/config/dashboardCopy'

// Un solo reloj para toda la app: avanza cada minuto mientras alguien lo use.
const now = ref(Date.now())
let users = 0
let timer: ReturnType<typeof setInterval> | null = null

function subscribe() {
  users += 1
  if (!timer) timer = setInterval(() => (now.value = Date.now()), 60_000)
}

function unsubscribe() {
  users -= 1
  if (users <= 0 && timer) {
    clearInterval(timer)
    timer = null
    users = 0
  }
}

export function timeAgo(iso: string | null | undefined, at = Date.now()): string {
  if (!iso) return ''
  const t = dashboardCopy.timeAgo
  const minutes = Math.max(0, Math.floor((at - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return t.now
  if (minutes < 60) return t.minutes(minutes)
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t.hours(hours)
  return t.days(Math.floor(hours / 24))
}

/** "hace 5 min" reactivo, que se refresca solo. */
export function useTimeAgo(iso: MaybeRefOrGetter<string | null | undefined>) {
  subscribe()
  onUnmounted(unsubscribe)
  return computed(() => timeAgo(toValue(iso), now.value))
}
