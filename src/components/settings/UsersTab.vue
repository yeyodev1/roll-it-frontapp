<script setup lang="ts">
import { computed, onMounted } from 'vue'
import SettingsSection from './SettingsSection.vue'
import SettingsRow from './SettingsRow.vue'
import SheetPanel from '@/components/inventory/SheetPanel.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useSettingsResource } from '@/composables/useSettingsResource'
import { userService } from '@/services/user.service'
import { useFiltersStore } from '@/stores/filters'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { StaffUser } from '@/types'

interface UserForm {
  name: string
  email: string
  password: string
  accountType: 'admin' | 'staff'
  branch: string
}

const copy = inventoryCopy.settings
const filters = useFiltersStore()

const res = useSettingsResource<StaffUser, UserForm>({
  load: () => userService.list(),
  idOf: (u) => u.id,
  empty: () => ({ name: '', email: '', password: '', accountType: 'staff', branch: '' }),
  toForm: (u) => ({
    name: u.name,
    email: u.email,
    password: '',
    accountType: u.accountType === 'admin' ? 'admin' : 'staff',
    branch: u.branch || '',
  }),
  toPayload: (f, id) => {
    const branch = f.accountType === 'staff' ? f.branch : null
    // Al editar, la contraseña solo viaja si se escribió una nueva.
    if (id) return { name: f.name.trim(), branch, ...(f.password ? { password: f.password } : {}) }
    return { ...f, name: f.name.trim(), email: f.email.trim(), branch }
  },
  create: (p) => userService.create(p),
  update: (id, p) => userService.update(id, p),
  validate: (f, id) => {
    if (!f.name.trim()) return copy.user.name
    if (!id && (!f.email.trim() || !f.password)) return `${copy.user.email} · ${copy.user.password}`
    if (f.accountType === 'staff' && !f.branch) return copy.user.branchRequired
    return null
  },
})
const { items, loading, error, saving, sheetOpen, editingId, form } = res

const roles = copy.user.roles.map((r) => ({ value: r.value, label: r.label }))
const branchOptions = computed(() => filters.branches.map((b) => ({ value: b._id, label: b.name })))

const roleLabel = (type: string) => copy.user.roles.find((r) => r.value === type)?.label || type
const branchName = (id: string | null) => filters.branches.find((b) => b._id === id)?.name || ''
const meta = (u: StaffUser) =>
  [u.email, roleLabel(u.accountType), branchName(u.branch)].filter(Boolean).join(' · ')

onMounted(res.load)
</script>

<template>
  <SettingsSection
    :loading="loading"
    :error="error"
    @retry="res.load"
    :empty="!items.length"
    :add-label="copy.user.new"
    @add="res.openNew"
  >
    <SettingsRow
      v-for="u in items"
      :key="u.id"
      :title="u.name || u.email"
      :meta="meta(u)"
      :active="u.isActive"
      @edit="res.openEdit(u)"
      @toggle="res.toggleActive(u)"
    />
  </SettingsSection>

  <SheetPanel
    :open="sheetOpen"
    :title="editingId ? copy.edit : copy.user.new"
    @close="sheetOpen = false"
  >
    <div class="field">
      <label for="u-name">{{ copy.user.name }}</label>
      <input id="u-name" v-model="form.name" type="text" autocomplete="off" />
    </div>
    <div class="field">
      <label for="u-email">{{ copy.user.email }}</label>
      <input
        id="u-email"
        v-model="form.email"
        type="email"
        autocomplete="off"
        :disabled="Boolean(editingId)"
      />
    </div>
    <div class="field">
      <label for="u-pass">{{ editingId ? copy.user.newPassword : copy.user.password }}</label>
      <input id="u-pass" v-model="form.password" type="password" autocomplete="new-password" />
    </div>
    <div class="field">
      <label for="u-role">{{ copy.user.role }}</label>
      <AppSelect
        id="u-role"
        v-model="form.accountType"
        :options="roles"
        :label="copy.user.role"
        :disabled="Boolean(editingId)"
      />
    </div>
    <div v-if="form.accountType === 'staff'" class="field">
      <label for="u-branch">{{ copy.user.branch }}</label>
      <AppSelect
        id="u-branch"
        v-model="form.branch"
        :options="branchOptions"
        :label="copy.user.branch"
        :placeholder="inventoryCopy.initial.pickBranch"
        icon="fa-solid fa-store"
      />
    </div>
    <template #footer>
      <button class="btn btn--primary" :disabled="saving" @click="res.save">{{ copy.save }}</button>
    </template>
  </SheetPanel>
</template>
