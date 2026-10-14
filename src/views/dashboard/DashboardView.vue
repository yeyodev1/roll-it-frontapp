<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import DeltaBadge from '@/components/ui/DeltaBadge.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import RefreshStamp from '@/components/ui/RefreshStamp.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonChart from '@/components/ui/skeleton/SkeletonChart.vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import AreaChart from '@/components/charts/AreaChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import BranchRanking from '@/components/dashboard/BranchRanking.vue'
import InventoryAlertsCard from '@/components/dashboard/InventoryAlertsCard.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useCeoSummary } from '@/composables/useCeoSummary'
import { useTimeAgo } from '@/composables/useTimeAgo'
import { useFiltersStore } from '@/stores/filters'
import { formatCents } from '@/utils/format'
import { compactCents } from '@/utils/chartFormat'

const copy = dashboardCopy.ceo
const filters = useFiltersStore()
const ceo = useCeoSummary()
const { data, loading, error, updatedAt, refreshing } = ceo
const { kpis, daily, periodDelta, branches, multiBranch, alerts, isEmpty } = ceo
const syncAgo = useTimeAgo(() => data.value?.lastSyncAt)
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName">
      <template #actions>
        <RefreshStamp :at="updatedAt" :refreshing="refreshing" />
      </template>
    </PageHeader>

    <template v-if="loading">
      <SkeletonKpi :count="4" spark />
      <div class="ceo__row">
        <SkeletonChart class="ceo__main" variant="area" :height="240" />
        <SkeletonChart class="ceo__side" variant="donut" />
      </div>
      <div v-if="filters.branch === 'all'" class="ceo__row">
        <SkeletonTable class="ceo__main" :rows="3" :cols="4" />
        <SkeletonChart class="ceo__side" variant="donut" :title="true" />
      </div>
    </template>

    <LoadError v-else-if="error && !data" :message="error" @retry="ceo.reload" />

    <template v-else-if="data">
      <section class="ceo__kpis">
        <KpiCard v-for="k in kpis" :key="k.label" v-bind="k" />
      </section>

      <EmptyState
        v-if="isEmpty"
        icon="fa-solid fa-calendar-xmark"
        :title="dashboardCopy.states.noData"
        :text="dashboardCopy.states.noDataText"
      />

      <template v-else>
        <div class="ceo__row">
          <ChartCard class="ceo__main" :title="copy.daily" :help="site.help.daily">
            <template #action>
              <span class="ceo__total">
                <small>{{ copy.dailyTotal }}</small>
                <strong class="num">{{ formatCents(data.salesCents) }}</strong>
              </span>
              <DeltaBadge :value="periodDelta" />
            </template>
            <AreaChart
              :labels="daily.labels"
              :series="daily.series"
              :series-label="copy.sales"
              :format="formatCents"
              :axis-format="compactCents"
              :height="270"
            />
          </ChartCard>

          <ChartCard
            v-if="multiBranch"
            class="ceo__side"
            :title="copy.share"
            :help="site.help.byBranch"
          >
            <DonutChart
              :items="branches"
              :center-label="copy.shareTotal"
              :center-value="compactCents(data.salesCents)"
            />
          </ChartCard>
          <InventoryAlertsCard v-else class="ceo__side" v-bind="alerts" />
        </div>

        <div v-if="multiBranch" class="ceo__row">
          <ChartCard class="ceo__main" :title="copy.ranking" :help="site.help.ranking" flush>
            <BranchRanking :rows="branches" />
          </ChartCard>
          <InventoryAlertsCard class="ceo__side" v-bind="alerts" />
        </div>
      </template>

      <p class="ceo__sync">
        <i class="fa-solid fa-tower-broadcast" aria-hidden="true"></i>
        <span
          >{{ copy.lastSync }}:
          {{ data.lastSyncAt ? syncAgo : dashboardCopy.filters.neverSynced }}</span
        >
        <InfoTip :text="site.help.sync" />
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.ceo {
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

  &__total {
    @include flex(column, flex-end, flex-start);
    line-height: 1.2;

    small {
      font-size: 0.68rem;
      color: $ink-muted;
    }

    strong {
      font-size: 0.95rem;
      font-weight: 700;
      color: $ink;
    }
  }

  &__sync {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: 0.75rem;
    color: $ink-muted;

    i {
      color: $accent;
    }
  }
}
</style>
