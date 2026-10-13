<script setup lang="ts">
import { computed } from 'vue'
import InfoTip from './InfoTip.vue'
import { formatPercent } from '@/utils/format'

const props = defineProps<{
  label: string
  value: string
  delta?: number | null
  help?: string
  icon?: string
}>()

// Bajo medio punto no se considera variación: se muestra plano.
const trend = computed(() => {
  if (props.delta === null || props.delta === undefined) return null
  if (Math.abs(props.delta) < 0.005) return 'flat'
  return props.delta > 0 ? 'up' : 'down'
})

const arrow = computed(
  () =>
    ({
      up: 'fa-solid fa-arrow-trend-up',
      down: 'fa-solid fa-arrow-trend-down',
      flat: 'fa-solid fa-minus',
    })[trend.value ?? 'flat'],
)

const deltaText = computed(() => formatPercent(Math.abs(props.delta ?? 0)))
const deltaSr = computed(() =>
  trend.value === 'down' ? `bajó ${deltaText.value}` : `subió ${deltaText.value}`,
)
</script>

<template>
  <article class="kpi">
    <header class="kpi__head">
      <i v-if="icon" :class="icon" class="kpi__icon" aria-hidden="true"></i>
      <span class="kpi__label">{{ label }}</span>
      <InfoTip v-if="help" :text="help" />
    </header>
    <p class="kpi__value num" :style="{ '--chars': Math.max(value.length, 9) }">{{ value }}</p>
    <p v-if="trend" class="kpi__delta" :class="`kpi__delta--${trend}`">
      <i :class="arrow" aria-hidden="true"></i>
      <span aria-hidden="true">{{ deltaText }}</span>
      <span class="visually-hidden">{{ deltaSr }}</span>
    </p>
  </article>
</template>

<style scoped lang="scss">
.kpi {
  @include card;
  @include flex(column, flex-start, flex-start, 0.35rem);
  position: relative;
  container-type: inline-size;
  padding: 0.95rem 1rem 1rem;
  min-width: 0;

  @include from('md') {
    padding: 1.25rem 1.35rem 1.3rem;
  }

  &__head {
    @include flex(row, flex-start, flex-start, 0.4rem);
    width: 100%;
    min-height: 1.4rem;
  }

  &__icon {
    color: $accent;
    font-size: 0.8rem;
  }

  &__label {
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1.25;
    color: $ink-soft;
    min-width: 0;
  }

  &__value {
    font-family: $font-display;
    font-optical-sizing: auto;
    font-weight: 500;
    // La cifra nunca se parte: se achica según el ancho de la tarjeta y sus caracteres.
    font-size: clamp(1.25rem, calc(100cqi / (var(--chars) * 0.58)), 2.6rem);
    line-height: 1.05;
    letter-spacing: -0.025em;
    color: $ink;
    white-space: nowrap;
  }

  &__delta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.15rem;
    padding: 0.18rem 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.78rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;

    &--up {
      color: darken($success, 14%);
      background: $success-bg;
    }

    &--down {
      color: darken($danger, 6%);
      background: $danger-bg;
    }

    &--flat {
      color: $ink-soft;
      background: $sand;
    }
  }
}
</style>
