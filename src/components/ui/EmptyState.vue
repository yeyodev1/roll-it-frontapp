<script setup lang="ts">
defineProps<{ icon?: string; title: string; text?: string }>()
</script>

<template>
  <div class="empty">
    <span class="empty__icon"><i :class="icon || 'fa-solid fa-inbox'" aria-hidden="true"></i></span>
    <p class="empty__title">{{ title }}</p>
    <p v-if="text" class="empty__text">{{ text }}</p>
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.empty {
  @include flex(column, center, center, 0.5rem);
  text-align: center;
  padding: 2.5rem 1.25rem;
  border: 1px dashed $line;
  border-radius: $radius-md;
  background: rgba($sand, 0.35);

  &__icon {
    @include flex(row, center, center);
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: $surface;
    color: $accent;
    font-size: 1.15rem;
    margin-bottom: 0.25rem;
  }

  &__title {
    font-weight: 600;
    color: $ink;
  }

  &__text {
    font-size: $text-sm;
    color: $ink-muted;
    max-width: 36ch;
  }

  &__actions {
    @include flex(row, center, center, 0.5rem);
    flex-wrap: wrap;
    margin-top: 0.6rem;
  }
}
</style>
