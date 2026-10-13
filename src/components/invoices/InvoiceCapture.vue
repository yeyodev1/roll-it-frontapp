<script setup lang="ts">
import { ref } from 'vue'
import { inventoryCopy } from '@/config/inventoryCopy'

defineProps<{ uploading: boolean; preview: string; disabled?: boolean }>()
const emit = defineEmits<{ file: [file: File] }>()

const copy = inventoryCopy.invoices
const input = ref<HTMLInputElement | null>(null)

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('file', file)
  // Limpia el input para poder volver a tomar la misma foto si falló.
  target.value = ''
}
</script>

<template>
  <div class="capture" :class="{ 'capture--busy': uploading }">
    <div v-if="uploading" class="capture__reading" aria-live="polite">
      <img v-if="preview" :src="preview" alt="" class="capture__preview" />
      <span class="capture__scan" aria-hidden="true"></span>
      <p class="capture__status">
        <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
        {{ copy.reading }}
        <small>{{ copy.readingHint }}</small>
      </p>
    </div>
    <button
      v-else
      type="button"
      class="capture__button"
      :disabled="disabled"
      @click="input?.click()"
    >
      <i class="fa-solid fa-camera" aria-hidden="true"></i>
      <span class="capture__label">{{ copy.capture }}</span>
      <small>{{ copy.captureHint }}</small>
    </button>
    <input
      ref="input"
      class="visually-hidden"
      type="file"
      accept="image/*"
      capture="environment"
      tabindex="-1"
      @change="onChange"
    />
  </div>
</template>

<style scoped lang="scss">
.capture {
  &__button {
    @include flex(column, center, center, 0.35rem);
    width: 100%;
    min-height: 11rem;
    padding: 1.5rem;
    border-radius: $radius-md;
    border: 2px dashed rgba($accent, 0.55);
    background: $accent-soft;
    color: $accent-deep;
    @include transition;

    i {
      font-size: 2.2rem;
      margin-bottom: 0.3rem;
    }

    small {
      color: $ink-soft;
      font-size: $text-xs;
    }

    &:hover {
      border-color: $accent;
      background: darken($accent-soft, 3%);
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  &__label {
    @include display($text-xl, 600);
  }

  &__reading {
    position: relative;
    overflow: hidden;
    border-radius: $radius-md;
    min-height: 11rem;
    background: $ink;
  }

  &__preview {
    width: 100%;
    max-height: 18rem;
    object-fit: cover;
    opacity: 0.55;
  }

  // Línea que barre la foto mientras la IA la lee.
  &__scan {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 3px;
    background: $accent;
    box-shadow: 0 0 18px 4px rgba($accent, 0.6);
    animation: scan 1.8s ease-in-out infinite alternate;

    @include reduced-motion {
      display: none;
    }
  }

  &__status {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    @include flex(column, center, center, 0.2rem);
    padding: 1rem;
    color: $surface;
    font-weight: 600;
    background: linear-gradient(to top, rgba($ink, 0.9), transparent);

    small {
      font-weight: 400;
      font-size: $text-xs;
      opacity: 0.75;
    }
  }
}

@keyframes scan {
  from {
    top: 0;
  }
  to {
    top: calc(100% - 3px);
  }
}
</style>
