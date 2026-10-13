<script setup lang="ts">
import { site } from '@/config/site'

withDefaults(defineProps<{ size?: number; inverse?: boolean; withName?: boolean }>(), {
  size: 28,
  inverse: false,
  withName: true,
})
</script>

<template>
  <span class="brand" :class="{ 'brand--inverse': inverse }">
    <!-- Corte de un roll: alga, arroz y relleno. -->
    <svg class="brand__mark" :width="size" :height="size" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" class="brand__nori" />
      <circle cx="16" cy="16" r="11" class="brand__rice" />
      <circle cx="13.6" cy="14.6" r="4.6" class="brand__fill" />
      <circle cx="19.4" cy="18.6" r="3" class="brand__fill brand__fill--alt" />
    </svg>
    <span v-if="withName" class="brand__name">{{ site.name }}</span>
  </span>
</template>

<style scoped lang="scss">
.brand {
  @include flex(row, center, flex-start, 0.55rem);
  color: $ink;

  &__mark {
    flex-shrink: 0;
  }

  &__nori {
    fill: $ink;
  }

  &__rice {
    fill: $paper;
  }

  &__fill {
    fill: $accent;

    &--alt {
      fill: $success;
    }
  }

  &__name {
    font-family: $font-display;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  &--inverse {
    color: $paper;

    // Sobre fondo oscuro el alga se aclara para que el aro se lea.
    .brand__nori {
      fill: lighten($ink, 18%);
    }
  }
}
</style>
