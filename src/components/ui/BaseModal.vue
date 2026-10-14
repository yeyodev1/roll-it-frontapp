<script setup lang="ts">
import { toRef } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { site } from '@/config/site'

const props = defineProps<{
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  /** Ícono propio en vez del de pregunta/alerta. */
  icon?: string
  /** Caja ancha, alineada a la izquierda y sin botones: para un formulario o un uploader. */
  panel?: boolean
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

useBodyScroll(toRef(props, 'open'))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="emit('cancel')">
        <div
          class="modal__box"
          :class="{ 'modal__box--panel': panel }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <button
            v-if="panel"
            type="button"
            class="modal__close"
            :aria-label="site.ui.close"
            @click="emit('cancel')"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
          <span class="modal__icon" :class="{ 'modal__icon--danger': danger }">
            <i
              :class="
                icon ||
                (danger ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question')
              "
            ></i>
          </span>
          <h3 class="modal__title">{{ title }}</h3>
          <p v-if="message" class="modal__message">{{ message }}</p>
          <slot />
          <div v-if="!panel" class="modal__actions">
            <button class="btn btn--ghost" @click="emit('cancel')">
              {{ cancelLabel || 'Cancelar' }}
            </button>
            <button
              class="btn"
              :class="danger ? 'btn--danger' : 'btn--primary'"
              @click="emit('confirm')"
            >
              {{ confirmLabel || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  background: $overlay;
  backdrop-filter: blur(3px);
  @include flex(row, center, center);
  z-index: 200;
  padding: 1rem;

  &__box {
    @include card;
    @include flex(column, center, flex-start, 0.65rem);
    text-align: center;
    max-width: 420px;
    width: 100%;
    padding: 2.2rem 2rem 1.8rem;
    box-shadow: $shadow-lg;

    &--panel {
      position: relative;
      align-items: stretch;
      text-align: left;
      max-width: 34rem;
      max-height: calc(100dvh - 2rem);
      overflow-y: auto;
      padding: $sp-6 $sp-4 $sp-4;

      @include from('md') {
        padding: $sp-6;
      }

      .modal__icon {
        @include flex(row, center, center);
        width: 2.5rem;
        height: 2.5rem;
        border-radius: $radius-ctl;
        background: $accent-soft;
        font-size: 1rem;
      }

      .modal__title {
        margin-bottom: $sp-2;
      }
    }
  }

  &__close {
    position: absolute;
    top: $sp-4;
    right: $sp-4;
    @include flex(row, center, center);
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    color: $ink-muted;
    @include transition(background-color);

    &:hover {
      background: $canvas;
      color: $ink;
    }
  }

  &__icon {
    font-size: 1.7rem;
    color: $accent;

    &--danger {
      color: $danger;
    }
  }

  &__title {
    @include display($text-xl, 600);
  }

  &__message {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__actions {
    @include flex(row, center, center, 0.6rem);
    flex-wrap: wrap;
    margin-top: 0.8rem;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;

  .modal__box {
    transition: transform 0.3s $ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__box {
    transform: translateY(12px) scale(0.98);
  }
}
</style>
