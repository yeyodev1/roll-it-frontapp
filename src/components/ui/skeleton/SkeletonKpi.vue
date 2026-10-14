<script setup lang="ts">
import { site } from '@/config/site'

// Misma caja que KpiCard (etiqueta, cifra grande, variación) para que nada salte al llegar los datos.
withDefaults(defineProps<{ count?: number; delta?: boolean }>(), { count: 4, delta: true })
</script>

<template>
  <div class="sk-kpis" role="status" aria-busy="true">
    <div v-for="n in count" :key="n" class="sk-kpis__card" aria-hidden="true">
      <span class="sk-kpis__head">
        <span class="sk sk--round sk-kpis__icon"></span>
        <span class="sk sk--line" :style="{ width: `${48 + (n % 3) * 12}%` }"></span>
      </span>
      <span class="sk sk-kpis__value"></span>
      <span v-if="delta" class="sk sk--pill sk-kpis__delta"></span>
    </div>
    <span class="visually-hidden">{{ site.ui.loading }}</span>
  </div>
</template>

<style scoped lang="scss">
.sk-kpis {
  @include flex-cards(150px, 0.75rem);

  @include from('md') {
    @include flex-cards(200px, 1rem);
  }

  &__card {
    @include card;
    @include flex(column, flex-start, flex-start, 0.6rem);
    padding: 0.95rem 1rem 1rem;
    min-height: 7.4rem;

    @include from('md') {
      padding: 1.25rem 1.35rem 1.3rem;
      min-height: 8.6rem;
    }
  }

  &__head {
    @include flex(row, center, flex-start, 0.45rem);
    width: 100%;
    min-height: 1.4rem;
  }

  &__icon {
    flex: 0 0 auto;
    width: 0.9rem;
    height: 0.9rem;
  }

  &__value {
    width: 72%;
    height: 2rem;

    @include from('md') {
      height: 2.4rem;
    }
  }

  &__delta {
    width: 3.6rem;
    height: 1.35rem;
  }
}
</style>
