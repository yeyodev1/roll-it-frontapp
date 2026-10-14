<script setup lang="ts" generic="T extends string">
import { ref, useId } from 'vue'
import PopoverPanel from './PopoverPanel.vue'
import { useSelect, type SelectOption } from '@/composables/useSelect'
import { site } from '@/config/site'

/**
 * Selector propio (en vez del selector nativo del navegador): popover anclado en escritorio y hoja
 * inferior en el celular. Accesible como combobox + listbox.
 */
const props = defineProps<{
  options: SelectOption<T>[]
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  /** Nombre accesible y título de la hoja en el celular. */
  label?: string
  /** Icono a la izquierda del valor (p. ej. 'fa-solid fa-store'). */
  icon?: string
  invalid?: boolean
  /** Botón redondo tipo pastilla, como el de sucursal en la barra de filtros. */
  pill?: boolean
  id?: string
}>()
const model = defineModel<T>()

const uid = useId()
const listId = `${uid}-list`
const optionId = (i: number) => `${uid}-opt-${i}`
const trigger = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLElement | null>(null)
const search = ref<HTMLInputElement | null>(null)

const { open, query, active, selected, filtered, show, hide, choose, onTriggerKey, onListKey } =
  useSelect(() => props.options, model, {
    searchable: () => Boolean(props.searchable),
    optionId,
    focusTrigger: () => trigger.value?.focus(),
    // En el celular no se abre el teclado solo: tapa media hoja antes de ver las opciones.
    focusInside: () =>
      (props.searchable && !window.matchMedia('(max-width: 767px)').matches
        ? search.value
        : list.value
      )?.focus({ preventScroll: true }),
  })
</script>

<template>
  <div class="select" :class="{ 'select--pill': pill, 'select--open': open }">
    <button
      :id="id"
      ref="trigger"
      type="button"
      class="select__trigger"
      :class="{ 'select__trigger--invalid': invalid && !selected }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-label="label"
      :aria-invalid="invalid && !selected ? 'true' : undefined"
      :disabled="disabled"
      @click="open ? hide() : show()"
      @keydown="onTriggerKey"
    >
      <i v-if="icon" :class="icon" class="select__lead" aria-hidden="true"></i>
      <span v-if="selected" class="select__value">
        <i v-if="selected.icon && !icon" :class="selected.icon" aria-hidden="true"></i>
        {{ selected.label }}
        <small v-if="selected.hint">{{ selected.hint }}</small>
      </span>
      <span v-else class="select__placeholder">{{
        placeholder || site.ui.select.placeholder
      }}</span>
      <i class="fa-solid fa-chevron-down select__chev" aria-hidden="true"></i>
    </button>

    <PopoverPanel
      :open="open"
      :anchor="trigger"
      :title="label || placeholder"
      :min-width="220"
      @close="(reason) => hide(reason !== 'outside')"
    >
      <div v-if="searchable" class="select__search">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input
          ref="search"
          v-model="query"
          type="search"
          :placeholder="site.ui.select.search"
          :aria-label="site.ui.select.search"
          :aria-controls="listId"
          :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
          autocomplete="off"
          enterkeyhint="done"
          @keydown="onListKey"
        />
      </div>
      <ul
        :id="listId"
        ref="list"
        class="select__list"
        role="listbox"
        tabindex="-1"
        :aria-label="label || placeholder"
        :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
        @keydown="onListKey"
      >
        <li
          v-for="(o, i) in filtered"
          :id="optionId(i)"
          :key="o.value"
          class="select__option"
          :class="{ 'is-active': i === active, 'is-selected': o.value === model }"
          role="option"
          :aria-selected="o.value === model"
          @click="choose(o)"
          @pointermove="active = i"
        >
          <i v-if="o.icon" :class="o.icon" class="select__opt-icon" aria-hidden="true"></i>
          <span class="select__opt-label">{{ o.label }}</span>
          <small v-if="o.hint" class="select__opt-hint">{{ o.hint }}</small>
          <i v-if="o.value === model" class="fa-solid fa-check select__check" aria-hidden="true" />
        </li>
        <li v-if="!filtered.length" class="select__empty" role="presentation">
          {{ site.ui.select.empty }}
        </li>
      </ul>
    </PopoverPanel>
  </div>
</template>

<style scoped lang="scss">
.select {
  position: relative;
  min-width: 0;

  &__trigger {
    @include flex(row, center, flex-start, 0.55rem);
    position: relative;
    width: 100%;
    min-height: 2.9rem;
    padding: 0.55rem 2.3rem 0.55rem 0.9rem;
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
    .select--open & {
      outline: none;
      border-color: $accent;
      box-shadow: 0 0 0 3px rgba($accent, 0.15);
    }

    &--invalid {
      border-color: $warning;
      background: $warning-bg;
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  &--pill &__trigger {
    min-height: 2.75rem;
    border-color: rgba($line, 0.6);
    border-radius: $radius-pill;
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: $shadow-card;
  }

  &__lead,
  &__opt-icon,
  &__check {
    flex: 0 0 auto;
    color: $accent;
    font-size: 0.82rem;
  }

  &__value,
  &__placeholder {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__placeholder {
    color: $ink-muted;
  }

  &__value small,
  &__opt-hint {
    color: $ink-muted;
    font-size: $text-xs;
    font-weight: 400;
  }

  &__chev {
    position: absolute;
    right: 0.95rem;
    top: 50%;
    font-size: 0.7rem;
    color: $ink-muted;
    transform: translateY(-50%);
    transition: transform 0.2s $ease;

    .select--open & {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  &__search {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0.5rem;
    background: $surface;
    border-bottom: 1px solid $line;

    i {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: $ink-muted;
      font-size: 0.8rem;
    }

    input {
      padding: 0.6rem 0.8rem 0.6rem 2.2rem;
    }
  }

  &__list {
    list-style: none;
    padding: 0.35rem;
    outline: none;
  }

  &__option {
    @include flex(row, center, flex-start, 0.6rem);
    min-height: 2.6rem;
    padding: 0.55rem 0.7rem;
    border-radius: 8px;
    font-size: $text-sm;
    cursor: pointer;
    user-select: none;

    // Opciones grandes en la hoja inferior del celular.
    @include until('md') {
      min-height: 3.25rem;
      font-size: 1rem;
    }

    &.is-active {
      background: $sand;
    }

    &.is-selected {
      font-weight: 600;
    }
  }

  // Foco visible de la opción activa cuando se navega con teclado.
  &__list:focus-visible &__option.is-active,
  &__search:focus-within + &__list &__option.is-active {
    box-shadow: inset 0 0 0 2px rgba($accent, 0.55);
  }

  &__opt-label {
    flex: 1;
    min-width: 0;
  }

  &__empty {
    padding: 0.8rem 0.7rem;
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
