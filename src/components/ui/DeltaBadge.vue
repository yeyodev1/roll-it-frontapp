<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'
import { formatPercent } from '@/utils/format'

/**
 * Variación con flecha: verde si sube, rojo si baja, gris si casi no cambia.
 * `invert` para métricas donde bajar es bueno (costos, mermas).
 * `value` es un ratio (0.12 = +12 %); null no pinta nada.
 */
const props = defineProps<{ value: number | null | undefined; invert?: boolean; soft?: boolean }>()

// Bajo medio punto no se considera variación: se muestra plano.
const trend = computed(() => {
  const v = props.value
  if (v === null || v === undefined) return null
  if (Math.abs(v) < 0.005) return 'flat'
  return v > 0 ? 'up' : 'down'
})

const tone = computed(() => {
  if (trend.value === 'flat') return 'flat'
  const good = trend.value === 'up' ? !props.invert : props.invert
  return good ? 'good' : 'bad'
})

const icon = computed(
  () =>
    ({
      up: 'fa-solid fa-arrow-up',
      down: 'fa-solid fa-arrow-down',
      flat: 'fa-solid fa-minus',
    })[trend.value ?? 'flat'],
)

const text = computed(() => formatPercent(Math.abs(props.value ?? 0)))
const sr = computed(() =>
  trend.value === 'down' ? site.ui.delta.down(text.value) : site.ui.delta.up(text.value),
)
</script>

<template>
  <span v-if="trend" class="delta" :class="[`delta--${tone}`, { 'delta--soft': soft }]">
    <i :class="icon" aria-hidden="true"></i>
    <span aria-hidden="true">{{ text }}</span>
    <span class="visually-hidden">{{ sr }}</span>
  </span>
</template>

<style scoped lang="scss">
.delta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  border-radius: $radius-pill;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  @include tabular;

  i {
    font-size: 0.62rem;
  }

  &--good {
    color: darken($success, 14%);
    background: $success-bg;
  }

  &--bad {
    color: darken($danger, 6%);
    background: $danger-bg;
  }

  &--flat {
    color: $ink-soft;
    background: $sand;
  }

  // Sin fondo: para dentro de tablas densas.
  &--soft {
    background: none;
    padding-inline: 0;
  }
}
</style>
