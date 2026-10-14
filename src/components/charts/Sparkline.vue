<script setup lang="ts">
import { computed, useId } from 'vue'
import { useChartBox } from '@/composables/useChartBox'
import { smoothPath } from '@/utils/chartScale'

// Tendencia mínima para una KPI: sin ejes ni tooltip, solo la forma.
const props = withDefaults(defineProps<{ values: number[]; color?: string; height?: number }>(), {
  color: 'var(--chart-1)',
  height: 36,
})

const gid = useId()
const { width } = useChartBox(120)

const paths = computed(() => {
  const v = props.values
  if (v.length < 2) return null
  const min = Math.min(...v)
  const max = Math.max(...v)
  const span = max - min || 1
  const h = props.height - 4
  const pts = v.map((n, i) => ({
    x: (i / (v.length - 1)) * width.value,
    y: 2 + (1 - (n - min) / span) * h,
  }))
  const line = smoothPath(pts)
  return { line, area: `${line} L${width.value},${props.height} L0,${props.height} Z` }
})
</script>

<template>
  <div ref="box" class="spark" :style="{ height: `${height}px` }" aria-hidden="true">
    <svg v-if="paths" :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height">
      <defs>
        <linearGradient :id="`${gid}-s`" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.22" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="paths.area" :fill="`url(#${gid}-s)`" />
      <path class="spark__line" :d="paths.line" :stroke="color" pathLength="1" />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.spark {
  width: 100%;

  svg {
    display: block;
    overflow: visible;
  }

  &__line {
    fill: none;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-dasharray: 1;
    animation: spark-draw 1s $ease both;
  }
}

@keyframes spark-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
