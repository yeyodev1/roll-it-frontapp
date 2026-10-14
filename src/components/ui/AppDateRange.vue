<script setup lang="ts">
import { computed, ref } from 'vue'
import PopoverPanel from './PopoverPanel.vue'
import CalendarMonth from './CalendarMonth.vue'
import { site } from '@/config/site'
import { ecuadorDay } from '@/stores/filters'
import { clampDay, formatRange, monthOf } from '@/composables/useCalendar'

/**
 * Rango desde/hasta con calendario propio: primer toque elige el inicio,
 * el segundo el final (si va antes, se invierten) y "Aplicar" lo confirma.
 * `chip` lo pinta como pastilla para la barra de filtros.
 */
const props = defineProps<{
  min?: string
  max?: string
  label?: string
  placeholder?: string
  chip?: boolean
  /** Pastilla marcada (el rango personalizado está en uso). */
  active?: boolean
}>()
const from = defineModel<string>('from', { default: '' })
const to = defineModel<string>('to', { default: '' })
const emit = defineEmits<{ apply: [from: string, to: string] }>()

const copy = site.ui.calendar
const today = ecuadorDay()
const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const calendar = ref<InstanceType<typeof CalendarMonth> | null>(null)
const month = ref(monthOf(to.value || clampDay(today, props.min, props.max)))
const draftFrom = ref('')
const draftTo = ref('')
const hover = ref<string | null>(null)

const text = computed(() => (from.value && to.value ? formatRange(from.value, to.value) : ''))
const draftText = computed(() =>
  draftFrom.value && draftTo.value ? formatRange(draftFrom.value, draftTo.value) : '',
)
const hint = computed(() => (draftFrom.value && !draftTo.value ? copy.pickEnd : copy.pickStart))

function show() {
  draftFrom.value = from.value
  draftTo.value = to.value
  month.value = monthOf(to.value || clampDay(today, props.min, props.max))
  open.value = true
  requestAnimationFrame(() => calendar.value?.focusDay())
}

function hide(refocus = true) {
  open.value = false
  hover.value = null
  if (refocus) trigger.value?.focus()
}

function pick(key: string) {
  if (!draftFrom.value || draftTo.value) {
    draftFrom.value = key
    draftTo.value = ''
    return
  }
  const [a, b] = key < draftFrom.value ? [key, draftFrom.value] : [draftFrom.value, key]
  draftFrom.value = a
  draftTo.value = b
}

function apply() {
  if (!draftFrom.value || !draftTo.value) return
  from.value = draftFrom.value
  to.value = draftTo.value
  emit('apply', draftFrom.value, draftTo.value)
  hide()
}
</script>

<template>
  <div class="range" :class="{ 'range--chip': chip }">
    <button
      ref="trigger"
      type="button"
      :class="chip ? 'chip' : 'range__trigger'"
      :aria-pressed="chip ? active : undefined"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open ? hide() : show()"
    >
      <i class="fa-regular fa-calendar range__icon" aria-hidden="true"></i>
      <span class="num">{{
        (chip && !active) || !text ? placeholder || copy.rangePlaceholder : text
      }}</span>
    </button>

    <PopoverPanel
      :open="open"
      :anchor="trigger"
      :title="label || copy.rangePlaceholder"
      :min-width="320"
      @close="(r) => hide(r !== 'outside')"
    >
      <div role="dialog" :aria-label="label || copy.rangePlaceholder">
        <p class="range__hint" aria-live="polite">{{ hint }}</p>
        <CalendarMonth
          ref="calendar"
          v-model:month="month"
          :from="draftFrom"
          :to="draftTo"
          :preview="draftFrom && !draftTo ? hover || undefined : undefined"
          :min="min"
          :max="max"
          :today="today"
          @pick="pick"
          @hover="hover = $event"
        />
      </div>
      <template #footer>
        <span class="range__draft num">{{ draftText }}</span>
        <button
          type="button"
          class="btn btn--dark btn--sm"
          :disabled="!draftFrom || !draftTo"
          @click="apply"
        >
          {{ copy.apply }}
        </button>
      </template>
    </PopoverPanel>
  </div>
</template>

<style scoped lang="scss">
.range {
  min-width: 0;

  &--chip {
    flex: 0 0 auto;
  }

  &__trigger {
    @include flex(row, center, flex-start, 0.55rem);
    width: 100%;
    min-height: 2.9rem;
    padding: 0.55rem 0.9rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    font-size: 0.95rem;
    text-align: left;

    &[aria-expanded='true'],
    &:focus-visible {
      outline: none;
      border-color: $accent;
      box-shadow: 0 0 0 3px rgba($accent, 0.15);
    }
  }

  &__icon {
    font-size: 0.8rem;
  }

  &__trigger &__icon {
    color: $accent;
  }

  &__hint {
    padding: 0.75rem 1rem 0;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-muted;
  }

  &__draft {
    flex: 1;
    min-width: 0;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-soft;
  }
}
</style>
