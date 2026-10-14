<script setup lang="ts">
import { site } from '@/config/site'

// Encabezado + filas con las mismas columnas que la tabla final.
withDefaults(defineProps<{ rows?: number; cols?: number }>(), { rows: 6, cols: 4 })

const widths = [72, 48, 60, 40, 56, 66]
</script>

<template>
  <div class="sk-table" role="status" aria-busy="true">
    <span class="visually-hidden">{{ site.ui.loading }}</span>
    <div class="sk-table__row sk-table__row--head" aria-hidden="true">
      <span v-for="c in cols" :key="c" class="sk-table__cell">
        <span class="sk sk--line" style="width: 55%"></span>
      </span>
    </div>
    <div v-for="r in rows" :key="r" class="sk-table__row" aria-hidden="true">
      <span v-for="c in cols" :key="c" class="sk-table__cell">
        <span class="sk sk--line" :style="{ width: `${widths[(r + c) % widths.length]}%` }"></span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sk-table {
  @include card;
  overflow: hidden;

  &__row {
    @include flex(row, center, flex-start, 1rem);
    min-height: 3.1rem;
    padding: 0 1rem;
    border-bottom: 1px solid $line-soft;

    &:last-child {
      border-bottom: none;
    }

    &--head {
      min-height: 2.6rem;

      .sk {
        height: 0.55rem;
      }
    }
  }

  &__cell {
    flex: 1 1 0;
    min-width: 0;

    &:first-child {
      flex-grow: 2;
    }
  }
}
</style>
