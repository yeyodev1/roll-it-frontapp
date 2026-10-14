<script setup lang="ts">
import { computed, useId } from 'vue'
import ChartTooltip, { type TipRow } from './ChartTooltip.vue'
import { useChartBox } from '@/composables/useChartBox'
import { useChartHover } from '@/composables/useChartHover'
import { AREA_PAD as PAD, useAreaChart } from '@/composables/useAreaChart'
import { dashboardCopy } from '@/config/dashboardCopy'

/**
 * Serie en el tiempo con relleno degradado. Opcional: una serie de comparación
 * punteada (período o año anterior). Tooltip con mouse, dedo o flechas.
 */
const props = withDefaults(
  defineProps<{
    labels: string[]
    series: number[]
    compare?: (number | null)[]
    seriesLabel?: string
    compareLabel?: string
    format?: (value: number) => string
    axisFormat?: (value: number) => string
    height?: number
    color?: string
  }>(),
  { compare: () => [], seriesLabel: '', compareLabel: '', height: 240, color: 'var(--chart-1)' },
)

const copy = dashboardCopy.charts
const gid = useId()
const fmt = (v: number) => (props.format ? props.format(v) : String(Math.round(v)))
const axisFmt = (v: number) => (props.axisFormat ? props.axisFormat(v) : fmt(v))

const { width } = useChartBox()
const geo = useAreaChart(
  () => ({
    labels: props.labels,
    series: props.series,
    compare: props.compare,
    height: props.height,
  }),
  width,
)
const { active, pick, leave, onKey, clear } = useChartHover(() => geo.count.value, geo.indexAt)

// Cambia con los datos: re-monta los trazos y repite la animación de entrada.
const drawKey = computed(() => props.series.join(','))

const tip = computed(() => {
  const i = active.value
  if (i === null) return null
  const rows: TipRow[] = [
    { label: props.seriesLabel, value: fmt(props.series[i] ?? 0), color: props.color },
  ]
  const c = props.compare[i]
  if (props.compare.length && c != null)
    rows.push({
      label: props.compareLabel,
      value: fmt(c),
      color: 'var(--chart-compare)',
      muted: true,
    })
  return { x: geo.x(i), y: geo.y(props.series[i] ?? 0), title: props.labels[i] ?? '', rows }
})
</script>

<template>
  <figure class="area">
    <div v-if="compare.length" class="area__legend">
      <span class="area__key"><i :style="{ background: color }"></i>{{ seriesLabel }}</span>
      <span class="area__key area__key--compare"><i></i>{{ compareLabel }}</span>
    </div>

    <div
      ref="box"
      class="area__plot"
      :style="{ height: `${height}px` }"
      tabindex="0"
      role="img"
      :aria-label="seriesLabel || copy.area"
      @pointermove="pick"
      @pointerdown="pick"
      @pointerleave="leave"
      @keydown="onKey"
      @blur="clear"
    >
      <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" aria-hidden="true">
        <defs>
          <linearGradient :id="`${gid}-fill`" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g class="area__grid">
          <template v-for="g in geo.gridLines.value" :key="g.value">
            <line :x1="PAD.left" :x2="width - PAD.right" :y1="g.y" :y2="g.y" />
            <text :x="PAD.left - 8" :y="g.y" dy="0.32em" text-anchor="end">
              {{ axisFmt(g.value) }}
            </text>
          </template>
        </g>

        <g :key="drawKey">
          <path
            v-if="geo.area.value"
            class="area__fill"
            :d="geo.area.value"
            :fill="`url(#${gid}-fill)`"
          />
          <path v-if="compare.length" class="area__compare" :d="geo.compareLine.value" />
          <path class="area__line" :d="geo.line.value" :stroke="color" pathLength="1" />
        </g>

        <g class="area__x">
          <text
            v-for="l in geo.xLabels.value"
            :key="l.i"
            :x="l.x"
            :y="height - 6"
            :text-anchor="l.anchor"
          >
            {{ l.text }}
          </text>
        </g>

        <g v-if="tip">
          <line class="area__cursor" :x1="tip.x" :x2="tip.x" :y1="PAD.top" :y2="geo.baseY.value" />
          <circle class="area__dot" :cx="tip.x" :cy="tip.y" r="5" :fill="color" />
        </g>
      </svg>

      <ChartTooltip
        v-if="tip"
        :x="tip.x"
        :y="tip.y"
        :width="width"
        :title="tip.title"
        :rows="tip.rows"
      />
    </div>
  </figure>
</template>

<style scoped lang="scss">
.area {
  width: 100%;
  min-width: 0;

  &__legend {
    @include flex(row, center, flex-start, 1rem);
    flex-wrap: wrap;
    margin-bottom: 0.6rem;
    font-size: 0.78rem;
    color: $ink-soft;
  }

  &__key {
    @include flex(row, center, flex-start, 0.4rem);

    i {
      width: 0.9rem;
      height: 3px;
      border-radius: 2px;
    }

    &--compare i {
      background: repeating-linear-gradient(90deg, $ink-muted 0 4px, transparent 4px 7px);
    }
  }

  &__plot {
    position: relative;
    width: 100%;
    touch-action: pan-y;
    cursor: crosshair;
    outline-offset: 4px;
    border-radius: $radius-sm;

    svg {
      display: block;
      overflow: visible;
    }
  }

  &__grid {
    line {
      stroke: $chart-grid;
      stroke-width: 1;
    }

    text {
      fill: $ink-muted;
      font-size: 11px;
      @include tabular;
    }
  }

  &__x text {
    fill: $ink-muted;
    font-size: 11px;
  }

  &__fill {
    animation: area-rise 0.7s $ease both;
    transform-box: fill-box;
    transform-origin: bottom;
  }

  &__line {
    fill: none;
    stroke-width: 2.25;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-dasharray: 1;
    animation: area-draw 0.9s $ease both;
  }

  &__compare {
    fill: none;
    stroke: $ink-muted;
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
    opacity: 0.7;
  }

  &__cursor {
    stroke: rgba($ink, 0.18);
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }

  &__dot {
    stroke: $surface;
    stroke-width: 2.5;
  }
}

@keyframes area-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes area-rise {
  from {
    opacity: 0;
    transform: scaleY(0.6);
  }
}
</style>
