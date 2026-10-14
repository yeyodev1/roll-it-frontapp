<script setup lang="ts">
import { computed } from 'vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useAgentStatus } from '@/composables/useAgentStatus'
import { useFiltersStore } from '@/stores/filters'
import type { AgentState } from '@/types'

/**
 * Pastilla de la barra de filtros: si el agente del local está subiendo
 * ventas. Con "Todas" resume las sucursales y el detalle va en el title.
 */
const copy = dashboardCopy.agent
const filters = useFiltersStore()
const { statuses, byBranch } = useAgentStatus()

const scoped = computed(() =>
  filters.branch === 'all'
    ? statuses.value
    : statuses.value.filter((s) => s.branch._id === filters.branch),
)
const states = computed(() =>
  scoped.value.map((s) => byBranch.value.get(s.branch._id) ?? ('none' as AgentState)),
)

// El peor estado manda el color: un local caído no se esconde detrás de dos en vivo.
const tone = computed<AgentState>(() => {
  if (states.value.includes('offline')) return 'offline'
  if (states.value.every((s) => s === 'live')) return 'live'
  return states.value.includes('live') ? 'offline' : 'none'
})

const label = computed(() => {
  const [only] = states.value
  if (states.value.length === 1 && only) return copy.pill[only]
  const live = states.value.filter((s) => s === 'live').length
  if (live === states.value.length) return copy.allLive
  if (states.value.every((s) => s === 'none')) return copy.pill.none
  return copy.someLive(live, states.value.length)
})

const detail = computed(() =>
  scoped.value
    .map((s) => `${s.branch.name}: ${copy.states[byBranch.value.get(s.branch._id) ?? 'none']}`)
    .join(' · '),
)
</script>

<template>
  <p v-if="states.length" class="agent" :class="`agent--${tone}`" :title="detail" role="status">
    <span class="agent__dot" aria-hidden="true"></span>
    <i class="fa-solid fa-desktop" aria-hidden="true"></i>
    {{ label }}
  </p>
</template>

<style scoped lang="scss">
.agent {
  @include flex(row, center, flex-start, 0.45rem);
  min-height: 2rem;
  margin: 0;
  padding: 0 0.8rem;
  border-radius: $radius-pill;
  font-size: 0.74rem;
  font-weight: 500;
  white-space: nowrap;

  i {
    font-size: 0.68rem;
  }

  &__dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: currentColor;
  }

  &--live {
    background: rgba($success, 0.09);
    color: darken($success, 16%);

    .agent__dot {
      box-shadow: 0 0 0 3px rgba($success, 0.2);
    }
  }

  &--offline {
    background: $warning-bg;
    color: darken($warning, 22%);
  }

  &--none {
    background: rgba($ink, 0.06);
    color: rgba($ink, 0.62);
  }
}
</style>
