<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import RefreshStamp from '@/components/ui/RefreshStamp.vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonChart from '@/components/ui/skeleton/SkeletonChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import StockCounters from '@/components/inventory/StockCounters.vue'
import StockAsk from '@/components/inventory/StockAsk.vue'
import StockList from '@/components/inventory/StockList.vue'
import StockRunout from '@/components/inventory/StockRunout.vue'
import AdjustSheet from '@/components/inventory/AdjustSheet.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInventoryStock } from '@/composables/useInventoryStock'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import type { StockRow, StockStatus } from '@/types'

const copy = inventoryCopy.stock
const { branch, branchName, isStaff, ensureBranches } = useInventoryBranch()
const stock = useInventoryStock()
const { rows, counts, loading, error, status, search, filtered, updatedAt, refreshing } = stock
const { load, replaceRow, toggleStatus } = stock

const adjusting = ref<StockRow | null>(null)
const showBranch = computed(() => branch.value === 'all')

const STATUS_COLOR: Record<StockStatus, string> = {
  out: 'var(--danger)',
  low: 'var(--warning)',
  ok: 'var(--success)',
  over: 'var(--info)',
}
const donut = computed(() =>
  (['out', 'low', 'ok', 'over'] as const).map((k) => ({
    label: site.stockStatus[k].label,
    value: counts.value[k],
    display: copy.items(counts.value[k]),
    color: STATUS_COLOR[k],
  })),
)
const total = computed(() => Object.values(counts.value).reduce((a, n) => a + n, 0))

watch(branch, (value) => load(value))
onMounted(async () => {
  await ensureBranches()
  load(branch.value)
})
</script>

<template>
  <div class="page">
    <PageHeader
      :title="copy.title"
      :subtitle="isStaff ? branchName : undefined"
      :help="site.help.stockStatus"
    >
      <template #actions>
        <RefreshStamp :at="updatedAt" :refreshing="refreshing" />
        <BranchPicker v-if="!isStaff" v-model="branch" allow-all />
      </template>
    </PageHeader>

    <nav class="quick">
      <RouterLink class="btn btn--primary quick__main" :to="{ name: 'Invoices' }">
        <i class="fa-solid fa-camera" aria-hidden="true"></i> {{ copy.actions.invoice }}
      </RouterLink>
      <RouterLink class="btn btn--ghost" :to="{ name: 'InitialInventory' }">
        <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i> {{ copy.actions.initial }}
      </RouterLink>
      <RouterLink class="btn btn--ghost" :to="{ name: 'Movements' }">
        <i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
        {{ copy.actions.movements }}
      </RouterLink>
    </nav>

    <StockAsk :branch="branch" />

    <SkeletonKpi v-if="loading" :count="4" :delta="false" />
    <StockCounters v-else :counts="counts" :active="status" @toggle="toggleStatus" />

    <div class="inv__row">
      <ChartCard class="inv__main" :title="copy.list" flush>
        <template #action>
          <label class="search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <span class="visually-hidden">{{ copy.search }}</span>
            <input v-model="search" type="search" :placeholder="copy.search" />
          </label>
        </template>
        <SkeletonTable v-if="loading" :rows="8" :cols="5" />
        <LoadError v-else-if="error && !rows.length" :message="error" @retry="load(branch)" />
        <div v-else-if="!filtered.length" class="inv__empty">
          <EmptyState
            icon="fa-solid fa-box-open"
            :title="copy.empty"
            :text="rows.length ? undefined : copy.emptyText"
          />
        </div>
        <StockList v-else :rows="filtered" :show-branch="showBranch" @adjust="adjusting = $event" />
      </ChartCard>

      <aside class="inv__side">
        <SkeletonChart v-if="loading" class="inv__donut" variant="donut" />
        <ChartCard
          v-else-if="total"
          class="inv__donut"
          :title="copy.byStatus"
          :help="site.help.stockStatus"
        >
          <DonutChart :items="donut" :center-label="copy.total" :center-value="String(total)" />
        </ChartCard>
        <StockRunout
          v-if="!loading"
          :rows="rows"
          :show-branch="showBranch"
          @adjust="adjusting = $event"
        />
      </aside>
    </div>

    <AdjustSheet :row="adjusting" @close="adjusting = null" @saved="replaceRow" />
  </div>
</template>

<style scoped lang="scss">
.quick {
  @include flex(row, center, flex-start, 0.5rem);
  flex-wrap: wrap;

  .btn {
    flex: 1 1 auto;
    padding-inline: 0.9rem;

    @include from('md') {
      flex: 0 0 auto;
    }
  }

  &__main {
    flex-basis: 100%;

    @include from('md') {
      flex-basis: auto;
    }
  }
}

.inv {
  &__row {
    @include flex(column, stretch, flex-start, $sp-3);

    @include from('md') {
      gap: $sp-4;
    }

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__main {
    flex: 2.2 1 0;
    min-width: 0;

    :deep(.ccard__action) {
      flex: 1 1 11rem;
      justify-content: flex-end;
    }
  }

  // En el celular "Se acaban primero" va antes de la lista larga; el donut repite los contadores.
  &__side {
    @include flex(column, stretch, flex-start, $sp-3);
    flex: 1 1 0;
    min-width: 0;
    order: -1;

    @include from('md') {
      gap: $sp-4;
    }

    @include from('lg') {
      order: 0;
      position: sticky;
      top: 5rem;
    }
  }

  &__donut {
    @include until('lg') {
      display: none;
    }
  }

  &__empty {
    padding: 0 $sp-4 $sp-4;

    @include from('md') {
      padding: 0 $sp-6 $sp-6;
    }
  }
}

.search {
  position: relative;
  margin: 0;
  width: min(16rem, 100%);

  i {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    font-size: 0.8rem;
  }

  input {
    padding: 0.5rem 0.9rem 0.5rem 2.2rem;
    border-radius: $radius-pill;
    background: $canvas;
    border-color: transparent;
    font-size: 0.84rem;
  }
}
</style>
