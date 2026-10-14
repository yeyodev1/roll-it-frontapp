<script setup lang="ts">
import EmptyState from './EmptyState.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'

// Estado de error de cualquier carga: qué pasó (mensaje del API) y cómo reintentar.
defineProps<{ message?: string; title?: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <EmptyState
    icon="fa-solid fa-plug-circle-exclamation"
    :title="title || dashboardCopy.states.loadError"
    :text="message"
  >
    <button type="button" class="btn btn--dark btn--sm" @click="emit('retry')">
      <i class="fa-solid fa-rotate-right" aria-hidden="true"></i> {{ site.ui.retry }}
    </button>
  </EmptyState>
</template>
