<script setup lang="ts">
import { computed } from 'vue'
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatCents, formatQty } from '@/utils/format'
import type { Product, Recipe } from '@/types'

/**
 * Platos con su receta: precio, primeros insumos (el resto como "+n") y si
 * tienen receta. Sin receta, sus ventas no descuentan inventario.
 */
const props = defineProps<{ products: Product[]; recipes: Map<string, Recipe> }>()
const emit = defineEmits<{ edit: [product: Product] }>()

const copy = inventoryCopy.recipes
const SHOWN = 3

const columns: TableColumn[] = [
  { key: 'name', label: copy.cols.dish },
  { key: 'items', label: copy.cols.items, hideOnMobile: true },
  { key: 'price', label: copy.cols.price, align: 'right', hideOnMobile: true },
  { key: 'state', label: copy.cols.state },
  { key: 'action', label: '', align: 'right' },
]

const rows = computed(() =>
  props.products.map((p) => {
    const items = props.recipes.get(p._id)?.items ?? []
    return {
      id: p._id,
      product: p,
      name: p.name,
      category: p.category || '—',
      price: formatCents(p.priceCents),
      has: p.hasRecipe,
      chips: items
        .slice(0, SHOWN)
        .map((i) => ({
          key: i.ingredient._id,
          name: i.ingredient.name,
          qty: formatQty(i.quantity, i.ingredient.unit),
        })),
      more: Math.max(items.length - SHOWN, 0),
    }
  }),
)
</script>

<template>
  <DataTable :columns="columns" :rows="rows" :caption="copy.title">
    <template #cell-name="{ row }">
      <span class="dish">
        <strong>{{ row.name }}</strong>
        <small
          >{{ row.category }}<span class="dish__mprice num"> · {{ row.price }}</span></small
        >
      </span>
    </template>
    <template #cell-items="{ row }">
      <span v-if="row.chips.length" class="chips">
        <span v-for="c in row.chips" :key="c.key" class="chips__item">
          {{ c.name }} <b class="num">{{ c.qty }}</b>
        </span>
        <span v-if="row.more" class="chips__more num">+{{ row.more }}</span>
      </span>
      <span v-else class="muted">—</span>
    </template>
    <template #cell-price="{ row }">
      <strong class="num">{{ row.price }}</strong>
    </template>
    <template #cell-state="{ row }">
      <AppBadge :tone="row.has ? 'success' : 'warning'" dot>
        {{ row.has ? copy.withRecipe : copy.withoutRecipe }}
      </AppBadge>
    </template>
    <template #cell-action="{ row }">
      <button
        type="button"
        class="edit"
        :aria-label="`${copy.edit}: ${row.name}`"
        @click="emit('edit', row.product)"
      >
        <i :class="row.has ? 'fa-solid fa-pen' : 'fa-solid fa-plus'" aria-hidden="true"></i>
        <span>{{ row.has ? copy.editShort : copy.addShort }}</span>
      </button>
    </template>
  </DataTable>
</template>

<style scoped lang="scss">
.dish {
  @include flex(column, flex-start, center);
  line-height: 1.3;
  white-space: normal;

  strong {
    font-weight: 600;
  }

  small {
    font-size: 0.7rem;
    color: $ink-muted;
  }

  // En el celular el precio va debajo del nombre: no hay columna para él.
  &__mprice {
    @include from('md') {
      display: none;
    }
  }
}

.chips {
  @include flex(row, center, flex-start, 0.3rem);
  flex-wrap: wrap;
  max-width: 26rem;
  white-space: normal;

  &__item {
    padding: 0.15rem 0.55rem;
    border-radius: $radius-pill;
    background: $canvas;
    font-size: 0.72rem;
    color: $ink-soft;

    b {
      font-weight: 700;
      color: $ink;
    }
  }

  &__more {
    font-size: 0.72rem;
    font-weight: 700;
    color: $ink-muted;
  }
}

.edit {
  @include flex(row, center, center, 0.4rem);
  min-height: 2.1rem;
  padding: 0 0.75rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  font-size: 0.76rem;
  font-weight: 600;
  @include transition;

  &:hover {
    border-color: $ink;
    background: $ink;
    color: $surface;
  }

  span {
    @include until('md') {
      display: none;
    }
  }

  @include until('md') {
    width: 2.1rem;
    padding: 0;
  }
}
</style>
