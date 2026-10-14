<script setup lang="ts">
import { computed } from 'vue'
import { dashboardCopy } from '@/config/dashboardCopy'

// Barra de subida del reporte: primero lo enviado (%), después una barra en espera mientras el servidor carga.
const props = defineProps<{ name: string; progress: number; processing: boolean }>()

const copy = dashboardCopy.salesUpload
const pct = computed(() => Math.round(props.progress * 100))
const status = computed(() => (props.processing ? copy.processing : copy.uploading))
</script>

<template>
  <div class="prog" aria-live="polite">
    <span class="prog__file">
      <i class="fa-solid fa-file-excel" aria-hidden="true"></i>
      <span>{{ name }}</span>
    </span>
    <div
      class="prog__track"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="status"
    >
      <span
        class="prog__bar"
        :class="{ 'prog__bar--wait': processing }"
        :style="{ transform: `scaleX(${processing ? 1 : progress})` }"
      ></span>
    </div>
    <p class="prog__status">
      <span>{{ status }}</span>
      <span v-if="!processing" class="num">{{ pct }}%</span>
      <span v-else class="muted">{{ copy.processingHint }}</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
.prog {
  @include flex(column, stretch, flex-start, $sp-2);
  padding: $sp-5 $sp-4;
  border-radius: $radius-card;
  background: $canvas;

  &__file {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: 0.86rem;
    font-weight: 600;
    min-width: 0;

    i {
      color: $success;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__track {
    height: 0.5rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: $accent;
    transform-origin: left;
    transition: transform 0.25s ease;

    &--wait {
      background: linear-gradient(90deg, rgba($accent, 0.55), $accent, rgba($accent, 0.55));
      background-size: 200% 100%;
      animation: prog-wait 1.4s linear infinite;
    }
  }

  &__status {
    @include flex(row, center, space-between, $sp-2);
    font-size: 0.78rem;
    color: $ink-soft;
  }
}

@keyframes prog-wait {
  to {
    background-position: -200% 0;
  }
}
</style>
