<script setup lang="ts">
import { computed } from 'vue'
import AppBadge, { type BadgeTone } from '@/components/ui/AppBadge.vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { agentState } from '@/composables/useAgentStatus'
import { useTimeAgo } from '@/composables/useTimeAgo'
import type { AgentInfo } from '@/types'

/** Estado del agente de un local en la tarjeta de Ajustes → Sincronización. */
const props = defineProps<{ agent?: AgentInfo }>()

const copy = dashboardCopy.agent
const state = computed(() => agentState(props.agent))
const ago = useTimeAgo(() => props.agent?.lastSeenAt ?? null)
const tones: Record<string, BadgeTone> = { live: 'success', offline: 'warning', none: 'neutral' }
const mode = computed(() =>
  props.agent?.mode ? (copy.modes[props.agent.mode] ?? props.agent.mode) : '',
)
</script>

<template>
  <div class="agent">
    <div class="agent__head">
      <span class="agent__label">{{ copy.label }}</span>
      <AppBadge :tone="tones[state]" dot>{{ copy.states[state] }}</AppBadge>
    </div>
    <p class="agent__meta">
      <span v-if="agent?.lastSeenAt">{{ copy.lastSeen }} {{ ago }}</span>
      <span v-else>{{ copy.never }}</span>
      <span v-if="mode"> · {{ mode }}</span>
      <span v-if="agent?.version"> · {{ copy.version }} {{ agent.version }}</span>
    </p>
    <p v-if="agent?.lastError && state !== 'none'" class="agent__error">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      {{ copy.lastError }}: {{ agent.lastError }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.agent {
  @include flex(column, stretch, flex-start, 0.3rem);
  padding-top: $sp-3;
  border-top: 1px solid rgba($line, 0.6);

  &__head {
    @include flex(row, center, space-between, $sp-2);
  }

  &__label {
    @include card-label;
    font-size: 0.72rem;
  }

  &__meta {
    margin: 0;
    font-size: 0.74rem;
    color: rgba($ink, 0.62);
  }

  &__error {
    @include flex(row, flex-start, flex-start, 0.35rem);
    margin: 0;
    font-size: 0.72rem;
    color: darken($warning, 22%);
    overflow-wrap: anywhere;

    i {
      margin-top: 0.15rem;
    }
  }
}
</style>
