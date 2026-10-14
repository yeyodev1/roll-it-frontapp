<script setup lang="ts">
import { site } from '@/config/site'

// Tarjetas genéricas (meseros, estado de sincronización, franjas): título, cifra y líneas.
withDefaults(
  defineProps<{ count?: number; basis?: string; lines?: number; minHeight?: string }>(),
  {
    count: 3,
    basis: '280px',
    lines: 2,
    minHeight: '9rem',
  },
)
</script>

<template>
  <div class="sk-cards" :style="{ '--basis': basis }" role="status" aria-busy="true">
    <div
      v-for="n in count"
      :key="n"
      class="sk-cards__card"
      :style="{ minHeight }"
      aria-hidden="true"
    >
      <span class="sk-cards__head">
        <span class="sk sk--round sk-cards__dot"></span>
        <span class="sk sk--line" :style="{ width: `${40 + (n % 3) * 10}%` }"></span>
      </span>
      <span class="sk sk-cards__big"></span>
      <span
        v-for="l in lines"
        :key="l"
        class="sk sk--line"
        :style="{ width: `${90 - l * 18}%` }"
      ></span>
    </div>
    <span class="visually-hidden">{{ site.ui.loading }}</span>
  </div>
</template>

<style scoped lang="scss">
.sk-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @include from('md') {
    gap: 1rem;
  }

  &__card {
    @include card;
    @include flex(column, stretch, flex-start, 0.65rem);
    flex: 1 1 var(--basis);
    min-width: 0;
    padding: 1rem 1.1rem 1.1rem;
  }

  &__head {
    @include flex(row, center, flex-start, 0.5rem);
  }

  &__dot {
    flex: 0 0 auto;
    width: 0.9rem;
    height: 0.9rem;
  }

  &__big {
    width: 55%;
    height: 1.8rem;
  }
}
</style>
