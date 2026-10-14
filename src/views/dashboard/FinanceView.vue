<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import LoadError from '@/components/ui/LoadError.vue'
import RefreshStamp from '@/components/ui/RefreshStamp.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonChart from '@/components/ui/skeleton/SkeletonChart.vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import BarChart from '@/components/charts/BarChart.vue'
import FinanceMonthTable from '@/components/dashboard/FinanceMonthTable.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useFinanceSummary } from '@/composables/useFinanceSummary'
import { useFiltersStore } from '@/stores/filters'
import { formatCents } from '@/utils/format'
import { compactCents } from '@/utils/chartFormat'

const copy = dashboardCopy.finance
const filters = useFiltersStore()
const fin = useFinanceSummary()
const { data, loading, error, updatedAt, refreshing, month, progress, kpis, bars, rows } = fin
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName">
      <template #actions>
        <RefreshStamp :at="updatedAt" :refreshing="refreshing" />
      </template>
    </PageHeader>

    <template v-if="loading">
      <SkeletonKpi :count="4" />
      <SkeletonChart :height="260" legend />
      <SkeletonTable :rows="5" :cols="4" />
    </template>

    <LoadError v-else-if="error && !data" :message="error" @retry="fin.reload" />

    <template v-else-if="data && month">
      <section class="fin__kpis">
        <KpiCard v-for="k in kpis" :key="k.label" v-bind="k">
          <div
            v-if="k.key === 'projection'"
            class="fin__progress"
            role="progressbar"
            :aria-valuenow="month.daysElapsed"
            :aria-valuemax="month.daysInMonth"
            aria-valuemin="0"
            :aria-label="copy.daysProgress(month.daysElapsed, month.daysInMonth)"
          >
            <span class="fin__progress-label num">
              <span>{{ copy.daysProgress(month.daysElapsed, month.daysInMonth) }}</span>
              <span>{{ Math.round(progress * 100) }}%</span>
            </span>
            <span class="fin__track"
              ><span class="fin__bar" :style="{ transform: `scaleX(${progress})` }"></span
            ></span>
          </div>
        </KpiCard>
      </section>

      <ChartCard :title="copy.trend" :help="site.help.monthly">
        <BarChart
          :labels="bars.labels"
          :series="bars.series"
          :compare="bars.compare"
          :series-label="bars.current"
          :compare-label="bars.prev"
          :format="formatCents"
          :axis-format="compactCents"
          :height="280"
        />
      </ChartCard>

      <ChartCard v-if="rows.length" :title="copy.table" :help="site.help.monthTable" flush>
        <FinanceMonthTable :rows="rows" />
      </ChartCard>
    </template>
  </div>
</template>

<style scoped lang="scss">
.fin {
  &__kpis {
    @include flex-cards(150px, $sp-3);

    @include from('md') {
      @include flex-cards(220px, $sp-4);
    }
  }

  &__progress {
    @include flex(column, stretch, flex-start, 0.4rem);
  }

  &__progress-label {
    @include flex(row, center, space-between, 0.5rem);
    font-size: 0.72rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__track {
    height: 0.4rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba($chart-2, 0.6), $chart-2);
    transform-origin: left;
    transition: transform 0.8s $ease;
    animation: fin-grow 0.9s $ease both;
  }
}

@keyframes fin-grow {
  from {
    transform: scaleX(0);
  }
}
</style>
