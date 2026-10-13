<script setup lang="ts">
import { ref } from 'vue'
import { CHART_H as H, CHART_W as W, useLineChart } from '@/composables/useLineChart'

const props = withDefaults(
  defineProps<{
    labels: string[]
    series: number[]
    /** Serie de comparación (año anterior, etc.); null donde no hay dato. */
    compare?: (number | null)[]
    seriesLabel?: string
    compareLabel?: string
    format?: (value: number) => string
    axisFormat?: (value: number) => string
    height?: number
  }>(),
  { compare: () => [], seriesLabel: '', compareLabel: '', height: 200 },
)

const fmt = (v: number) => (props.format ? props.format(v) : String(Math.round(v)))
const axisFmt = (v: number) => (props.axisFormat ? props.axisFormat(v) : fmt(v))

const box = ref<HTMLElement | null>(null)
const {
  ticks,
  y,
  mainPath,
  comparePath,
  areaPath,
  active,
  activeLeft,
  activeTop,
  tipAlign,
  xLabels,
  pick,
  leave,
  onKey,
} = useLineChart(
  () => ({ labels: props.labels, series: props.series, compare: props.compare }),
  box,
)
</script>

<template>
  <figure class="line">
    <div v-if="compare.length" class="line__legend">
      <span class="line__key"><i class="line__swatch"></i>{{ seriesLabel }}</span>
      <span class="line__key"
        ><i class="line__swatch line__swatch--compare"></i>{{ compareLabel }}</span
      >
    </div>

    <div class="line__plot">
      <div class="line__axis" aria-hidden="true">
        <span v-for="t in ticks" :key="t.top" :style="{ top: `${t.top}%` }">{{
          axisFmt(t.value)
        }}</span>
      </div>

      <div
        ref="box"
        class="line__area"
        :style="{ height: `${height}px` }"
        tabindex="0"
        role="img"
        :aria-label="seriesLabel || 'Gráfico de línea'"
        @pointermove="pick"
        @pointerdown="pick"
        @pointerleave="leave"
        @keydown="onKey"
        @blur="active = null"
      >
        <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
          <line
            v-for="t in ticks"
            :key="t.top"
            class="line__grid"
            x1="0"
            :x2="W"
            :y1="y(t.value)"
            :y2="y(t.value)"
          />
          <path v-if="areaPath" class="line__fill" :d="areaPath" />
          <path v-if="compare.length" class="line__stroke line__stroke--compare" :d="comparePath" />
          <path class="line__stroke" :d="mainPath" />
        </svg>

        <template v-if="active !== null">
          <span class="line__cursor" :style="{ left: `${activeLeft}%` }"></span>
          <span class="line__dot" :style="{ left: `${activeLeft}%`, top: `${activeTop}%` }"></span>
          <div
            class="line__tip"
            :class="`line__tip--${tipAlign}`"
            :style="{ left: `${activeLeft}%` }"
          >
            <strong>{{ labels[active] }}</strong>
            <span class="num">{{ fmt(series[active] ?? 0) }}</span>
            <span v-if="compare.length && compare[active] != null" class="line__tip-compare num">
              {{ compareLabel }}: {{ fmt(compare[active] ?? 0) }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <div class="line__x" aria-hidden="true">
      <span v-for="l in xLabels" :key="l.left" :style="{ left: `${l.left}%` }">{{ l.text }}</span>
    </div>
  </figure>
</template>

<style scoped lang="scss">
.line {
  width: 100%;
  font-size: 0.72rem;
  color: $ink-muted;
  font-variant-numeric: tabular-nums;

  &__legend {
    @include flex(row, center, flex-start, 1rem);
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
    font-size: 0.78rem;
    color: $ink-soft;
  }

  &__key {
    @include flex(row, center, flex-start, 0.4rem);
  }

  &__swatch {
    width: 1.1rem;
    height: 0;
    border-top: 2px solid $accent;

    &--compare {
      border-top: 2px dashed $ink-muted;
    }
  }

  &__plot {
    @include flex(row, stretch, flex-start, 0.5rem);
  }

  &__axis {
    position: relative;
    flex: 0 0 auto;
    width: 3rem;

    span {
      position: absolute;
      right: 0;
      transform: translateY(-50%);
      white-space: nowrap;
    }
  }

  &__area {
    position: relative;
    flex: 1;
    min-width: 0;
    touch-action: pan-y;
    cursor: crosshair;
    outline-offset: 4px;

    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  }

  &__grid {
    stroke: $line;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  &__fill {
    fill: rgba($accent, 0.08);
  }

  &__stroke {
    fill: none;
    stroke: $accent;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;

    &--compare {
      stroke: $ink-muted;
      stroke-dasharray: 5 5;
    }
  }

  &__cursor {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba($ink, 0.25);
    pointer-events: none;
  }

  &__dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $accent;
    box-shadow: 0 0 0 2px $surface;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  &__tip {
    position: absolute;
    top: -0.5rem;
    transform: translate(-50%, -100%);
    @include flex(column, flex-start, flex-start, 0.1rem);
    padding: 0.45rem 0.65rem;
    border-radius: 8px;
    background: $ink;
    color: $paper;
    font-size: 0.75rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 5;

    &--start {
      transform: translate(-0.75rem, -100%);
    }

    &--end {
      transform: translate(calc(-100% + 0.75rem), -100%);
    }

    strong {
      font-weight: 600;
    }
  }

  &__tip-compare {
    color: rgba($paper, 0.65);
  }

  &__x {
    position: relative;
    height: 1.4rem;
    margin-top: 0.4rem;
    margin-left: 3.5rem;

    span {
      position: absolute;
      transform: translateX(-50%);
      white-space: nowrap;

      &:first-child {
        transform: none;
      }

      &:last-child {
        transform: translateX(-100%);
      }
    }
  }
}
</style>
