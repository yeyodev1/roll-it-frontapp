<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheSidebar from '@/layout/TheSidebar.vue'
import TheTopbar from '@/layout/TheTopbar.vue'
import TheMobileNav from '@/layout/TheMobileNav.vue'
import TheFilterBar from '@/layout/TheFilterBar.vue'
import ToastList from '@/components/ui/ToastList.vue'
import BrandMark from '@/components/ui/BrandMark.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
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
      // Sin sucursales igual se puede mirar "todas": que las vistas no esperen para siempre.
      filtersStore.markReady()
      toast.error((e as ApiError).message)
    }
  },
  { immediate: true },
)

function logout() {
  userStore.clear()
  filtersStore.reset()
  router.replace('/login')
}
</script>

<template>
  <!-- Mientras se verifica la sesión (red lenta) no queda la pantalla en blanco. -->
  <div v-if="userStore.loading && !userStore.user" class="boot">
    <BrandMark />
    <LoadingBlock class="boot__bar" height="0.5rem" />
  </div>

  <div v-else-if="bare" class="bare">
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
.boot {
  @include flex(column, center, center, 1.25rem);
  min-height: 100vh;
  min-height: 100dvh;

  &__bar {
    width: min(12rem, 60vw);
  }
}

.bare {
  @include flex(column, stretch, flex-start);
  min-height: 100vh;
  min-height: 100dvh;
}

.shell {
  min-height: 100vh;
  min-height: 100dvh;

  @include from('lg') {
    @include flex(row, stretch, flex-start);
  }

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
      flex: 1 1 0;
      min-width: 0;
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
