<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import SheetPanel from '@/components/inventory/SheetPanel.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import { useSettingsResource } from '@/composables/useSettingsResource'
import { catalogService } from '@/services/catalog.service'
import { useFiltersStore } from '@/stores/filters'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { Waiter } from '@/types'

const copy = inventoryCopy.settings
const filters = useFiltersStore()
const branch = ref(filters.branch)

const res = useSettingsResource<Waiter, { name: string }>({
  load: () => catalogService.listWaiters(branch.value),
  idOf: (w) => w._id,
  empty: () => ({ name: '' }),
  toForm: (w) => ({ name: w.name }),
  update: (id, p) => catalogService.updateWaiter(id, p),
  validate: (f) => (f.name.trim() ? null : copy.waiter.name),
})
const { items, loading, error, saving, sheetOpen, form } = res

const branchName = (id: string) => filters.branches.find((b) => b._id === id)?.name || ''

watch(branch, res.load)
onMounted(res.load)
</script>

<template>
  <SettingsSection
    :loading="loading"
    :error="error"
    @retry="res.load"
    :empty="!items.length"
    :help="copy.waiter.help"
  >
    <template #tools>
      <BranchPicker v-model="branch" allow-all />
    </template>
    <SettingsRow
      v-for="w in items"
      :key="w._id"
      :title="w.name"
      :meta="branch === 'all' ? branchName(w.branch) : undefined"
      :active="w.isActive"
      @edit="res.openEdit(w)"
      @toggle="res.toggleActive(w)"
    />
  </SettingsSection>

  <SheetPanel :open="sheetOpen" :title="copy.edit" @close="sheetOpen = false">
    <div class="field">
      <label for="w-name">{{ copy.waiter.name }}</label>
      <input id="w-name" v-model="form.name" type="text" />
    </div>
    <template #footer>
      <button class="btn btn--primary" :disabled="saving" @click="res.save">{{ copy.save }}</button>
    </template>
  </SheetPanel>
</template>
