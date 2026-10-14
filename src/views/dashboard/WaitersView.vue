<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import RefreshStamp from '@/components/ui/RefreshStamp.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonChart from '@/components/ui/skeleton/SkeletonChart.vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import WaiterTable from '@/components/dashboard/WaiterTable.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useWaiters } from '@/composables/useWaiters'
import { useFiltersStore } from '@/stores/filters'

const copy = dashboardCopy.waiters
const filters = useFiltersStore()
const wt = useWaiters()
const { data, loading, error, updatedAt, refreshing, view, tabs, team, rows, kpis, levels } = wt
const { ranked } = wt
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName" :help="site.help.waiterScore">
      <template #actions>
        <RefreshStamp :at="updatedAt" :refreshing="refreshing" />
      </template>
    </PageHeader>

    <template v-if="loading">
      <SkeletonKpi :count="4" :delta="false" />
      <div class="wt__row">
        <SkeletonTable class="wt__main" :rows="8" :cols="5" />
        <SkeletonChart class="wt__side" variant="donut" />
      </div>
    </template>

    <LoadError v-else-if="error && !data" :message="error" @retry="wt.reload" />

    <!-- El reporte de ventas no trae mesero: sin ese dato no hay ranking, no ceros. -->
    <section v-else-if="data && !ranked.length" class="wt__empty">
      <EmptyState icon="fa-solid fa-user-clock" :title="copy.noFeed" :text="copy.noFeedText" />
    </section>

    <template v-else-if="data && team">
      <section class="wt__kpis">
        <KpiCard v-for="k in kpis" :key="k.label" v-bind="k" />
      </section>

      <div class="wt__row">
        <ChartCard class="wt__main" :title="copy.ranking" :help="site.help.waiterScore" flush>
          <template #action>
            <div class="wt__tabs" role="group">
              <button
                v-for="t in tabs"
                :key="t.value"
                type="button"
                class="wt__tab"
                :aria-pressed="view === t.value"
                :disabled="!t.count"
                @click="view = t.value"
              >
                {{ t.label }} <span class="num">{{ t.count }}</span>
              </button>
            </div>
          </template>
          <WaiterTable :rows="rows" />
        </ChartCard>

        <ChartCard class="wt__side" :title="copy.byLevel" :help="site.help.waiterScore">
          <DonutChart
            :items="levels"
            :center-label="copy.evaluated"
            :center-value="String(ranked.length)"
          />
        </ChartCard>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.wt {
  &__kpis {
    @include flex-cards(150px, $sp-3);

    @include from('md') {
      @include flex-cards(220px, $sp-4);
    }
  }

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
    flex: 2 1 0;
    min-width: 0;

    // En el celular los filtros bajan a su propia fila y se deslizan sin empujar la página.
    :deep(.ccard__action) {
      min-width: 0;
      max-width: 100%;
    }
  }

  &__side {
    flex: 1 1 0;
    min-width: 0;
  }

  &__empty {
    @include card;
    padding: $sp-4;

    :deep(.empty) {
      border: none;
      background: transparent;
      padding-block: $sp-8 * 1.5;
    }

    :deep(.empty__icon) {
      width: 4rem;
      height: 4rem;
      font-size: 1.5rem;
      background: $accent-soft;
    }

    :deep(.empty__title) {
      font-size: 1.05rem;
    }

    :deep(.empty__text) {
      max-width: 60ch;
    }
  }

  // Control segmentado chico, como el de rangos de la barra de filtros.
  &__tabs {
    @include flex(row, center, flex-start, 0.1rem);
    max-width: 100%;
    padding: 0.2rem;
    border-radius: $radius-pill;
    background: $canvas;
    overflow-x: auto;
    scrollbar-width: none;
  }

  &__tab {
    flex: 0 0 auto;
    padding: 0.3rem 0.7rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 600;
    color: $ink-soft;
    white-space: nowrap;
    @include transition(background-color);

    span {
      margin-left: 0.15rem;
      opacity: 0.6;
    }

    &[aria-pressed='true'] {
      background: $surface;
      color: $ink;
      box-shadow: $shadow-sm;
    }

    &:disabled {
      opacity: 0.4;
      pointer-events: none;
    }
  }
}
</style>
