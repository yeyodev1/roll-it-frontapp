<script setup lang="ts">
import { computed } from 'vue'
import { inventoryCopy } from '@/config/inventoryCopy'

// Fila de una lista de ajustes: inicial, nombre con detalle, estado y el interruptor.
const props = defineProps<{ title: string; meta?: string; active?: boolean; badge?: string }>()
const emit = defineEmits<{ edit: []; toggle: [] }>()

const copy = inventoryCopy.settings
const initial = computed(() => props.title.trim().charAt(0).toUpperCase() || '·')
</script>

<template>
  <li class="row" :class="{ 'row--off': active === false }">
    <button type="button" class="row__main" @click="emit('edit')">
      <span class="row__avatar" aria-hidden="true">{{ initial }}</span>
      <span class="row__text">
        <span class="row__title">
          {{ title }}
          <span v-if="badge" class="row__badge">{{ badge }}</span>
        </span>
        <small v-if="meta" class="row__meta">{{ meta }}</small>
      </span>
      <i class="fa-solid fa-pen row__edit" aria-hidden="true"></i>
    </button>
    <span v-if="active !== undefined" class="row__state">{{
      active ? copy.active : copy.inactive
    }}</span>
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
  padding: 0.7rem $sp-4;
  border-top: 1px solid $line-soft;
  @include transition(background-color);

  @include from('md') {
    padding-inline: $sp-6;
  }

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: rgba($canvas, 0.6);

    .row__edit {
      opacity: 1;
    }
  }

  &--off .row__text,
  &--off .row__avatar {
    opacity: 0.5;
  }

  &__main {
    @include flex(row, center, flex-start, 0.75rem);
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  &__avatar {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: $radius-ctl;
    background: $accent-soft;
    color: $accent-deep;
    font-size: 0.85rem;
    font-weight: 700;
  }

  &__text {
    @include flex(column, flex-start, center, 0.05rem);
    min-width: 0;
  }

  &__title {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.9rem;
    font-weight: 600;
    color: $ink;
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
    font-size: 0.74rem;
    color: $ink-muted;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  &__edit {
    margin-left: 0.25rem;
    font-size: 0.7rem;
    color: $ink-muted;
    opacity: 0;
    @include transition(opacity);
  }

  &__state {
    font-size: 0.72rem;
    font-weight: 600;
    color: $ink-muted;

    @include until('md') {
      display: none;
    }
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
