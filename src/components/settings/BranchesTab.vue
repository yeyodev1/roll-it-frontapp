<script setup lang="ts">
import { onMounted, watch } from 'vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import SheetPanel from '@/components/inventory/SheetPanel.vue'
import { useSettingsResource } from '@/composables/useSettingsResource'
import { branchService } from '@/services/branch.service'
import { useFiltersStore } from '@/stores/filters'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatDate } from '@/utils/format'
import type { Branch } from '@/types'

const copy = inventoryCopy.settings
const filters = useFiltersStore()

const res = useSettingsResource<Branch, { name: string; smartmenuUrl: string }>({
  load: () => branchService.list(),
  idOf: (b) => b._id,
  empty: () => ({ name: '', smartmenuUrl: '' }),
  toForm: (b) => ({ name: b.name, smartmenuUrl: b.smartmenuUrl }),
  create: (p) => branchService.create(p),
  update: (id, p) => branchService.update(id, p),
  validate: (f) => (f.name.trim() ? null : copy.branch.name),
})
const { items, loading, saving, sheetOpen, editingId, form } = res

// El selector de sucursal del panel lee del store: se mantiene al día.
watch(items, (list) => filters.setBranches([...list]), { deep: true })

const meta = (b: Branch) =>
  `${copy.branch.lastSync}: ${b.lastSyncAt ? formatDate(b.lastSyncAt) : copy.branch.never}`

onMounted(res.load)
</script>

<template>
  <SettingsSection
    :loading="loading"
    :empty="!items.length"
    :add-label="copy.branch.new"
    @add="res.openNew"
  >
    <SettingsRow
      v-for="b in items"
      :key="b._id"
      :title="b.name"
      :meta="meta(b)"
      :active="b.isActive"
      @edit="res.openEdit(b)"
      @toggle="res.toggleActive(b)"
    />
  </SettingsSection>

  <SheetPanel
    :open="sheetOpen"
    :title="editingId ? copy.edit : copy.branch.new"
    @close="sheetOpen = false"
  >
    <div class="field">
      <label for="b-name">{{ copy.branch.name }}</label>
      <input id="b-name" v-model="form.name" type="text" />
    </div>
    <div class="field">
      <label for="b-url">{{ copy.branch.url }}</label>
      <input
        id="b-url"
        v-model="form.smartmenuUrl"
        type="url"
        inputmode="url"
        placeholder="https://"
      />
    </div>
    <template #footer>
      <button class="btn btn--primary" :disabled="saving" @click="res.save">{{ copy.save }}</button>
    </template>
  </SheetPanel>
</template>
