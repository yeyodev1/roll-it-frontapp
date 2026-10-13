<script setup lang="ts">
import { toRef } from 'vue'
import SheetPanel from './SheetPanel.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import { useInventoryAdjust } from '@/composables/useInventoryAdjust'
import { useUserStore } from '@/stores/user'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'
import type { StockRow } from '@/types'

const props = defineProps<{ row: StockRow | null }>()
const emit = defineEmits<{ close: []; saved: [row: StockRow] }>()

const copy = inventoryCopy.adjust
const userStore = useUserStore()

const {
  quantity,
  type,
  note,
  minStock,
  maxStock,
  saving,
  signed,
  preview,
  saveAdjust,
  saveThresholds,
} = useInventoryAdjust(toRef(props, 'row'), (row) => {
  emit('saved', row)
  emit('close')
})
</script>

<template>
  <SheetPanel
    :open="Boolean(row)"
    :title="row?.ingredient.name || copy.title"
    :subtitle="row?.branch.name"
    @close="emit('close')"
  >
    <template v-if="row">
      <div class="now">
        <span class="now__label">{{ copy.current }}</span>
        <span class="now__qty num">{{ formatQty(row.quantity, row.ingredient.unit) }}</span>
        <StatusBadge :status="row.status" />
      </div>

      <div class="types" role="radiogroup" :aria-label="copy.type">
        <button
          v-for="t in copy.types"
          :key="t.value"
          type="button"
          class="chip"
          role="radio"
          :aria-checked="type === t.value"
          :aria-pressed="type === t.value"
          @click="type = t.value as 'waste' | 'adjustment'"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="field">
        <label for="adjust-qty">{{ copy.quantity }} · {{ row.ingredient.unit }}</label>
        <input
          id="adjust-qty"
          v-model.number="quantity"
          class="big"
          type="number"
          step="any"
          inputmode="decimal"
        />
        <span v-if="signed" class="field__hint num">
          {{ copy.result }}: {{ formatQty(preview, row.ingredient.unit) }}
        </span>
      </div>

      <div class="field">
        <label for="adjust-note">{{ copy.note }}</label>
        <input
          id="adjust-note"
          v-model="note"
          type="text"
          :placeholder="copy.notePlaceholder"
          maxlength="200"
        />
      </div>

      <button class="btn btn--primary" :disabled="saving" @click="saveAdjust">
        <i class="fa-solid fa-check" aria-hidden="true"></i> {{ copy.save }}
      </button>

      <section v-if="userStore.isAdmin" class="limits">
        <h3 class="limits__title">
          {{ copy.thresholds }}
          <InfoTip :text="copy.thresholdsHelp" />
        </h3>
        <div class="limits__row">
          <div class="field">
            <label for="adjust-min">{{ copy.min }} · {{ row.ingredient.unit }}</label>
            <input
              id="adjust-min"
              v-model.number="minStock"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
            />
          </div>
          <div class="field">
            <label for="adjust-max">{{ copy.max }} · {{ row.ingredient.unit }}</label>
            <input
              id="adjust-max"
              v-model.number="maxStock"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
            />
          </div>
        </div>
        <button class="btn btn--ghost" :disabled="saving" @click="saveThresholds">
          {{ copy.saveThresholds }}
        </button>
      </section>
    </template>
  </SheetPanel>
</template>

<style scoped lang="scss">
.now {
  @include flex(row, baseline, flex-start, 0.6rem);
  flex-wrap: wrap;

  &__label {
    @include eyebrow;
    color: $ink-muted;
  }

  &__qty {
    @include display($display-sm, 500);
  }
}

.types {
  @include flex(row, center, flex-start, 0.5rem);
  flex-wrap: wrap;
}

.big {
  font-size: 1.5rem;
  font-weight: 600;
  padding-block: 0.8rem;
}

.limits {
  @include flex(column, stretch, flex-start, 0.8rem);
  margin-top: 0.8rem;
  padding-top: 1.1rem;
  border-top: 1px dashed $line;

  &__title {
    @include flex(row, center, flex-start, 0.4rem);
    font-family: $font-principal;
    font-size: $text-sm;
    font-weight: 600;
  }

  &__row {
    @include flex-cards(140px, 0.7rem);
  }
}
</style>
