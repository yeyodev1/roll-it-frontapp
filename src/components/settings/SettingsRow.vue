<script setup lang="ts">
import { inventoryCopy } from '@/config/inventoryCopy'

defineProps<{ title: string; meta?: string; active?: boolean; badge?: string }>()
const emit = defineEmits<{ edit: []; toggle: [] }>()

const copy = inventoryCopy.settings
</script>

<template>
  <li class="row" :class="{ 'row--off': active === false }">
    <button type="button" class="row__main" @click="emit('edit')">
      <span class="row__title">
        {{ title }}
        <span v-if="badge" class="row__badge">{{ badge }}</span>
      </span>
      <small v-if="meta" class="row__meta">{{ meta }}</small>
    </button>
    <button
      v-if="active !== undefined"
      type="button"
      class="toggle"
      role="switch"
      :aria-checked="active"
      :aria-label="active ? copy.deactivate : copy.activate"
      :title="active ? copy.active : copy.inactive"
      @click="emit('toggle')"
    >
      <span class="toggle__knob"></span>
    </button>
  </li>
</template>

<style scoped lang="scss">
.row {
  @include flex(row, center, space-between, 0.8rem);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $line;

  &:last-child {
    border-bottom: none;
  }

  &--off .row__main {
    opacity: 0.5;
  }

  &__main {
    @include flex(column, flex-start, center, 0.1rem);
    flex: 1;
    min-width: 0;
    text-align: left;

    &:hover .row__title {
      color: $accent-deep;
    }
  }

  &__title {
    @include flex(row, center, flex-start, 0.4rem);
    font-weight: 600;
    @include transition(color);
  }

  &__badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.45rem;
    border-radius: $radius-pill;
    background: $warning-bg;
    color: darken($warning, 18%);
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
}

.toggle {
  flex: 0 0 auto;
  position: relative;
  width: 2.6rem;
  height: 1.5rem;
  border-radius: $radius-pill;
  background: $line;
  @include transition(background);

  &__knob {
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: $surface;
    box-shadow: $shadow-sm;
    @include transition(transform);
  }

  &[aria-checked='true'] {
    background: $success;

    .toggle__knob {
      transform: translateX(1.1rem);
    }
  }
}
</style>
