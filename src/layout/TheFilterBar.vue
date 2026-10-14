<script setup lang="ts">
import { computed } from 'vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppDateRange from '@/components/ui/AppDateRange.vue'
import DataUntilNotice from '@/components/ui/DataUntilNotice.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useFiltersStore, type RangePreset } from '@/stores/filters'
import { useLastSync } from '@/composables/useLastSync'
import { useTimeAgo } from '@/composables/useTimeAgo'

const props = defineProps<{ lastSyncAt?: string | null }>()

const filters = useFiltersStore()
const copy = dashboardCopy.filters
const { lastSyncAt: sharedSync } = useLastSync()

const syncAt = computed(() =>
  props.lastSyncAt !== undefined ? props.lastSyncAt : sharedSync.value,
)
const ago = useTimeAgo(syncAt)
// Más de 2 h sin ventas en horario normal suele ser el equipo del local apagado.
const stale = computed(
  () => !syncAt.value || Date.now() - new Date(syncAt.value).getTime() > 2 * 3600_000,
)

const branchOptions = computed(() => [
  { value: 'all', label: copy.allBranches },
  ...filters.branches.map((b) => ({ value: b._id, label: b.name })),
])

const branch = computed({
  get: () => filters.branch,
  set: (value: string | undefined) => (filters.branch = value || 'all'),
})

function pick(preset: RangePreset) {
  filters.setPreset(preset)
}
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <AppSelect
        v-model="branch"
        class="filters__branch"
        :options="branchOptions"
        :label="copy.branch"
        icon="fa-solid fa-store"
        pill
      />

      <div class="filters__chips" role="group" :aria-label="copy.range">
        <button
          v-for="r in site.ranges"
          :key="r.value"
          type="button"
          class="chip"
          :aria-pressed="filters.preset === r.value"
          @click="pick(r.value)"
        >
          {{ r.label }}
        </button>
        <AppDateRange
          chip
          :from="filters.from"
          :to="filters.to"
          :max="filters.today"
          :active="filters.preset === 'custom'"
          :label="copy.range"
          :placeholder="copy.custom"
          @apply="filters.setRange"
        />
      </div>

      <DataUntilNotice v-if="filters.isBehind" class="filters__until" />
      <p v-else class="filters__sync" :class="{ 'filters__sync--stale': stale }">
        <span class="filters__dot" aria-hidden="true"></span>
        <template v-if="syncAt">{{ copy.lastSale }} {{ ago }}</template>
        <template v-else>{{ copy.neverSynced }}</template>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filters {
  @include flex(column, stretch, flex-start, 0.65rem);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $line;
  background: $paper;

  @include from('lg') {
    padding: 0.85rem 2rem;
  }

  &__row {
    @include flex(row, center, flex-start, 0.5rem 0.75rem);
    flex-wrap: wrap;
  }

  &__branch {
    flex: 1 1 100%;

    @include from('md') {
      flex: 0 0 14rem;
    }
  }

  // En el celular los chips se deslizan de lado en vez de partir en dos filas.
  &__chips {
    @include flex(row, center, flex-start, 0.4rem);
    flex: 1 1 100%;
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: -1rem;
    padding-inline: 1rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('md') {
      flex: 0 1 auto;
      margin-inline: 0;
      padding-inline: 0;
    }
  }

  &__until {
    flex: 1 1 100%;

    @include from('md') {
      flex: 0 1 auto;
      margin-left: auto;
    }
  }

  &__sync {
    @include flex(row, center, flex-start, 0.45rem);
    font-size: 0.75rem;
    color: $ink-muted;

    @include from('md') {
      margin-left: auto;
    }

    &--stale .filters__dot {
      background: $warning;
      box-shadow: 0 0 0 3px $warning-bg;
    }
  }

  &__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: $success;
    box-shadow: 0 0 0 3px $success-bg;
  }
}
</style>
