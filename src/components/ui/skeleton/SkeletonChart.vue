<script setup lang="ts">
import { site } from '@/config/site'

// Tarjeta con título, área del gráfico y etiquetas del eje: la silueta del LineChart.
withDefaults(defineProps<{ height?: number; title?: boolean; legend?: boolean }>(), {
  height: 200,
  title: true,
  legend: false,
})

// Alturas fijas de "barras" de fondo: sugieren un gráfico sin fingir datos.
const bars = [38, 52, 46, 64, 58, 72, 61, 80, 68, 76, 70, 88]
</script>

<template>
  <section class="card sk-chart" role="status" aria-busy="true">
    <span class="visually-hidden">{{ site.ui.loading }}</span>
    <span v-if="title" class="sk sk--line sk-chart__title" aria-hidden="true"></span>
    <div class="sk-chart__area" :style="{ height: `${height}px` }" aria-hidden="true">
      <span
        v-for="(h, i) in bars"
        :key="i"
        class="sk sk-chart__bar"
        :style="{ height: `${h}%` }"
      ></span>
    </div>
    <div class="sk-chart__axis" aria-hidden="true">
      <span v-for="n in 3" :key="n" class="sk sk--line"></span>
    </div>
    <div v-if="legend" class="sk-chart__legend" aria-hidden="true">
      <span v-for="n in 2" :key="n" class="sk sk--line"></span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.sk-chart {
  @include flex(column, stretch, flex-start, 0.75rem);

  &__title {
    width: 9rem;
    height: 0.95rem;
    margin-bottom: 0.4rem;
  }

  &__area {
    @include flex(row, flex-end, space-between, 0.35rem);
    padding-bottom: 1px;
    border-bottom: 1px solid $line;
  }

  &__bar {
    flex: 1 1 0;
    min-width: 0;
    border-radius: 6px 6px 0 0;
    opacity: 0.7;
  }

  &__axis,
  &__legend {
    @include flex(row, center, space-between, 1rem);

    .sk {
      width: 3rem;
      height: 0.65rem;
    }
  }

  &__legend {
    justify-content: flex-start;

    .sk {
      width: 5.5rem;
    }
  }
}
</style>
