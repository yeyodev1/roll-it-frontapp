<script setup lang="ts">
import { computed } from 'vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useTimeAgo } from '@/composables/useTimeAgo'

// "Actualizado hace 2 min · a las 15:42": cuándo trajo datos esta pantalla por última vez.
const props = defineProps<{ at: string | null; refreshing?: boolean }>()

const copy = dashboardCopy.refresh
const ago = useTimeAgo(() => props.at)
const clock = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' })
const time = computed(() => (props.at ? clock.format(new Date(props.at)) : ''))
</script>

<template>
  <p v-if="at" class="stamp" aria-live="polite">
    <i
      class="fa-solid fa-rotate"
      :class="{ 'stamp__icon--spin': refreshing }"
      aria-hidden="true"
    ></i>
    <span v-if="refreshing">{{ copy.refreshing }}</span>
    <span v-else>
      {{ copy.updated }} {{ ago }} <span class="stamp__time num">· {{ copy.at(time) }}</span>
    </span>
  </p>
</template>

<style scoped lang="scss">
.stamp {
  @include flex(row, center, flex-start, 0.4rem);
  font-size: 0.75rem;
  color: $ink-muted;
  white-space: nowrap;

  i {
    font-size: 0.7rem;
    color: $ink-muted;
  }

  &__icon--spin {
    animation: stamp-spin 0.9s linear infinite;
  }

  @include reduced-motion {
    &__icon--spin {
      animation: none;
    }
  }
}

@keyframes stamp-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
