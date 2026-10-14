<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { site } from '@/config/site'
import {
  clampDay,
  inBounds,
  monthMatrix,
  monthOf,
  monthTitle,
  keyTarget,
  shiftMonth,
  spokenDay,
  type CalendarDay,
} from '@/composables/useCalendar'

/**
 * Un mes en español, lunes primero: 6 filas flex de 7 días (nada de CSS grid).
 * Sirve para una fecha (`selected`) o para un rango (`from`/`to`, con `preview`
 * mientras se elige el final). Flechas mueven el foco, RePág/AvPág cambian de mes.
 */
const props = defineProps<{
  selected?: string
  from?: string
  to?: string
  preview?: string
  min?: string
  max?: string
  today: string
}>()
const month = defineModel<string>('month', { required: true })
const emit = defineEmits<{ pick: [key: string]; hover: [key: string | null] }>()

const copy = site.ui.calendar
const root = ref<HTMLElement | null>(null)
const focused = ref(
  props.selected || props.to || props.from || clampDay(props.today, props.min, props.max),
)

const weeks = computed(() => monthMatrix(month.value))
const canPrev = computed(() => !props.min || shiftMonth(month.value, -1) >= monthOf(props.min))
const canNext = computed(() => !props.max || shiftMonth(month.value, 1) <= monthOf(props.max))

// El rango visible: [from, to] o, mientras se elige, [from, preview] ordenado.
const span = computed(() => {
  const start = props.from
  const end = props.to || props.preview
  if (!start || !end) return null
  return start <= end ? [start, end] : [end, start]
})

function classes(d: CalendarDay) {
  const s = span.value
  return {
    'is-out': !d.inMonth,
    'is-today': d.key === props.today,
    'is-selected': d.key === props.selected || d.key === props.from || d.key === props.to,
    'is-in-range': Boolean(s && d.key > s[0]! && d.key < s[1]!),
    'is-start': Boolean(s && d.key === s[0] && s[0] !== s[1]),
    'is-end': Boolean(s && d.key === s[1] && s[0] !== s[1]),
    'is-focused': d.key === focused.value,
  }
}

const disabled = (d: CalendarDay) => !inBounds(d.key, props.min, props.max)

async function focusDay() {
  await nextTick()
  root.value?.querySelector<HTMLButtonElement>(`[data-day="${focused.value}"]`)?.focus()
}

function go(delta: number) {
  month.value = shiftMonth(month.value, delta)
}

function moveFocus(key: string) {
  focused.value = clampDay(key, props.min, props.max)
  if (monthOf(focused.value) !== month.value) month.value = monthOf(focused.value)
  focusDay()
}

function onKey(event: KeyboardEvent) {
  const next = keyTarget(event.key, focused.value)
  if (!next) return
  event.preventDefault()
  moveFocus(next)
}

function pick(d: CalendarDay) {
  if (disabled(d)) return
  focused.value = d.key
  emit('pick', d.key)
}

// Si el mes cambia con los botones, el foco "virtual" pasa a ese mes.
watch(month, (m) => {
  if (monthOf(focused.value) !== m) focused.value = clampDay(`${m}-01`, props.min, props.max)
})

defineExpose({ focusDay })
</script>

<template>
  <div ref="root" class="cal">
    <div class="cal__head">
      <button
        type="button"
        class="cal__nav"
        :disabled="!canPrev"
        :aria-label="copy.prevMonth"
        @click="go(-1)"
      >
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>
      <p class="cal__title" aria-live="polite">{{ monthTitle(month) }}</p>
      <button
        type="button"
        class="cal__nav"
        :disabled="!canNext"
        :aria-label="copy.nextMonth"
        @click="go(1)"
      >
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>

    <div
      class="cal__grid"
      role="grid"
      :aria-label="monthTitle(month)"
      @keydown="onKey"
      @pointerleave="emit('hover', null)"
    >
      <div class="cal__row cal__row--weekdays" role="row">
        <span
          v-for="(w, i) in copy.weekdays"
          :key="w"
          class="cal__weekday"
          role="columnheader"
          :aria-label="w"
        >
          {{ copy.weekdaysNarrow[i] }}
        </span>
      </div>
      <div v-for="(week, i) in weeks" :key="i" class="cal__row" role="row">
        <span v-for="d in week" :key="d.key" class="cal__cell" :class="classes(d)" role="gridcell">
          <button
            type="button"
            class="cal__day num"
            :data-day="d.key"
            :tabindex="d.key === focused ? 0 : -1"
            :disabled="disabled(d)"
            :aria-label="spokenDay(d.key)"
            :aria-pressed="classes(d)['is-selected']"
            :aria-current="d.key === today ? 'date' : undefined"
            @click="pick(d)"
            @pointerenter="emit('hover', d.key)"
            @focus="emit('hover', d.key)"
          >
            {{ d.day }}
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cal {
  @include flex(column, stretch, flex-start, 0.5rem);
  padding: 0.75rem;
  user-select: none;

  &__head {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__title {
    font-weight: 600;
    font-size: 0.92rem;
  }

  &__nav {
    @include flex(row, center, center);
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    color: $ink-soft;
    font-size: 0.8rem;
    @include transition(background);

    &:hover:not(:disabled) {
      background: $sand;
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  // Sin separación entre semanas: el tramo del rango se ve continuo de una fila a otra.
  &__grid {
    @include flex(column, stretch, flex-start);
  }

  &__row {
    @include flex(row, stretch, flex-start);
  }

  &__weekday,
  &__cell {
    flex: 1 1 0;
    min-width: 0;
  }

  &__weekday {
    padding: 0.3rem 0;
    text-align: center;
    font-size: 0.68rem;
    font-weight: 600;
    color: $ink-muted;
  }

  &__cell {
    @include flex(row, center, center);

    // El tramo del rango se pinta en la celda para que se vea continuo de punta a punta.
    &.is-in-range {
      background: $accent-soft;
    }

    &.is-start {
      background: linear-gradient(90deg, transparent 50%, $accent-soft 50%);
    }

    &.is-end {
      background: linear-gradient(90deg, $accent-soft 50%, transparent 50%);
    }
  }

  &__day {
    @include flex(row, center, center);
    width: 2.4rem;
    height: 2.4rem;
    max-width: 100%;
    border-radius: 50%;
    font-size: 0.85rem;
    color: $ink;
    @include transition(background);

    @include until('md') {
      width: 2.75rem;
      height: 2.75rem;
      font-size: 0.95rem;
    }

    &:hover:not(:disabled) {
      background: $sand;
    }

    &:focus-visible {
      outline: 2px solid $accent;
      outline-offset: 1px;
    }

    &:disabled {
      color: $line;
      cursor: default;
      text-decoration: line-through;
      text-decoration-color: rgba($ink-muted, 0.3);
    }
  }

  .is-out &__day {
    color: $ink-muted;
    opacity: 0.55;
  }

  .is-today &__day {
    box-shadow: inset 0 0 0 1.5px $ink-muted;
    font-weight: 700;
  }

  .is-selected &__day {
    background: $ink;
    color: $surface;
    font-weight: 600;
    opacity: 1;
  }
}
</style>
