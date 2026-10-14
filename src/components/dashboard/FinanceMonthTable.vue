<script setup lang="ts">
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import DeltaBadge from '@/components/ui/DeltaBadge.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { dashboardCopy } from '@/config/dashboardCopy'

export interface MonthRow extends Record<string, unknown> {
  id: string
  month: string
  live: boolean
  sales: string
  tickets: string
  avgTicket: string
  lastYear: string
  delta: number | null
}

// Detalle mensual de Finanzas: cada mes de este año contra el mismo mes del año pasado.
defineProps<{ rows: MonthRow[] }>()

const copy = dashboardCopy.finance
const columns: TableColumn[] = [
  { key: 'month', label: copy.cols.month },
  { key: 'sales', label: copy.cols.sales, align: 'right' },
  { key: 'tickets', label: copy.cols.tickets, align: 'right', hideOnMobile: true },
  { key: 'avgTicket', label: copy.cols.avgTicket, align: 'right', hideOnMobile: true },
  { key: 'lastYear', label: copy.cols.lastYear, align: 'right', hideOnMobile: true },
  { key: 'delta', label: copy.cols.vs, align: 'right' },
]
</script>

<template>
  <DataTable
    :columns="columns"
    :rows="rows"
    :caption="copy.table"
    :highlight-key="rows.find((r) => r.live)?.id"
  >
    <template #cell-month="{ row }">
      <span class="mrow">
        <strong class="mrow__name">{{ row.month }}</strong>
        <AppBadge v-if="row.live" tone="accent" dot :title="copy.inProgress">
          <span class="mrow__live">{{ copy.inProgress }}</span>
        </AppBadge>
      </span>
    </template>
    <template #cell-sales="{ row }">
      <strong>{{ row.sales }}</strong>
    </template>
    <template #cell-lastYear="{ row }">
      <span class="mrow__muted">{{ row.lastYear }}</span>
    </template>
    <template #cell-delta="{ row }">
      <DeltaBadge v-if="row.delta !== null" :value="row.delta" />
      <span v-else class="mrow__muted">—</span>
    </template>
  </DataTable>
</template>

<style scoped lang="scss">
.mrow {
  @include flex(row, center, flex-start, 0.5rem);

  &__name {
    font-weight: 600;
    text-transform: capitalize;
  }

  // En el celular el punto basta: la fila ya va resaltada.
  &__live {
    @include until('sm') {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  }

  &__muted {
    color: $ink-muted;
  }
}
</style>
