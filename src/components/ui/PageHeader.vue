<script setup lang="ts">
import InfoTip from './InfoTip.vue'

defineProps<{ title: string; subtitle?: string; help?: string }>()
</script>

<template>
  <header class="page-header">
    <div class="page-header__text">
      <h1 class="page-header__title">
        {{ title }}
        <InfoTip v-if="help" :text="help" />
      </h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  @include flex(row, flex-end, space-between, 0.75rem 1rem);
  flex-wrap: wrap;

  &__text {
    min-width: 0;
  }

  &__title {
    @include display($display-sm, 500);
    @include flex(row, center, flex-start, 0.5rem);
  }

  &__subtitle {
    margin-top: 0.3rem;
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
    flex-wrap: wrap;
  }
}
</style>
