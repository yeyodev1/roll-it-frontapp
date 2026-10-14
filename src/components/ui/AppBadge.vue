<script setup lang="ts">
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'

/** Pastilla de estado (pedido confirmado, por revisar, agotado…). Siempre con texto: nunca solo color. */
withDefaults(defineProps<{ tone?: BadgeTone; icon?: string; dot?: boolean }>(), {
  tone: 'neutral',
})
</script>

<template>
  <span class="abadge" :class="`abadge--${tone}`">
    <i v-if="icon" :class="icon" aria-hidden="true"></i>
    <span v-else-if="dot" class="abadge__dot" aria-hidden="true"></span>
    <slot />
  </span>
</template>

<style scoped lang="scss">
.abadge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.6rem;
  border-radius: $radius-pill;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;

  i {
    font-size: 0.65rem;
  }

  &__dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: currentColor;
  }

  &--success {
    color: darken($success, 14%);
    background: $success-bg;
  }

  &--warning {
    color: darken($warning, 20%);
    background: $warning-bg;
  }

  &--danger {
    color: darken($danger, 6%);
    background: $danger-bg;
  }

  &--info {
    color: darken($info, 12%);
    background: $info-bg;
  }

  &--accent {
    color: $accent-deep;
    background: $accent-soft;
  }

  &--neutral {
    color: $ink-soft;
    background: $sand;
  }
}
</style>
