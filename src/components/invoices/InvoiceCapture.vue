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
      <span class="capture__icon" aria-hidden="true"><i class="fa-solid fa-camera"></i></span>
      <span class="capture__text">
        <span class="capture__label">{{ copy.capture }}</span>
        <small>{{ copy.captureHint }}</small>
      </span>
      <span class="capture__cta btn btn--primary btn--sm" aria-hidden="true">
        <i class="fa-solid fa-arrow-up-from-bracket"></i> {{ copy.captureCta }}
      </span>
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
    @include flex(column, center, center, 0.6rem);
    width: 100%;
    height: 100%;
    min-height: 10rem;
    padding: $sp-6 $sp-4;
    border-radius: $radius-card;
    border: 1.5px dashed rgba($accent, 0.5);
    background: linear-gradient(180deg, rgba($accent-soft, 0.7), rgba($accent-soft, 0.3));
    text-align: center;
    @include transition;

    &:hover {
      border-color: $accent;
      background: $accent-soft;

      .capture__icon {
        transform: scale(1.06);
      }
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 16px;
    background: $surface;
    color: $accent;
    font-size: 1.3rem;
    box-shadow: $shadow-sm;
    @include transition(transform);
  }

  &__text {
    @include flex(column, center, center, 0.1rem);

    small {
      color: $ink-soft;
      font-size: 0.78rem;
    }
  }

  &__label {
    font-size: 1.05rem;
    font-weight: 700;
    color: $ink;
  }

  &__cta {
    pointer-events: none;

    @include until('md') {
      display: none;
    }
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
