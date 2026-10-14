import { computed } from 'vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useUserStore } from '@/stores/user'

/** Iniciales, nombre y tipo de cuenta de quien inició sesión (avatar de la barra lateral y superior). */
export function useAccount() {
  const userStore = useUserStore()

  const initials = computed(() => {
    const name = userStore.user?.name || userStore.user?.email || ''
    return name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  })
  const name = computed(() => userStore.user?.name || dashboardCopy.layout.account)
  const role = computed(() => dashboardCopy.account.roles[userStore.user?.accountType ?? ''] ?? '')

  return { initials, name, role }
}
