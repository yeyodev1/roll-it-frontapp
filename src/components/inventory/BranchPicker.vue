<script setup lang="ts">
import { computed } from 'vue'
import { useFiltersStore } from '@/stores/filters'
import { useUserStore } from '@/stores/user'
import { inventoryCopy } from '@/config/inventoryCopy'

// El personal no elige: ve el nombre de su local, sin selector.
const props = defineProps<{ allowAll?: boolean }>()
const model = defineModel<string>({ required: true })

const filters = useFiltersStore()
const userStore = useUserStore()

const branches = computed(() => filters.branches.filter((b) => b.isActive))
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
  <label v-else class="branch-picker">
    <span class="visually-hidden">{{ inventoryCopy.initial.pickBranch }}</span>
    <i class="fa-solid fa-store branch-picker__icon" aria-hidden="true"></i>
    <select v-model="model" :class="{ 'branch-picker__select--empty': !model }">
      <option :value="allowAll ? 'all' : ''" :disabled="!allowAll">{{ placeholder }}</option>
      <option v-for="b in branches" :key="b._id" :value="b._id">{{ b.name }}</option>
    </select>
  </label>
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
  position: relative;
  display: block;
  margin: 0;
  min-width: 12rem;

  &__icon {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: $accent;
    font-size: 0.85rem;
    pointer-events: none;
  }

  select {
    padding-left: 2.3rem;
    font-weight: 600;
    border-radius: $radius-pill;
  }

  &__select--empty {
    color: $ink-muted;
  }
}
</style>
