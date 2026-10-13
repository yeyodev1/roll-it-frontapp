import { computed } from 'vue'
import { site } from '@/config/site'
import { useUserStore } from '@/stores/user'

/** Ítems de navegación que le corresponden a quien inició sesión. */
export function useNav() {
  const userStore = useUserStore()
  const items = computed(() => site.nav.filter((item) => !item.adminOnly || userStore.isAdmin))
  return { items }
}
