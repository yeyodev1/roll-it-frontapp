<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import WaiterCard from '@/components/dashboard/WaiterCard.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { dashboardService } from '@/services/dashboard.service'
import { useDashboardData } from '@/composables/useDashboardData'
import { useFiltersStore } from '@/stores/filters'
import { formatCents, formatQty } from '@/utils/format'
import type { WaiterStats } from '@/types'

type View = 'all' | 'attention' | 'top'

const copy = dashboardCopy.waiters
const filters = useFiltersStore()
const { data, loading, error, reload } = useDashboardData(
  dashboardService.waiters.bind(dashboardService),
)

const view = ref<View>('all')

// El ranking se fija por puntaje antes de filtrar: el número de cada uno no cambia al filtrar.
const ranked = computed(() =>
  [...(data.value?.waiters ?? [])]
    .sort((a, b) => b.score - a.score)
    .map((stats, i) => ({ stats, rank: i + 1 })),
)

const counts = computed(() => ({
  all: ranked.value.length,
  attention: ranked.value.filter((r) => r.stats.level === 'attention').length,
  top: ranked.value.filter((r) => r.stats.level === 'top').length,
}))

// Si al cambiar de fechas el filtro queda vacío, se vuelve a ver a todos.
watch(counts, (c) => {
  if (!c[view.value]) view.value = 'all'
})

const visible = computed(() =>
  view.value === 'all' ? ranked.value : ranked.value.filter((r) => r.stats.level === view.value),
)

const tabs = computed<{ value: View; label: string; count: number }[]>(() => [
  { value: 'all', label: copy.all, count: counts.value.all },
  { value: 'attention', label: copy.attentionFirst, count: counts.value.attention },
  { value: 'top', label: copy.topOnly, count: counts.value.top },
])

const team = computed(() => data.value?.teamAvg)
const teamItems = computed(() =>
  team.value
    ? [
        { label: copy.avgTicket, value: formatCents(team.value.avgTicketCents) },
        { label: copy.perDay, value: formatQty(team.value.ticketsPerDay) },
        { label: copy.perTicket, value: formatQty(team.value.itemsPerTicket) },
      ]
    : [],
)

function key(s: WaiterStats) {
  return `${s.waiter._id}-${s.branch._id}`
}
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" :subtitle="filters.branchName" :help="site.help.waiterScore" />

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
      v-else-if="data && !ranked.length"
      icon="fa-solid fa-user-clock"
      :title="copy.empty"
      :text="copy.emptyText"
    />

    <template v-else-if="data && team">
      <section class="wt__team">
        <span class="wt__team-title">{{ copy.teamAvg }}</span>
        <dl class="wt__team-list">
          <div v-for="t in teamItems" :key="t.label">
            <dt>{{ t.label }}</dt>
            <dd class="num">{{ t.value }}</dd>
          </div>
        </dl>
      </section>

      <div class="wt__tabs" role="group">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          class="chip"
          :aria-pressed="view === t.value"
          :disabled="!t.count"
          @click="view = t.value"
        >
          {{ t.label }} <span class="wt__count num">{{ t.count }}</span>
        </button>
      </div>

      <section class="wt__list" :class="{ 'is-loading': loading }">
        <WaiterCard
          v-for="r in visible"
          :key="key(r.stats)"
          :stats="r.stats"
          :rank="r.rank"
          :team="team"
        />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.wt {
  &__team {
    @include flex(row, center, space-between, 0.6rem 1.5rem);
    flex-wrap: wrap;
    padding: 0.85rem 1rem;
    border-radius: 14px;
    background: $sand;
  }

  &__team-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__team-list {
    @include flex(row, center, flex-start, 1.25rem);
    flex-wrap: wrap;

    div {
      @include flex(column, flex-start, flex-start);
    }

    dt {
      font-size: 0.68rem;
      color: $ink-muted;
    }

    dd {
      font-family: $font-display;
      font-size: 1.15rem;
      font-weight: 500;
    }
  }

  &__tabs {
    @include flex(row, center, flex-start, 0.4rem);
    overflow-x: auto;
    scrollbar-width: none;

    .chip:disabled {
      opacity: 0.45;
      pointer-events: none;
    }
  }

  &__count {
    font-size: 0.72rem;
    opacity: 0.7;
  }

  &__list {
    @include flex-cards(300px, 1rem);
    align-items: flex-start;
    @include transition(opacity);

    &.is-loading {
      opacity: 0.55;
    }
  }
}
</style>
