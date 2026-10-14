<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import LoadError from '@/components/ui/LoadError.vue'
import RefreshStamp from '@/components/ui/RefreshStamp.vue'
import DataUntilNotice from '@/components/ui/DataUntilNotice.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonChart from '@/components/ui/skeleton/SkeletonChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from '@/composables/useDashboardData'
import { useFiltersStore } from '@/stores/filters'
import { formatCents, variation } from '@/utils/format'
import { compactCents, monthYearLabel } from '@/utils/chartFormat'

const copy = dashboardCopy.finance
const filters = useFiltersStore()
const { data, loading, error, reload, updatedAt, refreshing } = useDashboardData(
  dashboardService.finance.bind(dashboardService),
)

const month = computed(() => data.value?.currentMonth)
const progress = computed(() => {
  const m = month.value
  return m && m.daysInMonth ? Math.min(m.daysElapsed / m.daysInMonth, 1) : 0
})

const kpis = computed(() => {
  const m = month.value
  if (!m) return []
  // Mes sin ventas (datos importados hasta el mes anterior): "—" en vez de un $0,00 que asusta.
  const empty = !m.salesCents
  return [
    {
      label: copy.monthSold,
      value: empty ? '—' : formatCents(m.salesCents),
      help: empty ? copy.noMonthData : site.help.sales,
      icon: 'fa-solid fa-cash-register',
    },
    {
      label: copy.projection,
      value: empty ? '—' : formatCents(m.projectedCents),
      delta: empty ? null : m.vsLastYear,
      help: `${site.help.projection} ${site.help.vsLastYear}`,
      icon: 'fa-solid fa-chart-line',
    },
    {
      label: copy.lastYear,
      value: m.lastYearCents === null ? '—' : formatCents(m.lastYearCents),
      help: site.help.vsLastYear,
      icon: 'fa-solid fa-clock-rotate-left',
    },
  ]
})

const ytd = computed(() => {
  const y = data.value?.yearToDate
  if (!y) return null
  return {
    value: formatCents(y.salesCents),
    delta:
      y.lastYearSameRangeCents === null ? null : variation(y.salesCents, y.lastYearSameRangeCents),
    lastYear:
      y.lastYearSameRangeCents === null ? copy.noLastYear : formatCents(y.lastYearSameRangeCents),
  }
})

// Los 24 meses se parten en dos años alineados mes a mes: este año contra el anterior.
const trend = computed(() => {
  // Mes en curso sin ventas (datos importados hasta el mes anterior): no se dibuja como
  // una caída a $0, se corta la línea en el último mes con datos.
  const all = data.value?.monthly ?? []
  const monthly = all.length && !month.value?.salesCents ? all.slice(0, -1) : all
  const current = monthly.slice(-12)
  const prev = monthly.slice(0, Math.max(monthly.length - 12, 0))
  const pad = current.length - prev.length
  return {
    labels: current.map((m) => monthYearLabel(m.month)),
    series: current.map((m) => m.salesCents),
    compare: prev.length
      ? [...Array(Math.max(pad, 0)).fill(null), ...prev.map((m) => m.salesCents)]
      : [],
  }
})
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
      <SkeletonKpi class="fin__kpis" :count="3" />
      <span class="sk sk--pill fin__progress-sk" aria-hidden="true"></span>
      <div class="fin__row">
        <SkeletonChart class="fin__chart" :height="220" legend />
        <SkeletonKpi class="fin__ytd" :count="1" />
      </div>
    </template>

    <LoadError v-else-if="error && !data" :message="error" @retry="reload" />

    <template v-else-if="data && month">
      <section class="fin__kpis">
        <KpiCard v-for="k in kpis" :key="k.label" v-bind="k" />
      </section>

      <div
        class="fin__progress"
        role="progressbar"
        :aria-valuenow="month.daysElapsed"
        :aria-valuemax="month.daysInMonth"
        aria-valuemin="0"
      >
        <span class="fin__progress-label num">{{
          copy.daysProgress(month.daysElapsed, month.daysInMonth)
        }}</span>
        <span class="fin__track"
          ><span class="fin__bar" :style="{ width: `${progress * 100}%` }"></span
        ></span>
      </div>

      <div class="fin__row">
        <section class="card fin__chart">
          <h2 class="card__title">{{ copy.trend }}</h2>
          <LineChart
            :labels="trend.labels"
            :series="trend.series"
            :compare="trend.compare"
            :series-label="copy.thisYear"
            :compare-label="copy.prevYear"
            :format="formatCents"
            :axis-format="compactCents"
            :height="220"
          />
        </section>

        <div v-if="ytd" class="fin__ytd">
          <KpiCard
            :label="copy.ytd"
            :value="ytd.value"
            :delta="ytd.delta"
            icon="fa-solid fa-calendar-check"
          />
          <p class="fin__ytd-last">
            <span>{{ copy.ytdLastYear }}</span>
            <strong class="num">{{ ytd.lastYear }}</strong>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.fin {
  &__kpis {
    @include flex-cards(150px, 0.75rem);

    > :first-child {
      flex-basis: 100%;

      @include from('md') {
        flex-basis: 200px;
      }
    }
  }

  &__progress-sk {
    height: 1.2rem;
  }

  &__progress {
    @include flex(row, center, flex-start, 0.75rem);
  }

  &__progress-label {
    flex-shrink: 0;
    font-size: 0.78rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__track {
    flex: 1;
    height: 0.45rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: $ink;
  }

  &__row {
    @include flex(column, stretch, flex-start, 1rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__chart {
    flex: 3 1 0;
    min-width: 0;
  }

  &__ytd {
    @include flex(column, stretch, flex-start, 0.6rem);
    flex: 1 1 0;
    min-width: 0;
  }

  &__ytd-last {
    @include flex(row, baseline, space-between, 0.5rem);
    flex-wrap: wrap;
    padding: 0 0.25rem;
    font-size: 0.8rem;
    color: $ink-muted;

    strong {
      color: $ink-soft;
      font-weight: 600;
    }
  }
}
</style>
