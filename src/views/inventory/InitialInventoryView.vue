<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import LoadError from '@/components/ui/LoadError.vue'
import { site } from '@/config/site'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import BranchChoice from '@/components/inventory/BranchChoice.vue'
import SearchField from '@/components/ui/SearchField.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInventoryInitial } from '@/composables/useInventoryInitial'
import { normalize } from '@/composables/useInventoryStock'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'

const copy = inventoryCopy.initial
const { branch, branches, branchName, isStaff, ensureBranches } = useInventoryBranch({
  allowAll: false,
})
const { rows, loading, error, saving, search, changed, load, save } = useInventoryInitial()

const visible = computed(() => {
  const term = normalize(search.value)
  return term ? rows.value.filter((r) => normalize(r.name).includes(term)) : rows.value
})

const isChanged = (r: { quantity: number | null; original: number }) =>
  r.quantity !== null && Number(r.quantity) !== r.original

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
        <BranchPicker v-if="!isStaff && branch" v-model="branch" />
      </template>
    </PageHeader>

    <!-- Sin sucursal elegida: se elige con un toque, sin abrir un selector. -->
    <BranchChoice
      v-if="!branch"
      :branches="branches"
      :title="copy.pickBranch"
      @pick="branch = $event"
    />

    <ChartCard v-else :title="copy.count" :subtitle="copy.countHint" flush>
      <template #action>
        <SearchField v-model="search" :placeholder="inventoryCopy.stock.search" />
      </template>

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
      <div v-else-if="!visible.length" class="initial__empty">
        <EmptyState icon="fa-solid fa-box-open" :title="inventoryCopy.stock.empty" />
      </div>
      <ul v-else class="count">
        <li
          v-for="row in visible"
          :key="row.id"
          class="count__row"
          :class="{ 'count__row--changed': isChanged(row) }"
        >
          <label class="count__name" :for="`qty-${row.id}`">
            {{ row.name }}
            <small class="num">
              {{ copy.before }} {{ formatQty(row.original, row.unit) }}
              <span v-if="isChanged(row)" class="count__diff">
                → {{ formatQty(Number(row.quantity), row.unit) }}
              </span>
            </small>
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
    </ChartCard>

    <div v-if="branch && rows.length" class="bar">
      <span class="bar__count" :class="{ 'bar__count--on': changed.length }">
        <i class="fa-solid fa-pen" aria-hidden="true"></i>
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

  &__empty {
    padding: 0 $sp-4 $sp-4;
  }
}

.count {
  list-style: none;

  &__row {
    @include flex(row, center, space-between, 0.8rem);
    padding: 0.65rem $sp-4;
    border-top: 1px solid $line-soft;
    @include transition(background-color);

    @include from('md') {
      padding-inline: $sp-6;
    }

    &--changed {
      background: rgba($accent-soft, 0.45);
      box-shadow: inset 3px 0 0 $accent;
    }
  }

  &__name {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: $ink;

    small {
      display: block;
      font-size: 0.72rem;
      font-weight: 400;
      color: $ink-muted;
    }
  }

  &__diff {
    font-weight: 700;
    color: $accent-deep;
  }

  &__sk-meta {
    width: 4rem;
    height: 0.6rem;
    margin-top: 0.45rem;
  }

  &__sk-input {
    flex: 0 0 auto;
    width: 10rem;
    height: 2.75rem;
  }

  &__input {
    @include flex(row, center, flex-end, 0.45rem);
    flex: 0 0 auto;

    input {
      width: 7rem;
      font-size: 1.1rem;
      font-weight: 700;
      text-align: right;
      padding: 0.55rem 0.8rem;
      border-radius: $radius-ctl;
      @include tabular;
    }

    span {
      width: 3rem;
      font-size: 0.78rem;
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

  // En escritorio no tapa la barra lateral.
  @include from('lg') {
    left: 15rem;
    padding-inline: $sp-8;
  }

  &__count {
    @include flex(row, center, flex-start, 0.45rem);
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-muted;

    &--on {
      color: $accent-deep;
    }
  }

  .btn {
    flex: 0 1 16rem;
    min-height: 3.1rem;
  }
}
</style>
