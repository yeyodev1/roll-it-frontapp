<script setup lang="ts">
import { site } from '@/config/site'

/**
 * Skeleton genérico: un bloque con la altura del contenido final o, con
 * `lines`, un párrafo de líneas. Para formas concretas usar ui/skeleton/*.
 */
withDefaults(defineProps<{ height?: string; lines?: number; card?: boolean }>(), {
  height: '7rem',
  lines: 0,
  card: false,
})
</script>

<template>
  <div class="loading" :class="{ 'loading--card': card }" role="status" aria-busy="true">
    <span class="visually-hidden">{{ site.ui.loading }}</span>
    <span v-if="!lines" class="sk loading__block" :style="{ height }" aria-hidden="true"></span>
    <template v-else>
      <span
        v-for="n in lines"
        :key="n"
        class="sk sk--line"
        :style="{ width: `${100 - (n % 3) * 18}%` }"
        aria-hidden="true"
      ></span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.loading {
  @include flex(column, stretch, flex-start, 0.6rem);
  width: 100%;

  &--card {
    @include card;
    padding: 1.1rem;
  }

  &__block {
    border-radius: 14px;
  }
}
</style>
