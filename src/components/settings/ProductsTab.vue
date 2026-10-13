<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import SheetPanel from '@/components/inventory/SheetPanel.vue'
import { useSettingsResource } from '@/composables/useSettingsResource'
import { normalize } from '@/composables/useInventoryStock'
import { catalogService } from '@/services/catalog.service'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatCents } from '@/utils/format'
import type { Product } from '@/types'

interface ProductForm {
  name: string
  smartmenuCode: string
  category: string
  price: number | null
}

const copy = inventoryCopy.settings
const search = ref('')

const res = useSettingsResource<Product, ProductForm>({
  load: () => catalogService.listProducts(),
  idOf: (p) => p._id,
  empty: () => ({ name: '', smartmenuCode: '', category: '', price: null }),
  toForm: (p) => ({
    name: p.name,
    smartmenuCode: p.smartmenuCode,
    category: p.category,
    price: p.priceCents / 100,
  }),
  // El API guarda centavos; en pantalla se escribe en dólares.
  toPayload: (f) => ({
    name: f.name.trim(),
    smartmenuCode: f.smartmenuCode.trim(),
    category: f.category.trim(),
    priceCents: Math.round((Number(f.price) || 0) * 100),
  }),
  create: (p) => catalogService.createProduct(p),
  update: (id, p) => catalogService.updateProduct(id, p),
  validate: (f) => (f.name.trim() ? null : copy.product.name),
})
const { items, loading, saving, sheetOpen, editingId, form } = res

const visible = computed(() => {
  const term = normalize(search.value)
  return items.value.filter(
    (p) => !term || normalize(`${p.name} ${p.smartmenuCode}`).includes(term),
  )
})

const meta = (p: Product) =>
  [p.category, p.smartmenuCode && `#${p.smartmenuCode}`, formatCents(p.priceCents)]
    .filter(Boolean)
    .join(' · ')

onMounted(res.load)
</script>

<template>
  <SettingsSection
    :loading="loading"
    :empty="!visible.length"
    :add-label="copy.product.new"
    @add="res.openNew"
  >
    <template #tools>
      <input v-model="search" class="search" type="search" :placeholder="copy.search" />
    </template>
    <SettingsRow
      v-for="p in visible"
      :key="p._id"
      :title="p.name"
      :meta="meta(p)"
      :badge="p.hasRecipe ? undefined : copy.product.noRecipe"
      :active="p.isActive"
      @edit="res.openEdit(p)"
      @toggle="res.toggleActive(p)"
    />
  </SettingsSection>

  <SheetPanel
    :open="sheetOpen"
    :title="editingId ? copy.edit : copy.product.new"
    @close="sheetOpen = false"
  >
    <div class="field">
      <label for="p-name">{{ copy.product.name }}</label>
      <input id="p-name" v-model="form.name" type="text" />
    </div>
    <div class="field">
      <label for="p-code">{{ copy.product.code }}</label>
      <input id="p-code" v-model="form.smartmenuCode" type="text" />
    </div>
    <div class="field">
      <label for="p-cat">{{ copy.product.category }}</label>
      <input id="p-cat" v-model="form.category" type="text" />
    </div>
    <div class="field">
      <label for="p-price">{{ copy.product.price }}</label>
      <input
        id="p-price"
        v-model.number="form.price"
        type="number"
        min="0"
        step="0.01"
        inputmode="decimal"
      />
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
</style>
