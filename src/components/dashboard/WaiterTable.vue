<script setup lang="ts">
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import AppBadge, { type BadgeTone } from '@/components/ui/AppBadge.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import type { Trend } from '@/composables/useWaiters'

export interface WaiterRow extends Record<string, unknown> {
  id: string
  rank: number
  name: string
  branch: string
  levelLabel: string
  tone: BadgeTone
  color: string
  score: number
  avgTicket: string
  avgTrend: Trend
  perDay: string
  perDayTrend: Trend
  perTicket: string
  perTicketTrend: Trend
  reasons: string[]
}

/**
 * Ranking de meseros: puesto, nivel, puntaje con barra y las tres métricas
 * contra el equipo (flecha). El porqué del puntaje va detrás del (i).
 */
defineProps<{ rows: WaiterRow[] }>()

const copy = dashboardCopy.waiters
const cols = copy.cols
const columns: TableColumn[] = [
  { key: 'name', label: cols.name },
  { key: 'levelLabel', label: cols.level, hideOnMobile: true },
  { key: 'score', label: cols.score, align: 'right' },
  { key: 'avgTicket', label: cols.avgTicket, align: 'right', hideOnMobile: true },
  { key: 'perDay', label: cols.perDay, align: 'right', hideOnMobile: true, hideOnNarrow: true },
  {
    key: 'perTicket',
    label: cols.perTicket,
    align: 'right',
    hideOnMobile: true,
    hideOnNarrow: true,
  },
]
const TREND = {
  up: 'fa-solid fa-caret-up',
  down: 'fa-solid fa-caret-down',
  flat: 'fa-solid fa-minus',
}
const trend = (t: Trend) => [TREND[t], `is-${t}`]
</script>

<template>
  <DataTable :columns="columns" :rows="rows" :caption="copy.ranking">
    <template #cell-name="{ row }">
      <span class="who">
        <span class="who__pos" :class="{ 'who__pos--top': row.rank <= 3 }">{{ row.rank }}</span>
        <span class="who__text">
          <strong>{{ row.name }}</strong>
          <small>{{ row.branch }}</small>
        </span>
        <InfoTip v-if="row.reasons.length" class="who__tip" :text="row.reasons.join(' · ')" />
      </span>
    </template>
    <template #cell-levelLabel="{ row }">
      <AppBadge :tone="row.tone" dot>{{ row.levelLabel }}</AppBadge>
    </template>
    <template #cell-score="{ row }">
      <span class="score">
        <span class="score__track" aria-hidden="true">
          <span
            class="score__fill"
            :style="{ width: `${Math.max(row.score, 3)}%`, background: row.color }"
          ></span>
        </span>
        <strong :style="{ color: row.color }">{{ row.score }}</strong>
      </span>
    </template>
    <template #cell-avgTicket="{ row }">
      <span class="trend"
        >{{ row.avgTicket }}<i :class="trend(row.avgTrend)" aria-hidden="true"></i
      ></span>
    </template>
    <template #cell-perDay="{ row }">
      <span class="trend"
        >{{ row.perDay }}<i :class="trend(row.perDayTrend)" aria-hidden="true"></i
      ></span>
    </template>
    <template #cell-perTicket="{ row }">
      <span class="trend"
        >{{ row.perTicket }}<i :class="trend(row.perTicketTrend)" aria-hidden="true"></i
      ></span>
    </template>
  </DataTable>
</template>

<style scoped lang="scss">
.who {
  @include flex(row, center, flex-start, 0.65rem);

  &__pos {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: $canvas;
    font-size: 0.7rem;
    font-weight: 700;
    color: $ink-soft;

    &--top {
      background: $ink;
      color: $surface;
    }
  }

  &__text {
    @include flex(column, flex-start, center);
    line-height: 1.25;
    min-width: 0;

    strong {
      font-weight: 600;
    }

    small {
      font-size: 0.7rem;
      color: $ink-muted;
    }
  }

  &__tip {
    margin-left: 0.15rem;
  }
}

.score {
  @include flex(row, center, flex-end, 0.6rem);

  &__track {
    width: 4.5rem;
    height: 0.4rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;

    @include until('sm') {
      width: 3rem;
    }
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    transform-origin: left;
    animation: score-grow 0.7s $ease both;
  }

  strong {
    min-width: 1.6rem;
    font-weight: 700;
  }
}

.trend {
  @include flex(row, center, flex-end, 0.3rem);

  i {
    width: 0.7rem;
    font-size: 0.7rem;
  }

  .is-up {
    color: $success;
  }

  .is-down {
    color: $danger;
  }

  .is-flat {
    color: $ink-muted;
    font-size: 0.55rem;
  }
}

@keyframes score-grow {
  from {
    transform: scaleX(0);
  }
}
</style>
