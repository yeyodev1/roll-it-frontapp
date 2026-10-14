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
import HeatmapWeek from '@/components/charts/HeatmapWeek.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import TopProductsTable from '@/components/dashboard/TopProductsTable.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useOperations } from '@/composables/useOperations'
import { useFiltersStore } from '@/stores/filters'
import { formatCents } from '@/utils/format'
import { compactCents } from '@/utils/chartFormat'

const copy = dashboardCopy.operations
const filters = useFiltersStore()
const ops = useOperations()
const { data, loading, error, updatedAt, refreshing, kpis, products, categories, totalCents } = ops
const { isEmpty } = ops
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName">
      <template #actions>
        <RefreshStamp :at="updatedAt" :refreshing="refreshing" />
      </template>
    </PageHeader>

    <template v-if="loading">
      <SkeletonKpi :count="4" :delta="false" />
      <SkeletonChart :height="280" />
      <div class="ops__row">
        <SkeletonTable class="ops__main" :rows="8" :cols="4" />
        <SkeletonChart class="ops__side" variant="donut" />
      </div>
    </template>

    <LoadError v-else-if="error && !data" :message="error" @retry="ops.reload" />

    <EmptyState
      v-else-if="isEmpty"
      icon="fa-solid fa-calendar-xmark"
      :title="dashboardCopy.states.noData"
      :text="dashboardCopy.states.noDataText"
    />

    <template v-else-if="data">
      <section class="ops__kpis">
        <KpiCard v-for="k in kpis" :key="k.label" v-bind="k" />
      </section>

      <ChartCard :title="copy.heatmap" :help="site.help.heatmap">
        <HeatmapWeek :cells="data.heatmap" :format="formatCents" />
      </ChartCard>

      <div class="ops__row">
        <ChartCard class="ops__main" :title="copy.topProducts" :help="site.help.topProducts" flush>
          <TopProductsTable :rows="products" />
        </ChartCard>
        <ChartCard class="ops__side" :title="copy.byCategory" :help="site.help.byCategory">
          <DonutChart
            :items="categories"
            :center-label="copy.categoryTotal"
            :center-value="compactCents(totalCents)"
          />
        </ChartCard>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.ops {
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
  }

  &__side {
    flex: 1 1 0;
    min-width: 0;
  }
}
</style>
