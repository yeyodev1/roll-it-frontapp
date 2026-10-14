<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppDateRange from '@/components/ui/AppDateRange.vue'
import DataUntilNotice from '@/components/ui/DataUntilNotice.vue'
import SalesUploadAction from '@/components/sync/SalesUploadAction.vue'
import SalesUploadModal from '@/components/sync/SalesUploadModal.vue'
import AgentStatusPill from '@/components/sync/AgentStatusPill.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useFiltersStore, type RangePreset } from '@/stores/filters'
import { useLastSync } from '@/composables/useLastSync'
import { useTimeAgo } from '@/composables/useTimeAgo'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/format'

const props = defineProps<{ lastSyncAt?: string | null }>()

const filters = useFiltersStore()
const user = useUserStore()
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

// Finanzas compara mes contra mes: el rango de fechas no le aplica y se oculta.
const route = useRoute()
const showRange = computed(() => !route.path.startsWith('/finanzas'))

// Con los datos atrasados "Hoy" sería un día sin ventas: se muestra el último día con datos.
const rangeLabel = (value: RangePreset, label: string) =>
  value === 'today' && filters.isBehind ? copy.lastDay : label

// Un día 'YYYY-MM-DD' a mediodía de Ecuador: a medianoche UTC se pintaría el día anterior.
const dayLabel = (key: string) => formatDate(`${key}T12:00:00-05:00`)
const rangeText = computed(() =>
  filters.from === filters.to
    ? dayLabel(filters.from)
    : `${dayLabel(filters.from)} – ${dayLabel(filters.to)}`,
)
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

      <div v-if="showRange" class="filters__seg" role="group" :aria-label="copy.range">
        <button
          v-for="r in site.ranges"
          :key="r.value"
          type="button"
          class="chip"
          :aria-pressed="filters.preset === r.value"
          @click="pick(r.value)"
        >
          {{ rangeLabel(r.value, r.label) }}
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
      <p v-if="showRange" class="filters__range">
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        {{ rangeText }}
      </p>
      <p v-else class="filters__range">
        <i class="fa-solid fa-chart-column" aria-hidden="true"></i>
        {{ copy.financeMonthly }}
      </p>

      <!-- Datos atrasados: el dueño sube el reporte de SmartMenu desde la misma pastilla. -->
      <DataUntilNotice v-if="filters.isBehind" class="filters__until">
        <SalesUploadAction v-if="user.isAdmin" />
      </DataUntilNotice>
      <p v-else class="filters__sync" :class="{ 'filters__sync--stale': stale }">
        <span class="filters__dot" aria-hidden="true"></span>
        <template v-if="syncAt">{{ copy.lastSale }} {{ ago }}</template>
        <template v-else>{{ copy.neverSynced }}</template>
        <SalesUploadAction v-if="stale && user.isAdmin" />
      </p>
      <!-- /sync/status es solo admin: el personal no ve el estado del agente. -->
      <AgentStatusPill v-if="user.isAdmin" />
    </div>
    <SalesUploadModal v-if="user.isAdmin" />
  </div>
</template>

<style scoped lang="scss">
.filters__range {
  display: inline-flex;
  align-items: center;
  gap: $sp-2;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: $ink;
  @include tabular;

  i {
    color: $accent;
  }
}

.filters {
  padding: $sp-3 $sp-4 0;

  @include from('lg') {
    padding: $sp-5 $sp-8 0;
  }

  &__row {
    @include flex(row, center, flex-start, $sp-2 $sp-3);
    flex-wrap: wrap;
    max-width: calc(1280px - 4rem);
  }

  &__branch {
    flex: 1 1 100%;

    @include from('md') {
      flex: 0 0 13.5rem;
    }
  }

  // Control segmentado: los rangos van juntos en una sola pastilla blanca.
  // En el celular se desliza de lado en vez de partir en dos filas.
  &__seg {
    @include flex(row, center, space-between, 0.1rem);
    flex: 1 1 100%;
    max-width: 100%;
    padding: 0.25rem;
    border: 1px solid rgba($line, 0.6);
    border-radius: $radius-pill;
    background: $surface;
    box-shadow: $shadow-card;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('md') {
      flex: 0 1 auto;
    }

    .chip,
    :deep(.chip) {
      min-height: 2.15rem;
      border-color: transparent;
      background: transparent;
      flex: 1 0 auto;
      justify-content: center;
      padding-inline: 0.6rem;
      font-weight: 600;
      font-size: 0.78rem;

      @include from('md') {
        padding-inline: 0.9rem;
      }

      &:hover {
        background: $canvas;
      }

      &[aria-pressed='true'] {
        background: $ink;
        color: $surface;
        box-shadow: 0 2px 6px rgba($ink, 0.18);
      }
    }
  }

  &__until,
  &__sync {
    @include from('md') {
      margin-left: auto;
    }
  }

  // En el celular el aviso ocupa la fila: el botón de actualizar queda a la derecha.
  &__until {
    @include until('md') {
      flex: 1 1 100%;
    }
  }

  &__sync {
    @include flex(row, center, flex-start, 0.45rem);
    min-height: 2rem;
    padding: 0 0.8rem;
    border-radius: $radius-pill;
    background: rgba($success, 0.09);
    font-size: 0.74rem;
    font-weight: 500;
    color: darken($success, 16%);

    &--stale {
      padding-right: 0.2rem;
      background: $warning-bg;
      color: darken($warning, 22%);

      .filters__dot {
        background: $warning;
        box-shadow: 0 0 0 3px rgba($warning, 0.2);
      }
    }
  }

  &__dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: $success;
    box-shadow: 0 0 0 3px rgba($success, 0.2);
  }
}
</style>
