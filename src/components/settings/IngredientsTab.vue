<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import SheetPanel from '@/components/inventory/SheetPanel.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useSettingsResource } from '@/composables/useSettingsResource'
import { useInventoryIngredients } from '@/composables/useInventoryIngredients'
import { normalize } from '@/composables/useInventoryStock'
import { catalogService } from '@/services/catalog.service'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatCents, formatQty } from '@/utils/format'
import type { Ingredient, IngredientUnit } from '@/types'

interface IngredientForm {
  name: string
  unit: IngredientUnit
  cost: number | null
  min: number | null
  max: number | null
  aliases: string
}

const copy = inventoryCopy.settings
const units = (['g', 'kg', 'ml', 'l', 'unidad'] as IngredientUnit[]).map((u) => ({
  value: u,
  label: u,
}))
const search = ref('')
const shared = useInventoryIngredients()

const res = useSettingsResource<Ingredient, IngredientForm>({
  load: () => shared.loadIngredients(true).then((list) => [...list]),
  idOf: (i) => i._id,
  empty: () => ({ name: '', unit: 'kg', cost: null, min: null, max: null, aliases: '' }),
  toForm: (i) => ({
    name: i.name,
    unit: i.unit,
    cost: i.costPerUnitCents / 100,
    min: i.defaultMinStock,
    max: i.defaultMaxStock,
    aliases: i.aliases.join(', '),
  }),
  toPayload: (f) => ({
    name: f.name.trim(),
    unit: f.unit,
    costPerUnitCents: Math.round((Number(f.cost) || 0) * 100),
    defaultMinStock: Number(f.min) || 0,
    defaultMaxStock: Number(f.max) || 0,
    aliases: f.aliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean),
  }),
  create: (p) => catalogService.createIngredient(p),
  update: (id, p) => catalogService.updateIngredient(id, p),
  validate: (f) => (f.name.trim() ? null : copy.ingredient.name),
})
const { items, loading, error, saving, sheetOpen, editingId, form } = res

const visible = computed(() => {
  const term = normalize(search.value)
  return items.value
    .filter((i) => !term || normalize(i.name).includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
})

const meta = (i: Ingredient) =>
  `${formatCents(i.costPerUnitCents)} / ${i.unit} · ${formatQty(i.defaultMinStock)}–${formatQty(i.defaultMaxStock, i.unit)}`

// Facturas y recetas usan la caché compartida: que vean altas y bajas al instante.
watch(items, (list) => (shared.ingredients.value = [...list]), { deep: true })

onMounted(res.load)
</script>

<template>
  <SettingsSection
    :loading="loading"
    :error="error"
    @retry="res.load"
    :empty="!visible.length"
    :add-label="copy.ingredient.new"
    @add="res.openNew"
  >
    <template #tools>
      <input v-model="search" class="search" type="search" :placeholder="copy.search" />
    </template>
    <SettingsRow
      v-for="i in visible"
      :key="i._id"
      :title="i.name"
      :meta="meta(i)"
      :active="i.isActive"
      @edit="res.openEdit(i)"
      @toggle="res.toggleActive(i)"
    />
  </SettingsSection>

  <SheetPanel
    :open="sheetOpen"
    :title="editingId ? copy.edit : copy.ingredient.new"
    @close="sheetOpen = false"
  >
    <div class="field">
      <label for="i-name">{{ copy.ingredient.name }}</label>
      <input id="i-name" v-model="form.name" type="text" />
    </div>
    <div class="pair">
      <div class="field">
        <label for="i-unit">{{ copy.ingredient.unit }}</label>
        <AppSelect id="i-unit" v-model="form.unit" :options="units" :label="copy.ingredient.unit" />
      </div>
      <div class="field">
        <label for="i-cost">{{ copy.ingredient.cost }}</label>
        <input
          id="i-cost"
          v-model.number="form.cost"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
        />
      </div>
    </div>
    <div class="pair">
      <div class="field">
        <label for="i-min">{{ copy.ingredient.min }}</label>
        <input
          id="i-min"
          v-model.number="form.min"
          type="number"
          min="0"
          step="any"
          inputmode="decimal"
        />
      </div>
      <div class="field">
        <label for="i-max">{{ copy.ingredient.max }}</label>
        <input
          id="i-max"
          v-model.number="form.max"
          type="number"
          min="0"
          step="any"
          inputmode="decimal"
        />
      </div>
    </div>
    <div class="field">
      <label for="i-aliases">{{ copy.ingredient.aliases }}</label>
      <input id="i-aliases" v-model="form.aliases" type="text" />
      <span class="field__hint">{{ copy.ingredient.aliasesHelp }}</span>
    </div>
    <template #footer>
      <button class="btn btn--primary" :disabled="saving" @click="res.save">{{ copy.save }}</button>
    </template>
  </SheetPanel>
</template>

<style scoped lang="scss">
.search {
  flex: 1 1 200px;
  max-width: 320px;
}

.pair {
  @include flex-cards(140px, 0.7rem);
}
</style>
