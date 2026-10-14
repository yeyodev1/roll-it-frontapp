<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { chartColor } from '@/utils/chartScale'
import { formatPercent } from '@/utils/format'

export interface DonutItem {
  label: string
  value: number
  /** Valor ya formateado para la leyenda y el centro ("$25.540,10"). */
  display?: string
  /** Color propio; si no, el de su posición (var(--chart-n)). */
  color?: string
}

/**
 * Anillo de participación con leyenda. El centro muestra el total y, al pasar
 * o tocar un tramo (o su fila en la leyenda), el detalle de ese tramo.
 */
const props = withDefaults(
  defineProps<{ items: DonutItem[]; centerLabel: string; centerValue: string; size?: number }>(),
  { size: 168 },
)

const STROKE = 18
// Hueco de 2px entre tramos: separa los colores sin bordes.
const GAP = 2
const r = computed(() => (props.size - STROKE) / 2 - 3)
const circ = computed(() => 2 * Math.PI * r.value)
const total = computed(() => props.items.reduce((a, i) => a + Math.max(i.value, 0), 0))

const slices = computed(() => {
  let acc = 0
  return props.items.map((item, i) => {
    const share = total.value ? Math.max(item.value, 0) / total.value : 0
    const len = share * circ.value
    const slice = {
      ...item,
      i,
      share,
      color: item.color ?? chartColor(i),
      dash: `${Math.max(len - (props.items.length > 1 ? GAP : 0), 0)} ${circ.value}`,
      offset: -acc,
    }
    acc += len
    return slice
  })
})

const active = ref<number | null>(null)
const focus = computed(() => (active.value === null ? null : slices.value[active.value]))

// Arranca vacío y se "dibuja" al montar.
const drawn = ref(false)
onMounted(() => requestAnimationFrame(() => (drawn.value = true)))
</script>

<template>
  <figure class="donut">
    <div class="donut__ring" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size" aria-hidden="true">
        <circle class="donut__track" :cx="size / 2" :cy="size / 2" :r="r" :stroke-width="STROKE" />
        <circle
          v-for="s in slices"
          :key="s.label"
          class="donut__slice"
          :class="{ 'donut__slice--dim': active !== null && active !== s.i }"
          :cx="size / 2"
          :cy="size / 2"
          :r="r"
          :stroke="s.color"
          :stroke-width="active === s.i ? STROKE + 4 : STROKE"
          :stroke-dasharray="drawn ? s.dash : `0 ${circ}`"
          :stroke-dashoffset="s.offset"
          @pointerenter="active = s.i"
          @pointerleave="active = null"
          @pointerdown="active = s.i"
        />
      </svg>
      <div class="donut__center" aria-live="polite">
        <span class="donut__clabel">{{ focus ? focus.label : centerLabel }}</span>
        <strong class="donut__cvalue">{{
          focus ? formatPercent(focus.share) : centerValue
        }}</strong>
        <span v-if="focus" class="donut__csub">{{ focus.display }}</span>
      </div>
    </div>

    <ul class="donut__legend">
      <li
        v-for="s in slices"
        :key="s.label"
        class="donut__row"
        :class="{ 'donut__row--on': active === s.i }"
        tabindex="0"
        @pointerenter="active = s.i"
        @pointerleave="active = null"
        @focus="active = s.i"
        @blur="active = null"
      >
        <i class="donut__swatch" :style="{ background: s.color }" aria-hidden="true"></i>
        <span class="donut__name">{{ s.label }}</span>
        <span class="donut__pct">{{ formatPercent(s.share) }}</span>
        <span v-if="s.display" class="donut__val">{{ s.display }}</span>
      </li>
    </ul>
  </figure>
</template>

<style scoped lang="scss">
.donut {
  @include flex(row, center, center, 1.25rem 1.5rem);
  flex-wrap: wrap;
  width: 100%;

  &__ring {
    position: relative;
    flex: 0 0 auto;

    svg {
      display: block;
      transform: rotate(-90deg);
    }
  }

  &__track {
    fill: none;
    stroke: $sand;
    opacity: 0.6;
  }

  &__slice {
    fill: none;
    cursor: pointer;
    transition:
      stroke-dasharray 0.9s $ease,
      stroke-width 0.2s ease,
      opacity 0.2s ease;

    &--dim {
      opacity: 0.35;
    }
  }

  &__center {
    position: absolute;
    inset: 0;
    @include flex(column, center, center, 0.1rem);
    text-align: center;
    pointer-events: none;
    padding: 0 1.6rem;
  }

  &__clabel {
    @include card-label;
    font-size: 0.72rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__cvalue {
    @include figure(1.2rem);
  }

  &__csub {
    @include tabular;
    font-size: 0.7rem;
    color: $ink-soft;
  }

  &__legend {
    list-style: none;
    flex: 1 1 12rem;
    min-width: 0;
    @include flex(column, stretch, flex-start, 0.15rem);
  }

  &__row {
    @include flex(row, center, flex-start, 0.55rem);
    padding: 0.45rem 0.55rem;
    border-radius: $radius-ctl;
    font-size: 0.82rem;
    outline-offset: 0;
    @include transition(background-color);

    &--on {
      background: rgba($canvas, 0.9);
    }
  }

  &__swatch {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 3px;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    min-width: 0;
    color: $ink;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__pct {
    @include tabular;
    font-weight: 700;
    color: $ink;
  }

  &__val {
    @include tabular;
    min-width: 5.5rem;
    text-align: right;
    color: $ink-muted;
    font-size: 0.78rem;
  }
}
</style>
