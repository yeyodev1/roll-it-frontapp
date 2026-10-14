<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import SkeletonList from '@/components/ui/skeleton/SkeletonList.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import MovementLog from '@/components/inventory/MovementLog.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInventoryMovements } from '@/composables/useInventoryMovements'
import { useInventoryIngredients } from '@/composables/useInventoryIngredients'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import { formatQty } from '@/utils/format'
import type { MovementType } from '@/types'

const copy = inventoryCopy.movements
const { branch, isStaff, ensureBranches } = useInventoryBranch()
const { items, total, pages, page, loading, error, filters, load } = useInventoryMovements()
const { active: ingredients, loadIngredients } = useInventoryIngredients()

// Los tipos van como pastillas: son pocos y se eligen de un toque.
const types = [
  { value: '' as MovementType | '', label: copy.allTypes },
  ...(Object.entries(site.movementTypes) as [MovementType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]
const ingredientOptions = computed(() => [
  { value: '', label: copy.allIngredients },
  ...ingredients.value.map((i) => ({
    value: i._id,
    label: i.name,
    hint: i.unit,
    keywords: i.aliases.join(' '),
  })),
])

onMounted(async () => {
  await Promise.all([ensureBranches(), loadIngredients()])
  // Si la sucursal cambia, el watcher del composable ya recarga.
  const before = filters.branch
  filters.branch = branch.value
  if (before === filters.branch) load()
})
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :help="copy.help">
      <template #actions>
        <RouterLink class="btn btn--ghost btn--sm" :to="{ name: 'Inventory' }">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {{ inventoryCopy.stock.title }}
        </RouterLink>
      </template>
    </PageHeader>

    <div class="mv__filters">
      <BranchPicker v-if="!isStaff" v-model="filters.branch" class="mv__pick" allow-all />
      <AppSelect
        v-model="filters.ingredient"
        class="mv__pick"
        :options="ingredientOptions"
        :label="inventoryCopy.stock.columns.name"
        icon="fa-solid fa-carrot"
        searchable
        pill
      />
    </div>

    <ChartCard :title="copy.history" flush>
      <template #action>
        <span class="mv__total num">{{ copy.total(formatQty(total)) }}</span>
      </template>
      <div class="mv__types" role="group" :aria-label="inventoryCopy.adjust.type">
        <button
          v-for="t in types"
          :key="t.value"
          type="button"
          class="mv__type"
          :aria-pressed="filters.type === t.value"
          @click="filters.type = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <SkeletonList v-if="loading" :rows="8" :card="false" avatar />
      <LoadError v-else-if="error && !items.length" :message="error" @retry="load" />
      <div v-else-if="!items.length" class="mv__empty">
        <EmptyState icon="fa-solid fa-clock-rotate-left" :title="copy.empty" />
      </div>
      <MovementLog v-else :items="items" :show-branch="!isStaff" />

      <template v-if="pages > 1" #footer>
        <div class="mv__pager">
          <button class="btn btn--ghost btn--sm" :disabled="page <= 1" @click="page--">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> {{ copy.prev }}
          </button>
          <span class="muted num">{{ copy.page(page, pages) }}</span>
          <button class="btn btn--ghost btn--sm" :disabled="page >= pages" @click="page++">
            {{ copy.next }} <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </template>
    </ChartCard>
  </div>
</template>

<style scoped lang="scss">
.mv {
  &__filters {
    @include flex(row, center, flex-start, $sp-2 $sp-3);
    flex-wrap: wrap;
  }

  &__pick {
    flex: 1 1 100%;

    @include from('md') {
      flex: 0 1 16rem;
    }
  }

  &__total {
    font-size: 0.78rem;
    color: $ink-muted;
  }

  &__types {
    @include flex(row, center, flex-start, 0.35rem);
    padding: 0 $sp-4 $sp-3;
    overflow-x: auto;
    scrollbar-width: none;

    @include from('md') {
      padding-inline: $sp-6;
    }
  }

  &__type {
    flex: 0 0 auto;
    padding: 0.35rem 0.8rem;
    border-radius: $radius-pill;
    background: $canvas;
    font-size: 0.76rem;
    font-weight: 600;
    color: $ink-soft;
    white-space: nowrap;
    @include transition(background-color);

    &:hover {
      color: $ink;
    }

    &[aria-pressed='true'] {
      background: $ink;
      color: $surface;
    }
  }

  &__empty {
    padding: 0 $sp-4 $sp-4;
  }

  &__pager {
    @include flex(row, center, space-between, 0.6rem);
    padding-bottom: $sp-4;
  }
}
</style>
