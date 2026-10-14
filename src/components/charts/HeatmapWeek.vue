<script setup lang="ts">
import { computed, ref } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { compactCents } from '@/utils/chartFormat'

interface Cell {
  weekday: number
  hour: number
  salesCents: number
  tickets: number
}

/**
 * Semana × hora. Cada cuadro se pinta según su venta; la mejor franja lleva
 * un anillo. Pasar el mouse (o tocar) muestra el detalle abajo; a la derecha,
 * el total de cada día.
 */
const props = defineProps<{ cells: Cell[]; format: (cents: number) => string }>()

const copy = dashboardCopy.operations
// La semana del restaurante empieza el lunes.
const WEEK = [1, 2, 3, 4, 5, 6, 0]

// Solo las horas en las que hubo ventas algún día: las horas cerradas no ocupan lugar.
const hours = computed(() => [...new Set(props.cells.map((c) => c.hour))].sort((a, b) => a - b))
const byKey = computed(() => new Map(props.cells.map((c) => [`${c.weekday}-${c.hour}`, c])))
const max = computed(() => Math.max(...props.cells.map((c) => c.salesCents), 1))
const best = computed(() =>
  props.cells.reduce<Cell | null>((a, c) => (!a || c.salesCents > a.salesCents ? c : a), null),
)
const dayTotals = computed(() => {
  const totals = new Map<number, number>()
  for (const c of props.cells) totals.set(c.weekday, (totals.get(c.weekday) ?? 0) + c.salesCents)
  return totals
})
const dayMax = computed(() => Math.max(...dayTotals.value.values(), 1))

const locked = ref<Cell | null>(null)
const hovered = ref<Cell | null>(null)
const shown = computed(() => hovered.value ?? locked.value)

function cell(weekday: number, hour: number): Cell {
  return byKey.value.get(`${weekday}-${hour}`) ?? { weekday, hour, salesCents: 0, tickets: 0 }
}

// Curva suave (^0.8): separa un poco más las horas medianas, donde se decide un turno.
function shade(c: Cell): string | undefined {
  if (!c.salesCents) return undefined
  const alpha = 0.07 + 0.93 * Math.pow(c.salesCents / max.value, 0.8)
  return `rgba(228, 87, 46, ${alpha.toFixed(2)})`
}

const same = (a: Cell | null, b: Cell) => a?.weekday === b.weekday && a?.hour === b.hour

function describe(c: Cell): string {
  return copy.heatCell(c.weekday, c.hour, props.format(c.salesCents), c.tickets)
}

function toggle(c: Cell) {
  locked.value = same(locked.value, c) ? null : c
}

const legend = [0.1, 0.3, 0.5, 0.75, 1]
</script>

<template>
  <div class="heat" @pointerleave="hovered = null">
    <div class="heat__row heat__row--head" aria-hidden="true">
      <span class="heat__day"></span>
      <span v-for="(h, i) in hours" :key="h" class="heat__hour">
        <span :class="{ 'heat__hour--odd': i % 2 }">{{ h }}h</span>
      </span>
      <span class="heat__total">{{ copy.heatDayTotal }}</span>
    </div>

    <div v-for="d in WEEK" :key="d" class="heat__row">
      <span class="heat__day">{{ site.weekdaysShort[d] }}</span>
      <button
        v-for="h in hours"
        :key="h"
        type="button"
        class="heat__cell"
        :class="{
          'heat__cell--on': same(locked, cell(d, h)),
          'heat__cell--best': best && same(best, cell(d, h)),
        }"
        :style="{ background: shade(cell(d, h)) }"
        :aria-label="describe(cell(d, h))"
        :aria-pressed="same(locked, cell(d, h))"
        @pointerenter="hovered = cell(d, h)"
        @focus="hovered = cell(d, h)"
        @blur="hovered = null"
        @click="toggle(cell(d, h))"
      ></button>
      <span class="heat__total num">
        <span
          class="heat__total-bar"
          :style="{ transform: `scaleX(${(dayTotals.get(d) ?? 0) / dayMax})` }"
          aria-hidden="true"
        ></span>
        <span>{{ compactCents(dayTotals.get(d) ?? 0) }}</span>
      </span>
    </div>

    <div class="heat__foot">
      <p class="heat__detail num" aria-live="polite">
        <template v-if="shown">
          <i class="fa-solid fa-clock" aria-hidden="true"></i>
          {{ describe(shown) }}
        </template>
        <span v-else class="muted">{{ copy.heatTap }}</span>
      </p>
      <div class="heat__legend" aria-hidden="true">
        <span class="heat__best-key"><i></i>{{ copy.heatBest }}</span>
        <span>{{ copy.heatLess }}</span>
        <i v-for="a in legend" :key="a" :style="{ background: `rgba(228, 87, 46, ${a})` }"></i>
        <span>{{ copy.heatMore }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.heat {
  @include flex(column, stretch, flex-start, 4px);
  width: 100%;

  &__row {
    @include flex(row, center, flex-start, 4px);

    &--head {
      margin-bottom: 2px;
    }
  }

  &__day {
    flex: 0 0 2.1rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__hour {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    font-size: 0.64rem;
    color: $ink-muted;
    @include tabular;

    // En el celular, una hora sí y una no: los números no se pisan.
    &--odd {
      @include until('md') {
        visibility: hidden;
      }
    }
  }

  &__cell {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    height: clamp(1.4rem, 3.4vw, 2.6rem);
    border-radius: 6px;
    background: rgba($sand, 0.7);
    @include transition(transform);

    &:hover {
      transform: scale(1.1);
      z-index: 1;
      box-shadow: $shadow-sm;
    }

    &--best::after {
      content: '';
      position: absolute;
      inset: -3px;
      border: 2px solid $ink;
      border-radius: 8px;
    }

    &--on {
      outline: 2px solid $chart-2;
      outline-offset: 2px;
    }
  }

  &__total {
    position: relative;
    flex: 0 0 4.5rem;
    @include flex(row, center, flex-end);
    padding-left: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: $ink;

    @include until('md') {
      display: none;
    }

    span:last-child {
      position: relative;
    }
  }

  &__row--head &__total {
    font-size: 0.64rem;
    font-weight: 500;
    color: $ink-muted;
  }

  &__total-bar {
    position: absolute;
    inset: 15% 0 15% 0.4rem;
    border-radius: 4px;
    background: rgba($accent, 0.1);
    transform-origin: right;
  }

  &__foot {
    @include flex(row, center, space-between, 0.5rem 1rem);
    flex-wrap: wrap;
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px solid $line-soft;
  }

  &__detail {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.82rem;
    font-weight: 500;
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

    > i {
      width: 0.85rem;
      height: 0.85rem;
      border-radius: 3px;
    }
  }

  &__best-key {
    @include flex(row, center, flex-start, 0.35rem);
    margin-right: 0.75rem;

    i {
      width: 0.85rem;
      height: 0.85rem;
      border: 2px solid $ink;
      border-radius: 4px;
    }
  }
}
</style>
