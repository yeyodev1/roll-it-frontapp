<script setup lang="ts">
import { computed } from 'vue'

export interface BarItem {
  label: string
  value: number
  /** Texto del valor ya formateado ("$1.234,00"). */
  display: string
  /** Línea secundaria opcional ("42 vendidos", "38 %"). */
  sub?: string
}

const props = withDefaults(
  defineProps<{ items: BarItem[]; limit?: number; highlightFirst?: boolean }>(),
  {
    limit: 0,
    highlightFirst: true,
  },
)

const rows = computed(() => (props.limit ? props.items.slice(0, props.limit) : props.items))
const max = computed(() => Math.max(...rows.value.map((r) => r.value), 1))

function width(value: number): string {
  // Mínimo visible para que una barra chica no desaparezca.
  return `${Math.max((value / max.value) * 100, 1.5)}%`
}
</script>

<template>
  <ol class="bars">
    <li
      v-for="(row, i) in rows"
      :key="row.label + i"
      class="bars__row"
      :class="{ 'bars__row--lead': highlightFirst && i === 0 }"
    >
      <div class="bars__text">
        <span class="bars__label">{{ row.label }}</span>
        <span class="bars__value num">{{ row.display }}</span>
      </div>
      <div class="bars__track" aria-hidden="true">
        <span class="bars__fill" :style="{ width: width(row.value) }"></span>
      </div>
      <span v-if="row.sub" class="bars__sub num">{{ row.sub }}</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.bars {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.95rem);

  &__row {
    @include flex(column, stretch, flex-start, 0.3rem);
  }

  &__text {
    @include flex(row, baseline, space-between, 0.75rem);
  }

  &__label {
    font-size: 0.88rem;
    font-weight: 500;
    color: $ink;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__value {
    font-size: 0.88rem;
    font-weight: 600;
    color: $ink;
    flex-shrink: 0;
  }

  &__track {
    height: 0.5rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: $radius-pill;
    background: rgba($accent, 0.55);
    transform-origin: left;
    animation: grow 0.6s $ease both;
  }

  &__row--lead &__fill {
    background: $accent;
  }

  &__sub {
    font-size: 0.75rem;
    color: $ink-muted;
  }
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
}
</style>
