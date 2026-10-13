<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheSidebar from '@/layout/TheSidebar.vue'
import TheTopbar from '@/layout/TheTopbar.vue'
import TheMobileNav from '@/layout/TheMobileNav.vue'
import TheFilterBar from '@/layout/TheFilterBar.vue'
import ToastList from '@/components/ui/ToastList.vue'
import { useUserStore } from '@/stores/user'
import { useFiltersStore } from '@/stores/filters'
import { useToastStore } from '@/stores/toast'
import { branchService } from '@/services/branch.service'
import type { ApiError } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const filtersStore = useFiltersStore()
const toast = useToastStore()

const DASHBOARD_PATHS = ['/panel', '/finanzas', '/operaciones', '/meseros']

const bare = computed(() => Boolean(route.meta.bare) || !userStore.isAuthenticated)
const showFilters = computed(
  () => Boolean(route.meta.adminOnly) && DASHBOARD_PATHS.some((p) => route.path.startsWith(p)),
)

// La sesión se restaura en el guard del router, después de montar: por eso se espera al login.
watch(
  () => userStore.isAuthenticated,
  async (logged) => {
    if (!logged || filtersStore.branches.length) return
    try {
      filtersStore.setBranches(await branchService.list())
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  },
  { immediate: true },
)

function logout() {
  userStore.clear()
  filtersStore.setBranches([])
  router.replace('/login')
}
</script>

<template>
  <div v-if="bare" class="bare">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>

  <div v-else class="shell">
    <TheSidebar class="shell__sidebar" @logout="logout" />
    <div class="shell__body">
      <TheTopbar @logout="logout" />
      <TheFilterBar v-if="showFilters" />
      <main class="shell__main">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <TheMobileNav @logout="logout" />
  </div>

  <ToastList />
</template>

<style scoped lang="scss">
.bare {
  @include flex(column, stretch, flex-start);
  min-height: 100vh;
  min-height: 100dvh;
}

.shell {
  min-height: 100vh;
  min-height: 100dvh;

  &__sidebar {
    @include until('lg') {
      display: none;
    }
  }

  &__body {
    @include flex(column, stretch, flex-start);
    min-height: 100vh;
    min-height: 100dvh;

    @include from('lg') {
      margin-left: 15rem;
    }
  }

  &__main {
    flex: 1;
    @include flex(column, stretch, flex-start);
    // Espacio para la barra inferior en el celular.
    padding-bottom: calc(4.5rem + env(safe-area-inset-bottom));

    @include from('lg') {
      padding-bottom: 0;
    }
  }
}
</style>
