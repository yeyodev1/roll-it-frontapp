<script setup lang="ts">
import { computed } from 'vue'
import type { StockStatus } from '@/types'

/**
 * Regla de nivel: muestra dónde está el stock respecto al mínimo y al máximo,
 * como la marca de una regla en el balde. Se lee sin leer números.
 */
const props = defineProps<{ quantity: number; min: number; max: number; status: StockStatus }>()

const scale = computed(() => Math.max(props.max * 1.25, props.min * 2, props.quantity * 1.08, 1))
const pct = (value: number) => `${Math.min(100, Math.max(0, (value / scale.value) * 100))}%`

const fill = computed(() => pct(props.quantity))
const minMark = computed(() => pct(props.min))
const maxMark = computed(() => (props.max > 0 ? pct(props.max) : null))
</script>

<template>
  <div class="gauge" :class="`gauge--${status}`" aria-hidden="true">
    <span class="gauge__fill" :style="{ width: fill }"></span>
    <span v-if="min > 0" class="gauge__mark" :style="{ left: minMark }"></span>
    <span v-if="maxMark" class="gauge__mark gauge__mark--max" :style="{ left: maxMark }"></span>
  </div>
</template>

<style scoped lang="scss">
.gauge {
  position: relative;
  height: 6px;
  border-radius: $radius-pill;
  background: $sand;
  width: 100%;

  &__fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    background: currentColor;
    transition: width 0.6s $ease;
  }

  // Marcas de mínimo y máximo: rayitas que sobresalen como en una regla.
  &__mark {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    margin-left: -1px;
    border-radius: 1px;
    background: $ink;
    opacity: 0.55;

    &--max {
      opacity: 0.3;
    }
  }

  &--out {
    color: $danger;
  }

  &--low {
    color: $warning;
  }

  &--ok {
    color: $success;
  }

  &--over {
    color: $info;
  }
}
</style>
