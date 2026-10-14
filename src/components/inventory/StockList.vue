<script setup lang="ts">
import { computed } from 'vue'
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StockGauge from './StockGauge.vue'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'
import type { StockRow } from '@/types'

/**
 * Tabla de stock: insumo, cantidad, barra mín/máx, estado y días que alcanza.
 * En el celular quedan insumo (con la cantidad debajo), estado y el botón de ajuste.
 */
const props = defineProps<{ rows: StockRow[]; showBranch: boolean }>()
const emit = defineEmits<{ adjust: [row: StockRow] }>()

const copy = inventoryCopy.stock
const cols = copy.columns

const columns: TableColumn[] = [
  { key: 'name', label: cols.name },
  { key: 'qty', label: cols.qty, align: 'right', hideOnMobile: true },
  { key: 'gauge', label: copy.minMax, hideOnMobile: true },
  { key: 'status', label: cols.status },
  { key: 'days', label: cols.days, align: 'right', hideOnMobile: true },
  { key: 'action', label: '', align: 'right' },
]

type Tone = 'danger' | 'warning' | 'neutral' | 'muted'

// Lo que alcanza menos de 3 días pide compra ya; menos de una semana, pronto.
function daysOf(r: StockRow): { text: string; tone: Tone } {
  if (r.status === 'out') return { text: copy.outNow, tone: 'danger' }
  if (r.daysLeft === null) return { text: copy.noUse, tone: 'muted' }
  const d = Math.floor(r.daysLeft)
  return { text: copy.daysShort(d), tone: d < 3 ? 'danger' : d < 7 ? 'warning' : 'neutral' }
}

const items = computed(() =>
  props.rows.map((r) => ({
    id: `${r.branch._id}-${r.ingredient._id}`,
    row: r,
    name: r.ingredient.name,
    branch: r.branch.name,
    qty: formatQty(r.quantity, r.ingredient.unit),
    range: `${formatQty(r.minStock)} – ${formatQty(r.maxStock)}`,
    status: r.status,
    days: daysOf(r),
  })),
)
</script>

<template>
  <DataTable :columns="columns" :rows="items" :caption="copy.title">
    <template #cell-name="{ row }">
      <span class="ing">
        <span class="ing__dot" :class="`ing__dot--${row.status}`" aria-hidden="true"></span>
        <span class="ing__text">
          <strong>{{ row.name }}</strong>
          <small>
            <span v-if="showBranch">{{ row.branch }}</span>
            <span class="ing__qty num">{{ row.qty }}</span>
          </small>
        </span>
      </span>
    </template>
    <template #cell-qty="{ row }">
      <strong class="num">{{ row.qty }}</strong>
    </template>
    <template #cell-gauge="{ row }">
      <span class="gauge">
        <StockGauge
          :quantity="row.row.quantity"
          :min="row.row.minStock"
          :max="row.row.maxStock"
          :status="row.status"
        />
        <small class="num">{{ row.range }}</small>
      </span>
    </template>
    <template #cell-status="{ row }">
      <StatusBadge :status="row.status" />
    </template>
    <template #cell-days="{ row }">
      <span class="days num" :class="`days--${row.days.tone}`">{{ row.days.text }}</span>
    </template>
    <template #cell-action="{ row }">
      <button
        type="button"
        class="adj"
        :aria-label="`${copy.actions.adjust} ${row.name}`"
        :title="copy.actions.adjust"
        @click="emit('adjust', row.row)"
      >
        <i class="fa-solid fa-sliders" aria-hidden="true"></i>
        <span>{{ copy.actions.adjust }}</span>
      </button>
    </template>
  </DataTable>
</template>

<style scoped lang="scss">
// En el celular la tabla tiene que entrar entera: pastilla de estado más chica.
:deep(.badge) {
  @include until('md') {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }
}

.ing {
  @include flex(row, center, flex-start, 0.65rem);

  &__dot {
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;

    &--out {
      background: $danger;
    }

    &--low {
      background: $warning;
    }

    &--ok {
      background: $success;
    }

    &--over {
      background: $info;
    }
  }

  &__text {
    @include flex(column, flex-start, center);
    line-height: 1.25;
    min-width: 0;

    strong {
      font-weight: 600;
      white-space: normal;
    }

    small {
      @include flex(row, center, flex-start, 0.4rem);
      font-size: 0.7rem;
      color: $ink-muted;
    }
  }

  // La cantidad va debajo del nombre solo en el celular: en escritorio tiene su columna.
  &__qty {
    font-weight: 600;
    color: $ink-soft;

    @include from('md') {
      display: none;
    }
  }
}

.gauge {
  @include flex(column, stretch, flex-start, 0.3rem);
  width: 9rem;

  small {
    font-size: 0.68rem;
    color: $ink-muted;
  }
}

.days {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: $radius-pill;
  font-size: 0.74rem;
  font-weight: 600;

  &--danger {
    color: darken($danger, 6%);
    background: $danger-bg;
  }

  &--warning {
    color: darken($warning, 20%);
    background: $warning-bg;
  }

  &--neutral {
    color: $ink-soft;
    background: $canvas;
  }

  &--muted {
    color: $ink-muted;
  }
}

.adj {
  @include flex(row, center, center, 0.4rem);
  min-height: 2.1rem;
  padding: 0 0.75rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  font-size: 0.76rem;
  font-weight: 600;
  color: $ink;
  @include transition;

  &:hover {
    border-color: $ink;
    background: $ink;
    color: $surface;
  }

  // En el celular solo el ícono: el nombre ya está en la fila.
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
