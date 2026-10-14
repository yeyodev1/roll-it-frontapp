<script setup lang="ts">
import { computed } from 'vue'
import ChartTooltip, { type TipRow } from './ChartTooltip.vue'
import { useChartBox } from '@/composables/useChartBox'
import { useChartHover } from '@/composables/useChartHover'
import { BAR_PAD as PAD, useBarChart } from '@/composables/useBarChart'
import { dashboardCopy } from '@/config/dashboardCopy'

/**
 * Barras verticales redondeadas arriba. Con `compare`, cada columna lleva a su
 * izquierda la barra del período anterior en gris. `null` = sin dato (no se dibuja).
 */
const props = withDefaults(
  defineProps<{
    labels: string[]
    series: (number | null)[]
    compare?: (number | null)[]
    seriesLabel?: string
    compareLabel?: string
    format?: (value: number) => string
    axisFormat?: (value: number) => string
    height?: number
    color?: string
    /** Índice a resaltar sin hover (p. ej. el mes en curso). */
    highlight?: number | null
  }>(),
  {
    compare: () => [],
    seriesLabel: '',
    compareLabel: '',
    height: 260,
    color: 'var(--chart-1)',
    highlight: null,
  },
)

const copy = dashboardCopy.charts
const fmt = (v: number) => (props.format ? props.format(v) : String(Math.round(v)))
const axisFmt = (v: number) => (props.axisFormat ? props.axisFormat(v) : fmt(v))

const { width } = useChartBox()
const geo = useBarChart(
  () => ({ series: props.series, compare: props.compare, height: props.height }),
  width,
)
const { active, pick, leave, onKey, clear } = useChartHover(() => geo.count.value, geo.indexAt)
const drawKey = computed(() => props.series.join(','))

const tip = computed(() => {
  const i = active.value
  if (i === null) return null
  const b = geo.bars.value[i]
  if (!b) return null
  const v = props.series[i]
  const rows: TipRow[] = [
    { label: props.seriesLabel, value: v == null ? copy.noData : fmt(v), color: props.color },
  ]
  if (geo.paired.value) {
    const c = props.compare[i]
    rows.push({
      label: props.compareLabel,
      value: c == null ? copy.noData : fmt(c),
      color: 'var(--chart-compare)',
      muted: true,
    })
  }
  return { x: b.center, y: b.top, title: props.labels[i] ?? '', rows }
})
</script>

<template>
  <figure class="barc">
    <div v-if="geo.paired.value" class="barc__legend">
      <span class="barc__key"><i :style="{ background: color }"></i>{{ seriesLabel }}</span>
      <span class="barc__key"><i class="barc__swatch--compare"></i>{{ compareLabel }}</span>
    </div>

    <div
      ref="box"
      class="barc__plot"
      :style="{ height: `${height}px` }"
      tabindex="0"
      role="img"
      :aria-label="seriesLabel || copy.bars"
      @pointermove="pick"
      @pointerdown="pick"
      @pointerleave="leave"
      @keydown="onKey"
      @blur="clear"
    >
      <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" aria-hidden="true">
        <g class="barc__grid">
          <template v-for="g in geo.gridLines.value" :key="g.value">
            <line :x1="PAD.left" :x2="width - PAD.right" :y1="g.y" :y2="g.y" />
            <text :x="PAD.left - 8" :y="g.y" dy="0.32em" text-anchor="end">
              {{ axisFmt(g.value) }}
            </text>
          </template>
        </g>

        <rect
          v-if="tip"
          class="barc__band"
          :x="tip.x - geo.slot.value / 2"
          :y="PAD.top"
          :width="geo.slot.value"
          :height="geo.baseY.value - PAD.top"
          rx="8"
        />

        <g :key="drawKey" class="barc__bars">
          <g
            v-for="b in geo.bars.value"
            :key="b.i"
            class="barc__col"
            :class="{
              'barc__col--dim': (active ?? highlight) !== null && (active ?? highlight) !== b.i,
            }"
            :style="{ animationDelay: `${b.i * 35}ms` }"
          >
            <path v-if="b.previous" class="barc__prev" :d="b.previous" />
            <path v-if="b.current" :d="b.current" :fill="color" />
          </g>
        </g>

        <g class="barc__x">
          <template v-for="(l, i) in labels" :key="i">
            <text
              v-if="i % geo.labelEvery.value === 0"
              :x="geo.bars.value[i]?.center ?? 0"
              :y="height - 6"
              text-anchor="middle"
              :class="{ 'barc__x--on': active === i || (active === null && highlight === i) }"
            >
              {{ l }}
            </text>
          </template>
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
.barc {
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
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 3px;
    }
  }

  &__swatch--compare {
    background: $chart-compare;
  }

  &__plot {
    position: relative;
    width: 100%;
    touch-action: pan-y;
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
    }

    text {
      fill: $ink-muted;
      font-size: 11px;
      @include tabular;
    }
  }

  &__band {
    fill: rgba($ink, 0.035);
  }

  &__col {
    transform-box: fill-box;
    transform-origin: bottom;
    animation: bar-grow 0.6s $ease both;
    transition: opacity 0.2s ease;

    &--dim {
      opacity: 0.45;
    }
  }

  &__prev {
    fill: $chart-compare;
  }

  &__x text {
    fill: $ink-muted;
    font-size: 11px;
    transition: fill 0.2s ease;
  }

  &__x--on {
    fill: $ink !important;
    font-weight: 600;
  }
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
  }
}
</style>
