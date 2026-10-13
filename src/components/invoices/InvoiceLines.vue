<script setup lang="ts">
import IngredientPicker from '@/components/inventory/IngredientPicker.vue'
import { useInventoryIngredients } from '@/composables/useInventoryIngredients'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'
import type { LineDraft } from '@/composables/useInvoiceEditor'

defineProps<{ lines: LineDraft[]; editable: boolean }>()
const emit = defineEmits<{ add: []; remove: [key: number] }>()

const copy = inventoryCopy.invoice
const { byId } = useInventoryIngredients()
</script>

<template>
  <ul class="lines">
    <li
      v-for="line in lines"
      :key="line.key"
      class="line"
      :class="{ 'line--unlinked': !line.ingredient }"
    >
      <div class="line__head">
        <input
          v-if="editable"
          v-model="line.rawName"
          class="line__raw"
          type="text"
          :aria-label="copy.rawName"
          :placeholder="copy.rawName"
        />
        <span v-else class="line__raw-text">{{ line.rawName }}</span>
        <button
          v-if="editable"
          type="button"
          class="btn btn--ghost btn--icon btn--sm"
          :aria-label="copy.removeLine"
          @click="emit('remove', line.key)"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <small v-if="line.rawQuantity || line.rawUnit" class="line__read muted num">
        {{ copy.raw }}: {{ formatQty(line.rawQuantity) }} {{ line.rawUnit }}
      </small>

      <div class="line__fields">
        <div class="field line__ingredient">
          <label>{{ copy.ingredient }}</label>
          <IngredientPicker v-model="line.ingredient" :disabled="!editable" invalid />
          <span v-if="!line.ingredient" class="line__warn">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            {{ copy.unlinkedLine }}
          </span>
        </div>
        <div class="field">
          <label :for="`q-${line.key}`"
            >{{ copy.quantity }} · {{ byId(line.ingredient)?.unit || '—' }}</label
          >
          <input
            :id="`q-${line.key}`"
            v-model.number="line.quantity"
            type="number"
            min="0"
            step="any"
            inputmode="decimal"
            :disabled="!editable"
          />
        </div>
        <div class="field">
          <label :for="`c-${line.key}`">{{ copy.cost }} · $</label>
          <input
            :id="`c-${line.key}`"
            v-model.number="line.totalDollars"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            :disabled="!editable"
          />
        </div>
      </div>
    </li>
  </ul>
  <button v-if="editable" type="button" class="btn btn--ghost add" @click="emit('add')">
    <i class="fa-solid fa-plus" aria-hidden="true"></i> {{ copy.addLine }}
  </button>
</template>

<style scoped lang="scss">
.lines {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.6rem);
}

.line {
  @include card;
  @include flex(column, stretch, flex-start, 0.5rem);
  padding: 0.85rem 0.9rem 0.95rem;

  &--unlinked {
    border-color: rgba($warning, 0.7);
  }

  &__head {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__raw {
    font-weight: 600;
    border-color: transparent;
    background: $sand;
  }

  &__raw-text {
    font-weight: 600;
  }

  &__read {
    font-size: $text-xs;
    margin-top: -0.2rem;
  }

  &__fields {
    @include flex-cards(120px, 0.6rem);
  }

  &__ingredient {
    flex-basis: 100%;

    @include from('md') {
      flex-basis: 220px;
    }
  }

  &__warn {
    font-size: $text-xs;
    font-weight: 600;
    color: darken($warning, 18%);
  }
}

.add {
  align-self: flex-start;
}
</style>
