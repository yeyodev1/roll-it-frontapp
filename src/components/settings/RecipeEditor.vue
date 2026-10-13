<script setup lang="ts">
import { ref } from 'vue'
import SheetPanel from '@/components/inventory/SheetPanel.vue'
import IngredientPicker from '@/components/inventory/IngredientPicker.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import type { useRecipesEditor } from '@/composables/useRecipesEditor'
import { inventoryCopy } from '@/config/inventoryCopy'

const props = defineProps<{ editor: ReturnType<typeof useRecipesEditor> }>()

const copy = inventoryCopy.recipes
const confirmRemove = ref(false)
const { product, items, notes, loading, saving, byId } = props.editor

async function doRemove() {
  confirmRemove.value = false
  await props.editor.remove()
}
</script>

<template>
  <SheetPanel
    :open="Boolean(product)"
    :title="product?.name || copy.editorTitle"
    :subtitle="product?.category"
    @close="editor.close"
  >
    <p v-if="loading" class="muted"><i class="fa-solid fa-spinner fa-spin"></i></p>
    <template v-else>
      <ul class="items">
        <li v-for="item in items" :key="item.key" class="items__row">
          <div class="items__picker">
            <IngredientPicker v-model="item.ingredient" />
          </div>
          <div class="items__qty">
            <input
              v-model.number="item.quantity"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
              :aria-label="copy.qty"
              :placeholder="copy.qty"
            />
            <span>{{ byId(item.ingredient)?.unit || '' }}</span>
          </div>
          <button
            type="button"
            class="btn btn--ghost btn--icon btn--sm"
            :aria-label="inventoryCopy.invoice.removeLine"
            @click="editor.removeItem(item.key)"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </li>
      </ul>
      <button type="button" class="btn btn--ghost btn--sm add" @click="editor.addItem">
        <i class="fa-solid fa-plus" aria-hidden="true"></i> {{ copy.addItem }}
      </button>
      <div class="field">
        <label for="recipe-notes">{{ copy.notes }}</label>
        <textarea id="recipe-notes" v-model="notes" rows="3"></textarea>
      </div>
    </template>

    <template #footer>
      <button
        v-if="product?.hasRecipe"
        class="btn btn--ghost"
        :disabled="saving"
        @click="confirmRemove = true"
      >
        {{ copy.remove }}
      </button>
      <button class="btn btn--primary" :disabled="saving || loading" @click="editor.save">
        <i class="fa-solid fa-check" aria-hidden="true"></i> {{ copy.save }}
      </button>
    </template>
  </SheetPanel>

  <BaseModal
    :open="confirmRemove"
    :title="copy.removeTitle"
    :message="copy.removeMessage"
    :confirm-label="copy.remove"
    danger
    @confirm="doRemove"
    @cancel="confirmRemove = false"
  />
</template>

<style scoped lang="scss">
.items {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.5rem);

  &__row {
    @include flex(row, center, flex-start, 0.4rem);
    flex-wrap: wrap;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed $line;
  }

  &__picker {
    flex: 1 1 100%;

    @include from('sm') {
      flex-basis: 50%;
    }
  }

  &__qty {
    @include flex(row, center, flex-start, 0.35rem);
    flex: 1 1 8rem;

    span {
      font-size: $text-sm;
      color: $ink-muted;
      min-width: 2.6rem;
    }
  }
}

.add {
  align-self: flex-start;
}
</style>
