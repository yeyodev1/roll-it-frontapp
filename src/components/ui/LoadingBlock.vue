<script setup lang="ts">
withDefaults(defineProps<{ height?: string; lines?: number }>(), { height: '7rem', lines: 0 })
</script>

<template>
  <div class="skeleton" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">Cargando…</span>
    <div v-if="!lines" class="skeleton__block" :style="{ height }"></div>
    <template v-else>
      <div
        v-for="n in lines"
        :key="n"
        class="skeleton__line"
        :style="{ width: `${100 - (n % 3) * 18}%` }"
      ></div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.skeleton {
  @include flex(column, stretch, flex-start, 0.6rem);
  width: 100%;

  &__block,
  &__line {
    border-radius: $radius-sm;
    background: linear-gradient(90deg, $sand 0%, lighten($sand, 3%) 50%, $sand 100%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  &__block {
    border-radius: 14px;
  }

  &__line {
    height: 0.9rem;
  }
}

@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}
</style>
