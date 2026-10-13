<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BarList from '@/components/charts/BarList.vue'
import HeatmapWeek from '@/components/charts/HeatmapWeek.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from '@/composables/useDashboardData'
import { useFiltersStore } from '@/stores/filters'
import { formatCents, formatPercent } from '@/utils/format'

const copy = dashboardCopy.operations
const filters = useFiltersStore()
const { data, loading, error, reload } = useDashboardData(
  dashboardService.operations.bind(dashboardService),
)

const slots = computed(() => {
  const d = data.value
  if (!d) return []
  const list = []
  if (d.bestSlot) {
    list.push({
      key: 'best',
      label: copy.best,
      text: copy.bestSentence(d.bestSlot.weekday, d.bestSlot.hour),
      money: formatCents(d.bestSlot.salesCents),
      icon: 'fa-solid fa-fire',
      help: '',
    })
  }
  if (d.worstOpenSlot) {
    list.push({
      key: 'worst',
      label: copy.worst,
      text: copy.worstSentence(d.worstOpenSlot.weekday, d.worstOpenSlot.hour),
      money: formatCents(d.worstOpenSlot.salesCents),
      icon: 'fa-solid fa-snowflake',
      help: site.help.worstSlot,
    })
  }
  return list
})

const products = computed(() =>
  (data.value?.topProducts ?? []).map((p) => ({
    label: p.name,
    value: p.salesCents,
    display: formatCents(p.salesCents),
    sub: `${copy.units(p.quantity)} · ${formatPercent(p.share)}`,
  })),
)

const categories = computed(() =>
  (data.value?.byCategory ?? []).map((c) => ({
    label: c.category || '—',
    value: c.salesCents,
    display: formatCents(c.salesCents),
    sub: formatPercent(c.share),
  })),
)

const isEmpty = computed(
  () => data.value && !data.value.heatmap.length && !data.value.topProducts.length,
)
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName" />

    <LoadingBlock v-if="loading && !data" height="22rem" />

    <EmptyState
      v-else-if="error && !data"
      icon="fa-solid fa-plug-circle-exclamation"
      :title="dashboardCopy.states.loadError"
      :text="error"
    >
      <button class="btn btn--dark btn--sm" @click="reload">
        {{ dashboardCopy.states.retry }}
      </button>
    </EmptyState>

    <EmptyState
      v-else-if="isEmpty"
      icon="fa-solid fa-calendar-xmark"
      :title="dashboardCopy.states.noData"
      :text="dashboardCopy.states.noDataText"
    />

    <template v-else-if="data">
      <section v-if="slots.length" class="ops__slots" :class="{ 'is-loading': loading }">
        <article v-for="s in slots" :key="s.key" class="ops__slot" :class="`ops__slot--${s.key}`">
          <header class="ops__slot-head">
            <i :class="s.icon" aria-hidden="true"></i>
            <span>{{ s.label }}</span>
            <InfoTip v-if="s.help" :text="s.help" />
          </header>
          <p class="ops__slot-text">{{ s.text }}</p>
          <p class="ops__slot-money num">{{ s.money }}</p>
        </article>
      </section>

      <section class="card">
        <h2 class="card__title">{{ copy.heatmap }} <InfoTip :text="site.help.heatmap" /></h2>
        <HeatmapWeek :cells="data.heatmap" :format="formatCents" />
      </section>

      <div class="ops__row">
        <section class="card ops__col">
          <h2 class="card__title">
            {{ copy.topProducts }} <InfoTip :text="site.help.topProducts" />
          </h2>
          <BarList :items="products" :limit="10" />
        </section>
        <section class="card ops__col">
          <h2 class="card__title">{{ copy.byCategory }}</h2>
          <BarList :items="categories" :highlight-first="false" />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.ops {
  &__slots {
    @include flex-cards(240px, 0.75rem);
    @include transition(opacity);

    &.is-loading {
      opacity: 0.55;
    }
  }

  &__slot {
    @include card;
    @include flex(column, flex-start, flex-start, 0.3rem);
    padding: 1rem 1.1rem 1.1rem;

    &--best {
      background: $ink;
      border-color: $ink;
      color: $paper;

      .ops__slot-head {
        color: rgba($paper, 0.7);
      }

      .ops__slot-head i {
        color: $accent;
      }

      .ops__slot-money {
        color: rgba($paper, 0.65);
      }
    }

    &--worst .ops__slot-head i {
      color: $info;
    }
  }

  &__slot-head {
    @include flex(row, center, flex-start, 0.45rem);
    font-size: 0.78rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__slot-text {
    font-family: $font-display;
    font-size: clamp(1.35rem, 1.1rem + 1.2vw, 1.9rem);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }

  &__slot-money {
    font-size: 0.82rem;
    color: $ink-muted;
  }

  &__row {
    @include flex-cards(320px, 1rem);
  }

  &__col {
    align-self: flex-start;
  }
}
</style>
