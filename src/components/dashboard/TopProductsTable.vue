<script setup lang="ts">
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import { dashboardCopy } from '@/config/dashboardCopy'

export interface ProductRow extends Record<string, unknown> {
  id: string
  rank: number
  name: string
  category: string
  quantity: string
  sales: string
  share: string
  /** 0..1 contra el plato que más vende: largo de la barra. */
  bar: number
}

// Ranking de platos por dinero: puesto, nombre con su categoría, unidades y barra de venta.
defineProps<{ rows: ProductRow[] }>()

const copy = dashboardCopy.operations
const cols = copy.productCols
const columns: TableColumn[] = [
  { key: 'name', label: cols.name },
  { key: 'quantity', label: cols.quantity, align: 'right', hideOnMobile: true },
  { key: 'sales', label: cols.sales, align: 'right' },
  { key: 'share', label: cols.share, align: 'right', hideOnMobile: true },
]
</script>

<template>
  <DataTable :columns="columns" :rows="rows" :caption="copy.topProducts">
    <template #cell-name="{ row }">
      <span class="prod">
        <span class="prod__pos" :class="{ 'prod__pos--top': row.rank <= 3 }">{{ row.rank }}</span>
        <span class="prod__text">
          <strong class="prod__name">{{ row.name }}</strong>
          <small class="prod__cat">{{ row.category }}</small>
        </span>
      </span>
    </template>
    <template #cell-sales="{ row }">
      <span class="money">
        <span class="money__track" aria-hidden="true">
          <span
            class="money__fill"
            :style="{ width: `${Math.max(row.bar * 100, 3)}%` }"
          ></span>
        </span>
        <strong>{{ row.sales }}</strong>
      </span>
    </template>
  </DataTable>
</template>

<style scoped lang="scss">
.prod {
  @include flex(row, center, flex-start, 0.65rem);
  min-width: 0;
  max-width: 15rem;
  white-space: normal;

  &__pos {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: $canvas;
    font-size: 0.7rem;
    font-weight: 700;
    color: $ink-soft;

    &--top {
      background: $accent-soft;
      color: $accent-deep;
    }
  }

  &__text {
    @include flex(column, flex-start, center);
    min-width: 0;
    line-height: 1.25;
  }

  &__name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  &__cat {
    font-size: 0.7rem;
    color: $ink-muted;
  }
}

.money {
  @include flex(row, center, flex-end, 0.75rem);

  &__track {
    width: 5rem;
    height: 0.4rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;

    @include until('md') {
      display: none;
    }
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: $accent;
    transform-origin: left;
    animation: money-grow 0.7s $ease both;
  }
}

@keyframes money-grow {
  from {
    transform: scaleX(0);
  }
}
</style>
