<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import RefreshStamp from '@/components/ui/RefreshStamp.vue'
import DataUntilNotice from '@/components/ui/DataUntilNotice.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonChart from '@/components/ui/skeleton/SkeletonChart.vue'
import SkeletonList from '@/components/ui/skeleton/SkeletonList.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarList from '@/components/charts/BarList.vue'
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
const { kpis, daily, branches, alerts, hasAlerts, isEmpty } = ceo
const syncAgo = useTimeAgo(() => data.value?.lastSyncAt)
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName">
      <template #actions>
        <RefreshStamp :at="updatedAt" :refreshing="refreshing" />
      </template>
    </PageHeader>

    <DataUntilNotice banner />

    <template v-if="loading">
      <SkeletonKpi :count="4" />
      <div class="ceo__row">
        <SkeletonChart class="ceo__chart" :height="200" />
        <div class="ceo__side">
          <SkeletonList :rows="2" :trailing="false" />
          <SkeletonList v-if="filters.branch === 'all'" variant="bars" :rows="3" title />
        </div>
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

      <div v-else class="ceo__row">
        <section class="card ceo__chart">
          <h2 class="card__title">{{ copy.daily }}</h2>
          <LineChart
            :labels="daily.labels"
            :series="daily.series"
            :series-label="copy.daily"
            :format="formatCents"
            :axis-format="compactCents"
          />
        </section>

        <div class="ceo__side">
          <RouterLink
            to="/inventario"
            class="card ceo__alerts"
            :class="{ 'ceo__alerts--warn': hasAlerts }"
          >
            <h2 class="card__title">
              <i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i>{{ copy.alerts }}
              <InfoTip :text="site.help.inventoryAlerts" />
            </h2>
            <div v-if="hasAlerts" class="ceo__alert-nums">
              <p>
                <strong class="num ceo__out">{{ alerts.out }}</strong
                >{{ copy.alertsOut }}
              </p>
              <p>
                <strong class="num ceo__low">{{ alerts.low }}</strong
                >{{ copy.alertsLow }}
              </p>
            </div>
            <p v-else class="ceo__ok">
              <i class="fa-solid fa-circle-check" aria-hidden="true"></i>{{ copy.alertsOk }}
            </p>
            <span class="ceo__cta"
              >{{ copy.alertsCta }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i
            ></span>
          </RouterLink>

          <section v-if="filters.branch === 'all' && branches.length > 1" class="card">
            <h2 class="card__title">{{ copy.byBranch }} <InfoTip :text="site.help.byBranch" /></h2>
            <BarList :items="branches" />
          </section>
        </div>
      </div>

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
    @include flex-cards(150px, 0.75rem);

    @include from('md') {
      @include flex-cards(200px, 1rem);
    }
  }

  &__row {
    @include flex(column, stretch, flex-start, 1rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__chart {
    flex: 2 1 0;
    min-width: 0;
  }

  &__side {
    @include flex(column, stretch, flex-start, 1rem);
    flex: 1 1 0;
    min-width: 0;
  }

  &__alerts {
    display: block;
    @include transition(border-color);

    &:hover {
      border-color: $ink-muted;
    }

    &--warn {
      border-color: rgba($danger, 0.35);
      background: linear-gradient(180deg, $danger-bg, $surface 70%);
    }
  }

  &__alert-nums {
    @include flex(row, baseline, flex-start, 1.5rem);

    p {
      @include flex(column, flex-start, flex-start, 0.1rem);
      font-size: 0.8rem;
      color: $ink-soft;
    }

    strong {
      font-family: $font-display;
      font-size: 2.4rem;
      font-weight: 500;
      line-height: 1;
    }
  }

  &__out {
    color: $danger;
  }

  &__low {
    color: darken($warning, 14%);
  }

  &__ok {
    @include flex(row, center, flex-start, 0.5rem);
    font-weight: 600;
    color: darken($success, 12%);
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: $accent-deep;
  }

  &__sync {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: 0.78rem;
    color: $ink-muted;

    i {
      color: $accent;
    }
  }
}
</style>
