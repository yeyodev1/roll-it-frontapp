<script setup lang="ts">
import { computed } from 'vue'

export interface TipRow {
  label: string
  value: string
  /** Color de la serie (var(--chart-1)…). Sin color sale sin muestra. */
  color?: string
  muted?: boolean
}

/**
 * Globo de los gráficos: título y una fila por serie. `x`/`y` en px dentro del
 * gráfico; cerca de los bordes se ancla hacia adentro para no salirse.
 */
const props = defineProps<{ x: number; y: number; width: number; title: string; rows: TipRow[] }>()

const align = computed(() => {
  if (props.x < 90) return 'start'
  if (props.x > props.width - 90) return 'end'
  return 'mid'
})
</script>

<template>
  <div
    class="ctip"
    :class="`ctip--${align}`"
    :style="{ left: `${x}px`, top: `${y}px` }"
    role="status"
    aria-live="polite"
  >
    <strong class="ctip__title">{{ title }}</strong>
    <span
      v-for="r in rows"
      :key="r.label"
      class="ctip__row"
      :class="{ 'ctip__row--muted': r.muted }"
    >
      <i v-if="r.color" class="ctip__dot" :style="{ background: r.color }" aria-hidden="true"></i>
      <span class="ctip__label">{{ r.label }}</span>
      <span class="ctip__value">{{ r.value }}</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.ctip {
  position: absolute;
  z-index: 5;
  @include flex(column, stretch, flex-start, 0.2rem);
  min-width: 9rem;
  padding: 0.55rem 0.7rem;
  border-radius: $radius-ctl;
  background: $ink;
  color: $paper;
  font-size: 0.75rem;
  line-height: 1.35;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: $shadow-md;
  transform: translate(-50%, calc(-100% - 12px));
  transition:
    left 0.12s ease-out,
    top 0.12s ease-out;

  &--start {
    transform: translate(-14px, calc(-100% - 12px));
  }

  &--end {
    transform: translate(calc(-100% + 14px), calc(-100% - 12px));
  }

  &__title {
    font-weight: 600;
    margin-bottom: 0.1rem;
  }

  &__row {
    @include flex(row, center, flex-start, 0.4rem);

    &--muted {
      color: rgba($paper, 0.65);
    }
  }

  &__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 2px;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
  }

  &__value {
    @include tabular;
    font-weight: 600;
    margin-left: 0.75rem;
  }
}
</style>
