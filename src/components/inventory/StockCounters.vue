<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatPercent } from '@/utils/format'
import type { StockCounts } from '@/services/inventory.service'
import type { StockStatus } from '@/types'

/**
 * Cuatro tarjetas tipo KPI, una por estado, con su color. Tocar una filtra la
 * lista por ese estado; tocarla de nuevo quita el filtro.
 */
const props = defineProps<{ counts: StockCounts; active: StockStatus | '' }>()
const emit = defineEmits<{ toggle: [status: StockStatus] }>()

const copy = inventoryCopy.stock
const order: StockStatus[] = ['out', 'low', 'ok', 'over']
const total = computed(() => order.reduce((a, k) => a + props.counts[k], 0) || 1)
const share = (k: StockStatus) => props.counts[k] / total.value
</script>

<template>
  <div class="counters" role="group" :aria-label="copy.byStatus">
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
      <span class="counter__head">
        <span class="counter__label">{{ site.stockStatus[key].label }}</span>
        <span class="counter__icon" aria-hidden="true">
          <i :class="site.stockStatus[key].icon"></i>
        </span>
      </span>
      <span class="counter__num">{{ counts[key] }}</span>
      <span class="counter__meta">
        <span class="counter__track" aria-hidden="true">
          <span class="counter__fill" :style="{ width: `${share(key) * 100}%` }"></span>
        </span>
        <span class="counter__pct num">{{ formatPercent(share(key)) }}</span>
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.counters {
  @include flex-cards(150px, $sp-3);

  @include from('md') {
    @include flex-cards(200px, $sp-4);
  }
}

.counter {
  --tone: #{$ink-muted};
  --tone-bg: #{$sand};
  @include card;
  @include flex(column, stretch, flex-start, 0.35rem);
  position: relative;
  padding: $sp-4;
  text-align: left;
  @include transition;
  @include focus-ring;

  @include from('md') {
    padding: $sp-5 $sp-5 $sp-4;
  }

  &--out {
    --tone: #{$danger};
    --tone-bg: #{$danger-bg};
  }

  &--low {
    --tone: #{darken($warning, 12%)};
    --tone-bg: #{$warning-bg};
  }

  &--ok {
    --tone: #{darken($success, 8%)};
    --tone-bg: #{$success-bg};
  }

  &--over {
    --tone: #{$info};
    --tone-bg: #{$info-bg};
  }

  &:hover {
    box-shadow: $shadow-hover;
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.5rem);
  }

  &__label {
    @include card-label;
    padding-top: 0.2rem;
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    border-radius: $radius-ctl;
    background: var(--tone-bg);
    color: var(--tone);
    font-size: 0.82rem;

    @include from('md') {
      width: 2.25rem;
      height: 2.25rem;
    }
  }

  &__num {
    @include figure(clamp(1.6rem, 1.3rem + 1vw, 2rem));
    color: var(--tone);
  }

  &__meta {
    @include flex(row, center, flex-start, 0.6rem);
    margin-top: 0.15rem;
  }

  &__track {
    flex: 1;
    height: 0.35rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--tone);
    transform-origin: left;
    animation: counter-grow 0.7s $ease both;
  }

  &__pct {
    font-size: 0.72rem;
    font-weight: 600;
    color: $ink-muted;
  }

  &--zero &__num {
    color: $ink-muted;
  }

  &--active {
    border-color: var(--tone);
    box-shadow:
      0 0 0 1px var(--tone),
      $shadow-hover;

    &::after {
      content: '';
      position: absolute;
      inset: auto $sp-4 -1px;
      height: 3px;
      border-radius: 3px 3px 0 0;
      background: var(--tone);
    }
  }
}

@keyframes counter-grow {
  from {
    transform: scaleX(0);
  }
}
</style>
