<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { formatCents, formatQty } from '@/utils/format'
import type { WaiterStats, WaitersResponse } from '@/types'

const props = defineProps<{ stats: WaiterStats; rank: number; team: WaitersResponse['teamAvg'] }>()

const copy = dashboardCopy.waiters
const R = 26
const CIRC = 2 * Math.PI * R

const score = computed(() => Math.round(Math.min(Math.max(props.stats.score, 0), 100)))
const dash = computed(() => `${(score.value / 100) * CIRC} ${CIRC}`)
const levelLabel = computed(() => site.waiterLevels[props.stats.level])

function cmp(value: number, base: number): 'up' | 'down' | 'flat' {
  if (!base) return 'flat'
  const diff = (value - base) / base
  return Math.abs(diff) < 0.03 ? 'flat' : diff > 0 ? 'up' : 'down'
}

const metrics = computed(() => [
  {
    label: copy.avgTicket,
    value: formatCents(props.stats.avgTicketCents),
    trend: cmp(props.stats.avgTicketCents, props.team.avgTicketCents),
  },
  {
    label: copy.perDay,
    value: formatQty(props.stats.ticketsPerDay),
    trend: cmp(props.stats.ticketsPerDay, props.team.ticketsPerDay),
  },
  {
    label: copy.perTicket,
    value: formatQty(props.stats.itemsPerTicket),
    trend: cmp(props.stats.itemsPerTicket, props.team.itemsPerTicket),
  },
])

const reasonIcon = computed(
  () =>
    ({
      top: 'fa-solid fa-circle-check',
      ok: 'fa-solid fa-circle-dot',
      attention: 'fa-solid fa-triangle-exclamation',
    })[props.stats.level],
)
const trendIcon = {
  up: 'fa-solid fa-caret-up',
  down: 'fa-solid fa-caret-down',
  flat: 'fa-solid fa-minus',
}
</script>

<template>
  <article class="waiter" :class="`waiter--${stats.level}`">
    <header class="waiter__head">
      <span class="waiter__rank num">{{ rank }}</span>
      <div class="waiter__who">
        <h3 class="waiter__name">{{ stats.waiter.name }}</h3>
        <p class="waiter__branch">{{ stats.branch.name }} · {{ copy.days(stats.daysWorked) }}</p>
        <span class="waiter__level">{{ levelLabel }}</span>
      </div>
      <div class="waiter__ring" role="img" :aria-label="`${copy.score}: ${score} / 100`">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" :r="R" class="waiter__ring-bg" />
          <circle cx="32" cy="32" :r="R" class="waiter__ring-fg" :stroke-dasharray="dash" />
        </svg>
        <span class="waiter__score num">{{ score }}</span>
      </div>
    </header>

    <ul class="waiter__metrics">
      <li v-for="m in metrics" :key="m.label">
        <span class="waiter__metric-label">{{ m.label }}</span>
        <span class="waiter__metric-value num">
          {{ m.value }}
          <i :class="[trendIcon[m.trend], `is-${m.trend}`]" aria-hidden="true"></i>
        </span>
      </li>
    </ul>

    <ul v-if="stats.reasons.length" class="waiter__reasons">
      <li v-for="(r, i) in stats.reasons" :key="i">
        <i :class="reasonIcon" aria-hidden="true"></i>
        <span>{{ r }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
.waiter {
  --level: #{$info};
  --level-bg: #{$info-bg};
  @include card;
  @include flex(column, stretch, flex-start, 0.9rem);
  padding: 1rem 1rem 1.1rem;
  border-top: 3px solid var(--level);

  &--top {
    --level: #{$success};
    --level-bg: #{$success-bg};
  }

  &--attention {
    --level: #{$danger};
    --level-bg: #{$danger-bg};
  }

  &__head {
    @include flex(row, center, flex-start, 0.75rem);
  }

  &__rank {
    flex-shrink: 0;
    align-self: flex-start;
    font-family: $font-display;
    font-size: 1.1rem;
    color: $ink-muted;
    min-width: 1.4rem;
  }

  &__who {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-family: $font-display;
    font-size: 1.3rem;
    font-weight: 500;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  &__branch {
    font-size: 0.75rem;
    color: $ink-muted;
    margin-top: 0.1rem;
  }

  &__level {
    display: inline-block;
    margin-top: 0.4rem;
    padding: 0.15rem 0.6rem;
    border-radius: $radius-pill;
    background: var(--level-bg);
    color: var(--level);
    font-size: 0.72rem;
    font-weight: 700;
    filter: brightness(0.82);
  }

  &__ring {
    position: relative;
    flex-shrink: 0;
    width: 4rem;
    height: 4rem;

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
  }

  &__ring-bg,
  &__ring-fg {
    fill: none;
    stroke-width: 6;
  }

  &__ring-bg {
    stroke: $sand;
  }

  &__ring-fg {
    stroke: var(--level);
    stroke-linecap: round;
  }

  &__score {
    position: absolute;
    inset: 0;
    @include flex(row, center, center);
    font-family: $font-display;
    font-size: 1.35rem;
    font-weight: 600;
  }

  &__metrics {
    list-style: none;
    @include flex(row, stretch, space-between, 0.5rem);
    padding: 0.7rem 0;
    border-block: 1px solid $line;

    li {
      @include flex(column, flex-start, flex-start, 0.1rem);
      flex: 1 1 0;
      min-width: 0;
    }
  }

  &__metric-label {
    font-size: 0.68rem;
    color: $ink-muted;
    white-space: nowrap;
  }

  &__metric-value {
    font-size: 0.92rem;
    font-weight: 600;

    .is-up {
      color: $success;
    }

    .is-down {
      color: $danger;
    }

    .is-flat {
      color: $ink-muted;
      font-size: 0.6rem;
    }
  }

  &__reasons {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.5rem);

    li {
      @include flex(row, flex-start, flex-start, 0.55rem);
      font-size: 0.9rem;
      line-height: 1.4;
      color: $ink;
    }

    i {
      margin-top: 0.2rem;
      color: var(--level);
      font-size: 0.8rem;
    }
  }
}
</style>
