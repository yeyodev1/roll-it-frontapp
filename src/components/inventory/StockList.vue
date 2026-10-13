<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StockGauge from './StockGauge.vue'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'
import type { StockRow } from '@/types'

defineProps<{ rows: StockRow[]; showBranch: boolean }>()
const emit = defineEmits<{ adjust: [row: StockRow] }>()

const copy = inventoryCopy.stock

function days(row: StockRow) {
  return row.daysLeft === null ? copy.noUse : copy.daysLeft(Math.floor(row.daysLeft))
}
const keyOf = (row: StockRow) => `${row.branch._id}-${row.ingredient._id}`
</script>

<template>
  <!-- Celular: tarjetas que se tocan enteras para ajustar -->
  <ul class="cards">
    <li v-for="row in rows" :key="keyOf(row)">
      <button
        type="button"
        class="item"
        :class="`item--${row.status}`"
        @click="emit('adjust', row)"
      >
        <span class="item__top">
          <span class="item__name">
            {{ row.ingredient.name }}
            <small v-if="showBranch">{{ row.branch.name }}</small>
          </span>
          <StatusBadge :status="row.status" />
        </span>
        <span class="item__qty num">
          {{ formatQty(row.quantity) }}<small>{{ row.ingredient.unit }}</small>
        </span>
        <StockGauge
          :quantity="row.quantity"
          :min="row.minStock"
          :max="row.maxStock"
          :status="row.status"
        />
        <span class="item__foot">
          <span>{{ days(row) }}</span>
          <span
            ><i class="fa-solid fa-sliders" aria-hidden="true"></i> {{ copy.actions.adjust }}</span
          >
        </span>
      </button>
    </li>
  </ul>

  <!-- Escritorio: tabla -->
  <div class="table-wrap desk">
    <table>
      <thead>
        <tr>
          <th>{{ copy.columns.name }}</th>
          <th v-if="showBranch">{{ copy.columns.branch }}</th>
          <th>{{ copy.columns.qty }}</th>
          <th class="desk__gauge">{{ copy.minMax }}</th>
          <th>{{ copy.columns.status }}</th>
          <th>{{ copy.columns.days }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="keyOf(row)">
          <td class="desk__name">{{ row.ingredient.name }}</td>
          <td v-if="showBranch" class="muted">{{ row.branch.name }}</td>
          <td class="num desk__qty">{{ formatQty(row.quantity, row.ingredient.unit) }}</td>
          <td class="desk__gauge">
            <StockGauge
              :quantity="row.quantity"
              :min="row.minStock"
              :max="row.maxStock"
              :status="row.status"
            />
            <span class="muted num"
              >{{ formatQty(row.minStock) }} / {{ formatQty(row.maxStock) }}</span
            >
          </td>
          <td><StatusBadge :status="row.status" /></td>
          <td class="muted">{{ days(row) }}</td>
          <td class="desk__action">
            <button class="btn btn--ghost btn--sm" @click="emit('adjust', row)">
              <i class="fa-solid fa-sliders" aria-hidden="true"></i> {{ copy.actions.adjust }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.cards {
  list-style: none;
  @include flex-cards(260px, 0.6rem);

  @include from('lg') {
    display: none;
  }
}

.item {
  @include card;
  @include flex(column, stretch, flex-start, 0.55rem);
  width: 100%;
  padding: 0.95rem 1rem 0.85rem;
  text-align: left;

  &--out {
    border-color: rgba($danger, 0.45);
  }

  &__top {
    @include flex(row, flex-start, space-between, 0.6rem);
  }

  &__name {
    font-weight: 600;
    line-height: 1.3;

    small {
      display: block;
      font-weight: 400;
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__qty {
    @include display($display-sm, 500);

    small {
      font-family: $font-principal;
      font-size: $text-sm;
      font-weight: 500;
      color: $ink-muted;
      margin-left: 0.3rem;
    }
  }

  &__foot {
    @include flex(row, center, space-between, 0.5rem);
    font-size: $text-xs;
    color: $ink-muted;

    span:last-child {
      color: $accent-deep;
      font-weight: 600;
    }
  }
}

.desk {
  display: none;

  @include from('lg') {
    display: block;
  }

  &__name {
    font-weight: 600;
  }

  &__qty {
    font-weight: 600;
    white-space: nowrap;
  }

  &__gauge {
    width: 22%;
    min-width: 150px;

    .muted {
      display: block;
      margin-top: 0.35rem;
      font-size: $text-xs;
    }
  }

  &__action {
    text-align: right;
  }
}
</style>
