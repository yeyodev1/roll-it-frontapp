<script setup lang="ts">
import { computed, ref } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'

interface Cell {
  weekday: number
  hour: number
  salesCents: number
  tickets: number
}

const props = defineProps<{ cells: Cell[]; format: (cents: number) => string }>()

const copy = dashboardCopy.operations
// La semana del restaurante empieza el lunes.
const WEEK = [1, 2, 3, 4, 5, 6, 0]

// Solo las horas en las que hubo ventas algún día: las horas cerradas no ocupan lugar.
const hours = computed(() => [...new Set(props.cells.map((c) => c.hour))].sort((a, b) => a - b))
const byKey = computed(() => new Map(props.cells.map((c) => [`${c.weekday}-${c.hour}`, c])))
const max = computed(() => Math.max(...props.cells.map((c) => c.salesCents), 1))
const dense = computed(() => hours.value.length > 12)

const selected = ref<Cell | null>(null)

function cell(weekday: number, hour: number): Cell | undefined {
  return byKey.value.get(`${weekday}-${hour}`)
}

function shade(c?: Cell): string | undefined {
  if (!c || !c.salesCents) return undefined
  const alpha = 0.1 + 0.9 * (c.salesCents / max.value)
  return `rgba(228, 87, 46, ${alpha.toFixed(2)})`
}

function describe(weekday: number, hour: number): string {
  const c = cell(weekday, hour)
  return copy.heatCell(weekday, hour, props.format(c?.salesCents ?? 0), c?.tickets ?? 0)
}

function select(weekday: number, hour: number) {
  const c = cell(weekday, hour) ?? { weekday, hour, salesCents: 0, tickets: 0 }
  const same = selected.value?.weekday === weekday && selected.value?.hour === hour
  selected.value = same ? null : c
}

function isSelected(weekday: number, hour: number): boolean {
  return selected.value?.weekday === weekday && selected.value?.hour === hour
}

const legend = [0.1, 0.32, 0.55, 0.77, 1]
</script>

<template>
  <div class="heat">
    <div class="heat__row heat__row--head" aria-hidden="true">
      <span class="heat__day"></span>
      <span v-for="(h, i) in hours" :key="h" class="heat__hour">{{
        !dense || i % 2 === 0 ? h : ''
      }}</span>
    </div>

    <div v-for="d in WEEK" :key="d" class="heat__row">
      <span class="heat__day">{{ site.weekdaysShort[d] }}</span>
      <button
        v-for="h in hours"
        :key="h"
        type="button"
        class="heat__cell"
        :class="{ 'heat__cell--on': isSelected(d, h) }"
        :style="{ background: shade(cell(d, h)) }"
        :title="describe(d, h)"
        :aria-label="describe(d, h)"
        :aria-pressed="isSelected(d, h)"
        @click="select(d, h)"
      ></button>
    </div>

    <div class="heat__foot">
      <p class="heat__detail num" aria-live="polite">
        <template v-if="selected">
          <i class="fa-solid fa-clock" aria-hidden="true"></i>
          {{ describe(selected.weekday, selected.hour) }}
        </template>
        <span v-else class="muted">{{ copy.heatTap }}</span>
      </p>
      <div class="heat__legend" aria-hidden="true">
        <span>{{ copy.heatLess }}</span>
        <i v-for="a in legend" :key="a" :style="{ background: `rgba(228, 87, 46, ${a})` }"></i>
        <span>{{ copy.heatMore }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heat {
  @include flex(column, stretch, flex-start, 3px);
  width: 100%;

  &__row {
    @include flex(row, center, flex-start, 3px);

    &--head {
      margin-bottom: 2px;
    }
  }

  &__day {
    flex: 0 0 2.4rem;
    font-size: 0.72rem;
    font-weight: 500;
    color: $ink-soft;
  }

  &__hour {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    font-size: 0.64rem;
    color: $ink-muted;
    font-variant-numeric: tabular-nums;
  }

  &__cell {
    flex: 1 1 0;
    min-width: 0;
    aspect-ratio: 1;
    max-height: 2.6rem;
    border-radius: 4px;
    background: $sand;
    @include transition(transform);

    &:hover {
      transform: scale(1.08);
    }

    &--on {
      outline: 2px solid $ink;
      outline-offset: 1px;
    }
  }

  &__foot {
    @include flex(row, center, space-between, 0.5rem 1rem);
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }

  &__detail {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.82rem;
    color: $ink;
    min-height: 1.3rem;

    i {
      color: $accent;
    }
  }

  &__legend {
    @include flex(row, center, flex-start, 3px);
    font-size: 0.68rem;
    color: $ink-muted;

    i {
      width: 0.85rem;
      height: 0.85rem;
      border-radius: 3px;
    }

    span:first-child {
      margin-right: 0.3rem;
    }

    span:last-child {
      margin-left: 0.3rem;
    }
  }
}
</style>
