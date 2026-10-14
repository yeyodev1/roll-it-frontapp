<script setup lang="ts">
import { site } from '@/config/site'

/**
 * Silueta de una ChartCard mientras carga: `bars` (BarChart), `area` (AreaChart)
 * o `donut` (DonutChart con su leyenda).
 */
withDefaults(
  defineProps<{
    height?: number
    title?: boolean
    legend?: boolean
    variant?: 'bars' | 'area' | 'donut'
  }>(),
  { height: 200, title: true, legend: false, variant: 'bars' },
)

// Alturas fijas de "barras" de fondo: sugieren un gráfico sin fingir datos.
const bars = [38, 52, 46, 64, 58, 72, 61, 80, 68, 76, 70, 88]
</script>

<template>
  <section class="sk-chart" role="status" aria-busy="true">
    <span class="visually-hidden">{{ site.ui.loading }}</span>
    <span v-if="title" class="sk-chart__head" aria-hidden="true">
      <span class="sk sk--line sk-chart__title"></span>
      <span class="sk sk--pill sk-chart__action"></span>
    </span>
    <div v-if="legend" class="sk-chart__legend" aria-hidden="true">
      <span v-for="n in 2" :key="n" class="sk sk--line"></span>
    </div>

    <div v-if="variant === 'donut'" class="sk-chart__donut" aria-hidden="true">
      <span class="sk sk--round sk-chart__ring"></span>
      <span class="sk-chart__rows">
        <span
          v-for="n in 3"
          :key="n"
          class="sk sk--line"
          :style="{ width: `${90 - n * 12}%` }"
        ></span>
      </span>
    </div>

    <template v-else>
      <div
        class="sk-chart__area"
        :class="{ 'sk-chart__area--wave': variant === 'area' }"
        :style="{ height: `${height}px` }"
        aria-hidden="true"
      >
        <template v-if="variant === 'bars'">
          <span
            v-for="(h, i) in bars"
            :key="i"
            class="sk sk-chart__bar"
            :style="{ height: `${h}%` }"
          ></span>
        </template>
        <span v-else class="sk sk-chart__wave"></span>
      </div>
      <div class="sk-chart__axis" aria-hidden="true">
        <span v-for="n in 4" :key="n" class="sk sk--line"></span>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.sk-chart {
  @include card;
  @include flex(column, stretch, flex-start, 0.85rem);
  min-width: 0;
  padding: $sp-4;

  @include from('md') {
    padding: $sp-5 $sp-6 $sp-6;
  }

  &__head {
    @include flex(row, center, space-between, 1rem);
    margin-bottom: 0.25rem;
  }

  &__title {
    width: 9rem;
    height: 0.95rem;
  }

  &__action {
    width: 4.5rem;
    height: 1.6rem;
  }

  &__area {
    @include flex(row, flex-end, space-between, 0.45rem);
    padding-bottom: 1px;
    border-bottom: 1px solid $line-soft;
  }

  &__bar {
    flex: 1 1 0;
    min-width: 0;
    border-radius: 6px 6px 0 0;
    opacity: 0.75;
  }

  // El área se insinúa con una loma: más alta a la derecha, como suele crecer una venta.
  &__wave {
    flex: 1;
    height: 70%;
    border-radius: 60% 40% 0 0 / 40% 70% 0 0;
    opacity: 0.6;
  }

  &__axis,
  &__legend {
    @include flex(row, center, space-between, 1rem);

    .sk {
      width: 2.75rem;
      height: 0.6rem;
    }
  }

  &__legend {
    justify-content: flex-start;

    .sk {
      width: 5.5rem;
    }
  }

  &__donut {
    @include flex(row, center, center, 1.5rem);
    flex-wrap: wrap;
    padding: 0.5rem 0;
  }

  &__ring {
    width: 10.5rem;
    height: 10.5rem;
    -webkit-mask: radial-gradient(circle, transparent 54%, #000 55%);
    mask: radial-gradient(circle, transparent 54%, #000 55%);
  }

  &__rows {
    @include flex(column, stretch, flex-start, 0.9rem);
    flex: 1 1 10rem;
  }
}
</style>
