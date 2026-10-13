<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useInventoryIngredients } from '@/composables/useInventoryIngredients'
import { normalize } from '@/composables/useInventoryStock'
import { inventoryCopy } from '@/config/inventoryCopy'

// Select con buscador: con 80 insumos un <select> nativo no se puede usar en el celular.
const model = defineModel<string | null>({ required: true })
defineProps<{ disabled?: boolean; invalid?: boolean }>()

const copy = inventoryCopy.ingredientPicker
const { active, byId } = useInventoryIngredients()
const open = ref(false)
const query = ref('')
const input = ref<HTMLInputElement | null>(null)

const selected = computed(() => byId(model.value))
const options = computed(() => {
  const term = normalize(query.value)
  if (!term) return active.value
  return active.value.filter(
    (i) => normalize(i.name).includes(term) || i.aliases.some((a) => normalize(a).includes(term)),
  )
})

async function toggle() {
  open.value = !open.value
  query.value = ''
  if (open.value) {
    await nextTick()
    input.value?.focus()
  }
}

function pick(id: string | null) {
  model.value = id
  open.value = false
}
</script>

<template>
  <div class="picker" :class="{ 'picker--open': open }">
    <button
      type="button"
      class="picker__trigger"
      :class="{ 'picker__trigger--invalid': invalid && !selected }"
      :disabled="disabled"
      :aria-expanded="open"
      @click="toggle"
    >
      <span v-if="selected" class="picker__value">
        {{ selected.name }} <small>{{ selected.unit }}</small>
      </span>
      <span v-else class="picker__placeholder">{{ inventoryCopy.invoice.pickIngredient }}</span>
      <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
    </button>
    <div v-if="open" class="picker__menu">
      <input
        ref="input"
        v-model="query"
        type="search"
        :placeholder="copy.search"
        @keydown.esc="open = false"
        @keydown.enter.prevent="options[0] && pick(options[0]._id)"
      />
      <ul class="picker__list" role="listbox">
        <li v-if="model">
          <button type="button" class="picker__option picker__option--none" @click="pick(null)">
            {{ copy.none }}
          </button>
        </li>
        <li v-for="i in options" :key="i._id">
          <button
            type="button"
            class="picker__option"
            :class="{ 'picker__option--active': i._id === model }"
            role="option"
            :aria-selected="i._id === model"
            @click="pick(i._id)"
          >
            {{ i.name }} <small>{{ i.unit }}</small>
          </button>
        </li>
        <li v-if="!options.length" class="picker__empty">{{ copy.empty }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.picker {
  position: relative;
  min-width: 0;

  &__trigger {
    @include flex(row, center, space-between, 0.5rem);
    width: 100%;
    min-height: 2.9rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    text-align: left;
    font-size: 0.95rem;

    i {
      font-size: 0.7rem;
      color: $ink-muted;
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

  &__value small,
  &__option small {
    color: $ink-muted;
    font-size: $text-xs;
  }

  &__placeholder {
    color: $ink-muted;
  }

  &__menu {
    position: absolute;
    z-index: 20;
    top: calc(100% + 0.35rem);
    left: 0;
    right: 0;
    @include card;
    box-shadow: $shadow-md;
    padding: 0.5rem;
  }

  &__list {
    list-style: none;
    max-height: 15rem;
    overflow-y: auto;
    margin-top: 0.4rem;
  }

  &__option {
    width: 100%;
    text-align: left;
    padding: 0.65rem 0.7rem;
    border-radius: 8px;
    font-size: $text-sm;

    &:hover,
    &--active {
      background: $sand;
    }

    &--none {
      color: $ink-muted;
    }
  }

  &__empty {
    padding: 0.7rem;
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
