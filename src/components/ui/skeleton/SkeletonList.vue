<script setup lang="ts">
import { site } from '@/config/site'

/**
 * Filas de lista mientras carga. `rows` imita una lista con título, línea
 * secundaria y un valor a la derecha; `bars` imita BarList (texto + barra).
 */
withDefaults(
  defineProps<{
    rows?: number
    variant?: 'rows' | 'bars'
    card?: boolean
    avatar?: boolean
    /** Miniatura cuadrada a la izquierda (foto de factura). */
    thumb?: boolean
    trailing?: boolean
    title?: boolean
    /** Cada fila es su propia tarjeta, en "grilla" flex con esta base (p. ej. '320px'). */
    basis?: string
  }>(),
  { rows: 5, variant: 'rows', card: true, trailing: true },
)

const widths = [68, 52, 74, 46, 60, 56, 70, 50]
const w = (n: number) => `${widths[n % widths.length]}%`
</script>

<template>
  <div
    class="sk-list"
    :class="{
      'sk-list--card': card && !basis,
      'sk-list--split': basis,
      [`sk-list--${variant}`]: true,
    }"
    :style="basis ? { '--basis': basis } : undefined"
    role="status"
    aria-busy="true"
  >
    <span class="visually-hidden">{{ site.ui.loading }}</span>
    <span v-if="title" class="sk sk--line sk-list__title" aria-hidden="true"></span>
    <div v-for="n in rows" :key="n" class="sk-list__row" aria-hidden="true">
      <template v-if="variant === 'bars'">
        <span class="sk-list__text">
          <span class="sk sk--line" :style="{ width: w(n) }"></span>
          <span class="sk sk--line sk-list__value"></span>
        </span>
        <span class="sk sk--pill sk-list__track" :style="{ width: `${100 - n * 9}%` }"></span>
      </template>
      <template v-else>
        <span
          v-if="avatar || thumb"
          class="sk sk-list__avatar"
          :class="{ 'sk--round': avatar }"
        ></span>
        <span class="sk-list__main">
          <span class="sk sk--line" :style="{ width: w(n) }"></span>
          <span class="sk sk--line sk-list__meta" :style="{ width: w(n + 3) }"></span>
        </span>
        <span v-if="trailing" class="sk sk--line sk-list__value"></span>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sk-list {
  @include flex(column, stretch, flex-start);

  &--card {
    @include card;
  }

  &--bars {
    gap: 1.1rem;
  }

  &--split {
    flex-flow: row wrap;
    gap: 0.6rem;
  }

  &--split &__row,
  &--split &__row:last-child {
    @include card;
    flex: 1 1 var(--basis);
    min-width: 0;
    padding: 0.7rem 0.9rem 0.7rem 0.7rem;
  }

  &--split &__avatar {
    width: 3.2rem;
    height: 3.2rem;
  }

  &--bars.sk-list--card {
    padding: 1.1rem 1.1rem 1.25rem;

    @include from('md') {
      padding: 1.4rem 1.5rem 1.5rem;
    }
  }

  &__title {
    width: 8rem;
    height: 0.95rem;
    margin-bottom: 0.2rem;
  }

  &__row {
    @include flex(row, center, flex-start, 0.8rem);
    min-height: 3.6rem;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid $line;

    &:last-child {
      border-bottom: none;
    }
  }

  &--bars &__row {
    @include flex(column, stretch, flex-start, 0.45rem);
    min-height: 0;
    padding: 0;
    border-bottom: none;
  }

  &__text {
    @include flex(row, center, space-between, 1rem);
  }

  &__track {
    height: 0.5rem;
    min-width: 20%;
  }

  &__avatar {
    flex: 0 0 auto;
    width: 2.2rem;
    height: 2.2rem;
  }

  &__main {
    @include flex(column, stretch, flex-start, 0.45rem);
    flex: 1;
    min-width: 0;
  }

  &__meta {
    height: 0.6rem;
    opacity: 0.75;
  }

  &__value {
    flex: 0 0 auto;
    width: 3.8rem;
  }
}
</style>
