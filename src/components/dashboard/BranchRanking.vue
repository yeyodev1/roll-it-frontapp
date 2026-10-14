<script setup lang="ts">
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import { dashboardCopy } from '@/config/dashboardCopy'

export interface BranchRow extends Record<string, unknown> {
  id: string
  rank: number
  label: string
  display: string
  tickets: string
  avgTicket: string
  share: number
  shareText: string
  color: string
}

// Tabla de sucursales por venta, con su color (el mismo del donut) y barra de participación.
defineProps<{ rows: BranchRow[] }>()

const cols = dashboardCopy.ceo.cols
const columns: TableColumn[] = [
  { key: 'label', label: cols.branch },
  { key: 'display', label: cols.sales, align: 'right' },
  { key: 'tickets', label: cols.tickets, align: 'right', hideOnMobile: true, hideOnNarrow: true },
  { key: 'avgTicket', label: cols.avgTicket, align: 'right', hideOnMobile: true },
  { key: 'shareText', label: cols.share, align: 'right' },
]
</script>

<template>
  <DataTable :columns="columns" :rows="rows" :caption="dashboardCopy.ceo.ranking">
    <template #cell-label="{ row }">
      <span class="rank">
        <span class="rank__pos">{{ row.rank }}</span>
        <i class="rank__dot" :style="{ background: row.color }" aria-hidden="true"></i>
        <strong class="rank__name">{{ row.label }}</strong>
      </span>
    </template>
    <template #cell-display="{ row }">
      <strong>{{ row.display }}</strong>
    </template>
    <template #cell-shareText="{ row }">
      <span class="share">
        <span class="share__track" aria-hidden="true">
          <span
            class="share__fill"
            :style="{ width: `${Math.max(row.share * 100, 2)}%`, background: row.color }"
          ></span>
        </span>
        <span class="share__pct">{{ row.shareText }}</span>
      </span>
    </template>
  </DataTable>
</template>

<style scoped lang="scss">
.rank {
  @include flex(row, center, flex-start, 0.6rem);

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

    @include until('sm') {
      display: none;
    }
  }

  &__dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 3px;
  }

  &__name {
    font-weight: 600;
  }
}

.share {
  @include flex(row, center, flex-end, 0.6rem);

  &__track {
    width: 3.5rem;
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
    transform-origin: left;
    animation: share-grow 0.7s $ease both;
  }

  &__pct {
    min-width: 2.75rem;
    font-weight: 600;
  }
}

@keyframes share-grow {
  from {
    transform: scaleX(0);
  }
}
</style>
