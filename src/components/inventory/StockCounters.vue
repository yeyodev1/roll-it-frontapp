<script setup lang="ts">
import { site } from '@/config/site'
import type { StockCounts } from '@/services/inventory.service'
import type { StockStatus } from '@/types'

defineProps<{ counts: StockCounts; active: StockStatus | '' }>()
const emit = defineEmits<{ toggle: [status: StockStatus] }>()

const order: StockStatus[] = ['out', 'low', 'ok', 'over']
</script>

<template>
  <div class="counters" role="group">
    <button
      v-for="key in order"
      :key="key"
      type="button"
      class="counter"
      :class="[
        `counter--${key}`,
        { 'counter--active': active === key, 'counter--zero': !counts[key] },
      ]"
      :aria-pressed="active === key"
      @click="emit('toggle', key)"
    >
      <span class="counter__num">{{ counts[key] }}</span>
      <span class="counter__label">
        <i :class="site.stockStatus[key].icon" aria-hidden="true"></i>
        {{ site.stockStatus[key].label }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.counters {
  @include flex-cards(130px, 0.6rem);
}

.counter {
  @include card;
  @include flex(column, flex-start, flex-start, 0.15rem);
  padding: 0.75rem 0.9rem 0.8rem;
  text-align: left;
  border-left: 4px solid currentColor;
  @include transition;

  &__num {
    @include display($display-sm, 500);
    font-variant-numeric: tabular-nums;
    color: $ink;
  }

  &__label {
    @include flex(row, center, flex-start, 0.35rem);
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.04em;

    i {
      font-size: 0.7rem;
    }
  }

  &--out {
    color: $danger;
  }

  &--low {
    color: darken($warning, 12%);
  }

  &--ok {
    color: darken($success, 8%);
  }

  &--over {
    color: $info;
  }

  &--zero {
    border-left-color: $line;

    .counter__num {
      color: $ink-muted;
    }
  }

  &:hover {
    box-shadow: $shadow-sm;
  }

  &--active {
    background: currentColor;

    .counter__num,
    .counter__label {
      color: $surface;
    }
  }
}
</style>
