<script setup lang="ts">
import { onMounted } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInventoryMovements } from '@/composables/useInventoryMovements'
import { useInventoryIngredients } from '@/composables/useInventoryIngredients'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import { formatDate, formatQty } from '@/utils/format'
import type { Movement, MovementType } from '@/types'

const copy = inventoryCopy.movements
const { branch, isStaff, ensureBranches } = useInventoryBranch()
const { items, total, pages, page, loading, filters, load } = useInventoryMovements()
const { active: ingredients, loadIngredients } = useInventoryIngredients()

const types = Object.entries(site.movementTypes) as [MovementType, string][]
const time = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' })

function signed(m: Movement) {
  const text = formatQty(Math.abs(m.quantity), m.ingredient.unit)
  return m.quantity > 0 ? `+${text}` : m.quantity < 0 ? `−${text}` : text
}

onMounted(async () => {
  await Promise.all([ensureBranches(), loadIngredients()])
  // Si la sucursal cambia, el watcher del composable ya recarga.
  const before = filters.branch
  filters.branch = branch.value
  if (before === filters.branch) load()
})
</script>

<template>
  <div class="page movements">
    <PageHeader :title="copy.title" :help="copy.help">
      <template #actions>
        <RouterLink class="btn btn--ghost btn--sm" :to="{ name: 'Inventory' }">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {{ inventoryCopy.stock.title }}
        </RouterLink>
      </template>
    </PageHeader>

    <div class="filters">
      <BranchPicker v-if="!isStaff" v-model="filters.branch" allow-all />
      <select v-model="filters.ingredient" :aria-label="inventoryCopy.stock.columns.name">
        <option value="">{{ copy.allIngredients }}</option>
        <option v-for="i in ingredients" :key="i._id" :value="i._id">{{ i.name }}</option>
      </select>
      <select v-model="filters.type" :aria-label="inventoryCopy.adjust.type">
        <option value="">{{ copy.allTypes }}</option>
        <option v-for="[value, label] in types" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>

    <LoadingBlock v-if="loading && !items.length" />
    <EmptyState
      v-else-if="!items.length"
      icon="fa-solid fa-clock-rotate-left"
      :title="copy.empty"
    />
    <ul v-else class="log" :class="{ 'log--loading': loading }">
      <li v-for="m in items" :key="m._id" class="log__row">
        <span class="log__type" :class="`log__type--${m.type}`">{{
          site.movementTypes[m.type]
        }}</span>
        <span class="log__main">
          <strong>{{ m.ingredient.name }}</strong>
          <small class="muted">
            {{ formatDate(m.date) }} · {{ time.format(new Date(m.date)) }}
            <template v-if="!isStaff"> · {{ m.branch.name }}</template>
            <template v-if="m.createdBy"> · {{ copy.by }} {{ m.createdBy.name }}</template>
          </small>
          <small v-if="m.note" class="log__note">{{ m.note }}</small>
        </span>
        <span class="log__qty num" :class="m.quantity >= 0 ? 'log__qty--in' : 'log__qty--out'">
          {{ signed(m) }}
        </span>
      </li>
    </ul>

    <div v-if="pages > 1" class="pager">
      <button class="btn btn--ghost btn--sm" :disabled="page <= 1" @click="page--">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> {{ copy.prev }}
      </button>
      <span class="muted num">{{ copy.page(page, pages) }} · {{ total }}</span>
      <button class="btn btn--ghost btn--sm" :disabled="page >= pages" @click="page++">
        {{ copy.next }} <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filters {
  @include flex-cards(190px, 0.5rem);
}

.log {
  list-style: none;
  @include card;
  @include transition(opacity);

  &--loading {
    opacity: 0.55;
  }

  &__row {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.8rem 1rem;
    border-bottom: 1px solid $line;

    &:last-child {
      border-bottom: none;
    }
  }

  &__type {
    flex: 0 0 auto;
    width: 6.2rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $ink-muted;

    &--purchase {
      color: darken($success, 10%);
    }

    &--sale {
      color: $ink-soft;
    }

    &--waste {
      color: $danger;
    }

    &--initial,
    &--adjustment {
      color: $info;
    }
  }

  &__main {
    @include flex(column, flex-start, flex-start, 0.1rem);
    flex: 1;
    min-width: 0;

    small {
      font-size: $text-xs;
    }
  }

  &__note {
    color: $ink-soft;
    font-style: italic;
  }

  &__qty {
    flex: 0 0 auto;
    font-weight: 700;
    white-space: nowrap;

    &--in {
      color: darken($success, 10%);
    }

    &--out {
      color: $danger;
    }
  }
}

.pager {
  @include flex(row, center, space-between, 0.6rem);
  font-size: $text-sm;
}
</style>
