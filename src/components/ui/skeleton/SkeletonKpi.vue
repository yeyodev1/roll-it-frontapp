<script setup lang="ts">
import { site } from '@/config/site'

// Misma caja que KpiCard (etiqueta, ícono en la esquina, cifra, variación y
// tendencia) para que nada salte al llegar los datos.
withDefaults(defineProps<{ count?: number; delta?: boolean; spark?: boolean }>(), {
  count: 4,
  delta: true,
  spark: false,
})
</script>

<template>
  <div class="sk-kpis" role="status" aria-busy="true">
    <div v-for="n in count" :key="n" class="sk-kpis__card" aria-hidden="true">
      <span class="sk-kpis__head">
        <span class="sk sk--line" :style="{ width: `${42 + (n % 3) * 12}%` }"></span>
        <span class="sk sk-kpis__icon"></span>
      </span>
      <span class="sk sk-kpis__value"></span>
      <span v-if="delta" class="sk sk--pill sk-kpis__delta"></span>
      <span v-if="spark" class="sk sk-kpis__spark"></span>
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
    @include flex(column, flex-start, flex-start, 0.55rem);
    padding: $sp-4;
    min-height: 8rem;

    @include from('md') {
      padding: $sp-5 $sp-5 $sp-4;
    }
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.45rem);
    width: 100%;
    min-height: 2.25rem;
  }

  &__icon {
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: $radius-ctl;
  }

  &__value {
    width: 70%;
    height: 1.9rem;
  }

  &__delta {
    width: 3.6rem;
    height: 1.25rem;
  }

  &__spark {
    width: 100%;
    height: 2.25rem;
    margin-top: auto;
    opacity: 0.6;
  }
}
</style>
