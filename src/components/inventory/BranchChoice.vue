<script setup lang="ts">
import type { Branch } from '@/types'

// Elegir sucursal con un toque (pantallas que escriben stock y no aceptan "todas").
defineProps<{ branches: Branch[]; title: string }>()
const emit = defineEmits<{ pick: [id: string] }>()
</script>

<template>
  <section class="pick">
    <p class="pick__title">{{ title }}</p>
    <div class="pick__list">
      <button
        v-for="b in branches"
        :key="b._id"
        type="button"
        class="pick__item"
        @click="emit('pick', b._id)"
      >
        <span class="pick__icon" aria-hidden="true"><i class="fa-solid fa-store"></i></span>
        <strong>{{ b.name }}</strong>
        <i class="fa-solid fa-arrow-right pick__go" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pick {
  @include card;
  @include flex(column, stretch, flex-start, $sp-4);
  padding: $sp-6 $sp-4;

  @include from('md') {
    padding: $sp-8;
  }

  &__title {
    font-weight: 700;
    color: $ink;
  }

  &__list {
    @include flex-cards(200px, $sp-3);
  }

  &__item {
    @include flex(row, center, flex-start, $sp-3);
    padding: $sp-4;
    border: 1px solid $line;
    border-radius: $radius-card;
    text-align: left;
    @include transition;

    &:hover {
      border-color: $accent;
      background: rgba($accent-soft, 0.5);

      .pick__go {
        transform: translateX(3px);
        color: $accent;
      }
    }

    strong {
      flex: 1;
      font-weight: 600;
    }
  }

  &__icon {
    @include flex(row, center, center);
    width: 2.5rem;
    height: 2.5rem;
    border-radius: $radius-ctl;
    background: $accent-soft;
    color: $accent-deep;
  }

  &__go {
    color: $ink-muted;
    @include transition(transform);
  }
}
</style>
