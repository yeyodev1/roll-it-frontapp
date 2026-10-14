<script setup lang="ts">
import { computed } from 'vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useFiltersStore } from '@/stores/filters'
import { useUserStore } from '@/stores/user'
import { inventoryCopy } from '@/config/inventoryCopy'

// El personal no elige: ve el nombre de su local, sin selector.
const props = defineProps<{ allowAll?: boolean }>()
const model = defineModel<string>({ required: true })

const filters = useFiltersStore()
const userStore = useUserStore()

const options = computed(() => [
  ...(props.allowAll ? [{ value: 'all', label: inventoryCopy.stock.allBranches }] : []),
  ...filters.branches.filter((b) => b.isActive).map((b) => ({ value: b._id, label: b.name })),
])
const ownName = computed(
  () => filters.branches.find((b) => b._id === userStore.user?.branch)?.name || '',
)
const placeholder = computed(() =>
  props.allowAll ? inventoryCopy.stock.allBranches : inventoryCopy.initial.pickBranch,
)
</script>

<template>
  <span v-if="userStore.isStaff" class="branch-fixed">
    <i class="fa-solid fa-store" aria-hidden="true"></i>
    {{ ownName }}
  </span>
  <AppSelect
    v-else
    v-model="model"
    class="branch-picker"
    :options="options"
    :placeholder="placeholder"
    :label="inventoryCopy.initial.pickBranch"
    icon="fa-solid fa-store"
    pill
  />
</template>

<style scoped lang="scss">
.branch-fixed {
  @include flex(row, center, flex-start, 0.45rem);
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
  padding: 0.5rem 0.9rem;
  border-radius: $radius-pill;
  background: $sand;

  i {
    color: $accent;
  }
}

.branch-picker {
  min-width: 12rem;
}
</style>
