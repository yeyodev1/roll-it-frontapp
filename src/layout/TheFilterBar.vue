<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

const showCustom = ref(filters.preset === 'custom')
const from = ref(filters.from)
const to = ref(filters.to)
const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

watch(
  () => [filters.from, filters.to],
  ([f, t]) => {
    from.value = f ?? from.value
    to.value = t ?? to.value
  },
)

function pick(preset: RangePreset) {
  showCustom.value = false
  filters.setPreset(preset)
}

function applyCustom() {
  if (!from.value || !to.value) return
  const [a, b] = from.value <= to.value ? [from.value, to.value] : [to.value, from.value]
  filters.setRange(a, b)
}
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <label class="filters__branch">
        <span class="visually-hidden">{{ copy.branch }}</span>
        <i class="fa-solid fa-store" aria-hidden="true"></i>
        <select v-model="filters.branch">
          <option value="all">{{ copy.allBranches }}</option>
          <option v-for="b in filters.branches" :key="b._id" :value="b._id">{{ b.name }}</option>
        </select>
      </label>

      <div class="filters__chips" role="group" :aria-label="copy.range">
        <button
          v-for="r in site.ranges"
          :key="r.value"
          type="button"
          class="chip"
          :aria-pressed="filters.preset === r.value && !showCustom"
          @click="pick(r.value)"
        >
          {{ r.label }}
        </button>
        <button
          type="button"
          class="chip"
          :aria-pressed="showCustom || filters.preset === 'custom'"
          :aria-expanded="showCustom"
          @click="showCustom = !showCustom"
        >
          <i class="fa-regular fa-calendar" aria-hidden="true"></i>{{ copy.custom }}
        </button>
      </div>

      <p class="filters__sync" :class="{ 'filters__sync--stale': stale }">
        <span class="filters__dot" aria-hidden="true"></span>
        <template v-if="syncAt">{{ copy.updated }} {{ ago }}</template>
        <template v-else>{{ copy.neverSynced }}</template>
      </p>
    </div>

    <form v-if="showCustom" class="filters__custom" @submit.prevent="applyCustom">
      <label class="field">
        <span class="field__hint">{{ copy.from }}</span>
        <input v-model="from" type="date" :max="today" required />
      </label>
      <label class="field">
        <span class="field__hint">{{ copy.to }}</span>
        <input v-model="to" type="date" :min="from" :max="today" required />
      </label>
      <button type="submit" class="btn btn--dark btn--sm">{{ copy.apply }}</button>
    </form>
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
    position: relative;
    margin: 0;
    flex: 1 1 100%;

    @include from('md') {
      flex: 0 0 14rem;
    }

    i {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: $accent;
      font-size: 0.85rem;
      pointer-events: none;
    }

    select {
      min-height: 2.5rem;
      padding-block: 0.5rem;
      padding-left: 2.3rem;
      font-weight: 600;
      border-radius: $radius-pill;
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

  &__custom {
    @include flex(row, flex-end, flex-start, 0.6rem);
    flex-wrap: wrap;

    .field {
      flex: 1 1 8.5rem;

      @include from('md') {
        flex: 0 0 11rem;
      }
    }

    input {
      min-height: 2.5rem;
      padding-block: 0.45rem;
    }

    .btn {
      min-height: 2.5rem;
    }
  }
}
</style>
