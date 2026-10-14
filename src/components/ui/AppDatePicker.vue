<script setup lang="ts">
import { computed, ref } from 'vue'
import PopoverPanel from './PopoverPanel.vue'
import CalendarMonth from './CalendarMonth.vue'
import { site } from '@/config/site'
import { ecuadorDay } from '@/stores/filters'
import { clampDay, formatDay, inBounds, monthOf } from '@/composables/useCalendar'

/** Una fecha ('YYYY-MM-DD') con calendario propio. En vez del calendario nativo del navegador. */
const props = defineProps<{
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  label?: string
  id?: string
}>()
const model = defineModel<string>({ default: '' })

const copy = site.ui.calendar
const today = ecuadorDay()
const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const calendar = ref<InstanceType<typeof CalendarMonth> | null>(null)
const month = ref(monthOf(model.value || clampDay(today, props.min, props.max)))
const canToday = computed(() => inBounds(today, props.min, props.max))

function show() {
  if (props.disabled) return
  month.value = monthOf(model.value || clampDay(today, props.min, props.max))
  open.value = true
  // El calendario se monta en el próximo tick: se enfoca cuando existe.
  requestAnimationFrame(() => calendar.value?.focusDay())
}

function hide(refocus = true) {
  open.value = false
  if (refocus) trigger.value?.focus()
}

function pick(key: string) {
  model.value = key
  hide()
}
</script>

<template>
  <div class="date">
    <button
      :id="id"
      ref="trigger"
      type="button"
      class="date__trigger"
      :class="{ 'date__trigger--open': open }"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="
        label
          ? `${label}: ${model ? formatDay(model) : placeholder || copy.placeholder}`
          : undefined
      "
      :disabled="disabled"
      @click="open ? hide() : show()"
      @keydown.down.prevent="show"
    >
      <i class="fa-regular fa-calendar date__icon" aria-hidden="true"></i>
      <span v-if="model" class="date__value num">{{ formatDay(model) }}</span>
      <span v-else class="date__placeholder">{{ placeholder || copy.placeholder }}</span>
    </button>

    <PopoverPanel
      :open="open"
      :anchor="trigger"
      :title="label || copy.placeholder"
      :min-width="300"
      @close="(r) => hide(r !== 'outside')"
    >
      <div role="dialog" :aria-label="label || copy.placeholder">
        <CalendarMonth
          ref="calendar"
          v-model:month="month"
          :selected="model"
          :min="min"
          :max="max"
          :today="today"
          @pick="pick"
        />
      </div>
      <template #footer>
        <button v-if="canToday" type="button" class="btn btn--ghost btn--sm" @click="pick(today)">
          {{ copy.today }}
        </button>
      </template>
    </PopoverPanel>
  </div>
</template>

<style scoped lang="scss">
.date {
  min-width: 0;

  &__trigger {
    @include flex(row, center, flex-start, 0.55rem);
    width: 100%;
    min-height: 2.9rem;
    padding: 0.55rem 0.9rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    color: $ink;
    font-size: 0.95rem;
    text-align: left;
    @include transition(border-color);

    &:hover {
      border-color: $ink-muted;
    }

    &:focus-visible,
    &--open {
      outline: none;
      border-color: $accent;
      box-shadow: 0 0 0 3px rgba($accent, 0.15);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
      background: $paper;
    }
  }

  &__icon {
    color: $accent;
    font-size: 0.85rem;
  }

  &__value,
  &__placeholder {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__placeholder {
    color: $ink-muted;
  }
}
</style>
