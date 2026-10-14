<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import BranchesTab from '@/components/settings/BranchesTab.vue'
import ProductsTab from '@/components/settings/ProductsTab.vue'
import IngredientsTab from '@/components/settings/IngredientsTab.vue'
import WaitersTab from '@/components/settings/WaitersTab.vue'
import UsersTab from '@/components/settings/UsersTab.vue'
import SyncTab from '@/components/settings/SyncTab.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { inventoryCopy } from '@/config/inventoryCopy'

const copy = inventoryCopy.settings
const route = useRoute()
const router = useRouter()
const { ensureBranches } = useInventoryBranch()

const panels: Record<string, Component> = {
  branches: BranchesTab,
  products: ProductsTab,
  ingredients: IngredientsTab,
  waiters: WaitersTab,
  users: UsersTab,
  sync: SyncTab,
}

// La pestaña vive en la URL (?tab=) para que recargar o compartir el link abra la misma.
const initial = String(route.query.tab || '')
const tab = ref(panels[initial] ? initial : 'branches')
const current = computed(() => panels[tab.value]!)

function select(key: string) {
  tab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}

onMounted(() => {
  ensureBranches()
  // En el celular las pestañas se deslizan: la elegida por la URL tiene que quedar a la vista.
  document
    .querySelector('.tabs [aria-selected="true"]')
    ?.scrollIntoView({ inline: 'center', block: 'nearest' })
})
</script>

<template>
  <div class="page settings">
    <PageHeader :title="copy.title" />

    <nav class="tabs" role="tablist">
      <button
        v-for="t in copy.tabs"
        :key="t.key"
        class="tabs__tab"
        role="tab"
        :aria-selected="tab === t.key"
        @click="select(t.key)"
      >
        <i :class="t.icon" aria-hidden="true"></i>
        {{ t.label }}
      </button>
    </nav>

    <div role="tabpanel">
      <component :is="current" :key="tab" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  @include flex(row, stretch, flex-start, 0.2rem);
  overflow-x: auto;
  border-bottom: 1px solid $line;
  scrollbar-width: none;

  &__tab {
    @include flex(row, center, center, 0.45rem);
    flex: 0 0 auto;
    padding: 0.7rem 0.9rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-muted;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    @include transition(color);

    i {
      font-size: 0.8rem;
    }

    &:hover {
      color: $ink;
    }

    &[aria-selected='true'] {
      color: $ink;
      border-bottom-color: $accent;

      i {
        color: $accent;
      }
    }
  }
}
</style>
