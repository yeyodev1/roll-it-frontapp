import { computed } from 'vue'
import { useFiltersStore } from '@/stores/filters'
import { useUserStore } from '@/stores/user'
import { branchService } from '@/services/branch.service'

let pending: Promise<void> | null = null

/**
 * Sucursal con la que trabaja una pantalla de inventario o facturas.
 *
 * El personal queda fijo en la suya (el backend igual la fuerza). El dueño
 * comparte la elección con el resto del panel vía `useFiltersStore`; las
 * pantallas que escriben stock (`allowAll: false`) no aceptan "todas".
 */
export function useInventoryBranch(options: { allowAll?: boolean } = {}) {
  const allowAll = options.allowAll ?? true
  const filters = useFiltersStore()
  const userStore = useUserStore()

  const isStaff = computed(() => userStore.isStaff)
  const branches = computed(() => filters.branches.filter((b) => b.isActive))

  const branch = computed<string>({
    get() {
      if (userStore.isStaff) return userStore.user?.branch || ''
      if (!allowAll && filters.branch === 'all') return ''
      return filters.branch
    },
    set(value) {
      if (userStore.isStaff) return
      filters.branch = value || 'all'
    },
  })

  const branchName = computed(
    () => filters.branches.find((b) => b._id === branch.value)?.name || '',
  )

  async function ensureBranches() {
    if (filters.branches.length) return
    if (!pending) {
      pending = branchService
        .list()
        .then((list) => filters.setBranches(list))
        .finally(() => {
          pending = null
        })
    }
    await pending
  }

  return { branch, branches, branchName, isStaff, ensureBranches }
}
