<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import { site } from '@/config/site'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInventoryInitial } from '@/composables/useInventoryInitial'
import { normalize } from '@/composables/useInventoryStock'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'

const copy = inventoryCopy.initial
const { branch, branchName, isStaff, ensureBranches } = useInventoryBranch({ allowAll: false })
const { rows, loading, error, saving, search, changed, load, save } = useInventoryInitial()

const visible = computed(() => {
  const term = normalize(search.value)
  return term ? rows.value.filter((r) => normalize(r.name).includes(term)) : rows.value
})

watch(branch, (value) => load(value))
onMounted(async () => {
  await ensureBranches()
  load(branch.value)
})
</script>

<template>
  <div class="page initial">
    <PageHeader :title="copy.title" :subtitle="isStaff ? branchName : undefined" :help="copy.help">
      <template #actions>
        <RouterLink class="btn btn--ghost btn--sm" :to="{ name: 'Inventory' }">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {{ inventoryCopy.stock.title }}
        </RouterLink>
      </template>
    </PageHeader>

    <BranchPicker v-if="!isStaff" v-model="branch" />

    <template v-if="branch">
      <input v-model="search" type="search" :placeholder="inventoryCopy.stock.search" />

      <!-- Skeleton con la forma de cada fila: nombre a la izquierda, casilla de cantidad a la derecha. -->
      <ul v-if="loading" class="count" role="status" aria-busy="true">
        <li v-for="n in 8" :key="n" class="count__row" aria-hidden="true">
          <span class="count__name">
            <span class="sk sk--line" :style="{ width: `${40 + (n % 4) * 9}%` }"></span>
            <span class="sk sk--line count__sk-meta"></span>
          </span>
          <span class="sk count__sk-input"></span>
        </li>
        <li class="visually-hidden">{{ site.ui.loading }}</li>
      </ul>
      <LoadError v-else-if="error" :message="error" @retry="load(branch)" />
      <EmptyState
        v-else-if="!visible.length"
        icon="fa-solid fa-box-open"
        :title="inventoryCopy.stock.empty"
      />
      <ul v-else class="count">
        <li
          v-for="row in visible"
          :key="row.id"
          class="count__row"
          :class="{
            'count__row--changed': row.quantity !== null && Number(row.quantity) !== row.original,
          }"
        >
          <label class="count__name" :for="`qty-${row.id}`">
            {{ row.name }}
            <small class="num">{{ formatQty(row.original, row.unit) }}</small>
          </label>
          <div class="count__input">
            <input
              :id="`qty-${row.id}`"
              v-model.number="row.quantity"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
              enterkeyhint="next"
            />
            <span>{{ row.unit }}</span>
          </div>
        </li>
      </ul>
    </template>

    <div v-if="branch && rows.length" class="bar">
      <span class="bar__count">
        {{ changed.length ? copy.changed(changed.length) : copy.noChanges }}
      </span>
      <button class="btn btn--primary" :disabled="saving || !changed.length" @click="save(branch)">
        <i
          :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"
          aria-hidden="true"
        ></i>
        {{ copy.save }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.initial {
  padding-bottom: 7rem;
}

.count {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.5rem);

  &__row {
    @include card;
    @include flex(row, center, space-between, 0.8rem);
    padding: 0.7rem 0.75rem 0.7rem 1rem;
    @include transition(border-color);

    &--changed {
      border-color: $accent;
      box-shadow: inset 4px 0 0 $accent;
    }
  }

  &__name {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 1rem;
    font-weight: 600;
    color: $ink;

    small {
      display: block;
      font-size: $text-xs;
      font-weight: 400;
      color: $ink-muted;
    }
  }

  &__sk-meta {
    width: 4rem;
    height: 0.6rem;
    margin-top: 0.45rem;
  }

  &__sk-input {
    flex: 0 0 auto;
    width: 11rem;
    height: 3.1rem;
  }

  &__input {
    @include flex(row, center, flex-end, 0.45rem);
    flex: 0 0 auto;

    input {
      width: 7.5rem;
      font-size: 1.35rem;
      font-weight: 600;
      text-align: right;
      padding: 0.65rem 0.8rem;
    }

    span {
      width: 3.2rem;
      font-size: $text-sm;
      color: $ink-muted;
    }
  }
}

// Botón fijo abajo: con el celular en una mano se guarda sin volver arriba.
.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  @include flex(row, center, space-between, 1rem);
  padding: 0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom));
  background: rgba($surface, 0.94);
  backdrop-filter: blur(8px);
  border-top: 1px solid $line;

  &__count {
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-soft;
  }

  .btn {
    flex: 0 1 16rem;
    min-height: 3.1rem;
  }
}
</style>
