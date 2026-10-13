<script setup lang="ts">
import { onBeforeUnmount, onMounted, toRef } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'

/**
 * Hoja para formularios: sube desde abajo en el celular (se alcanza con el
 * pulgar) y se abre a la derecha en escritorio. BaseModal queda para confirmar.
 */
const props = defineProps<{ open: boolean; title: string; subtitle?: string }>()
const emit = defineEmits<{ close: [] }>()

useBodyScroll(toRef(props, 'open'))

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet" @click.self="emit('close')">
        <section class="sheet__panel" role="dialog" aria-modal="true" :aria-label="title">
          <header class="sheet__head">
            <div class="sheet__titles">
              <h2 class="sheet__title">{{ title }}</h2>
              <p v-if="subtitle" class="sheet__subtitle">{{ subtitle }}</p>
            </div>
            <button
              class="btn btn--ghost btn--icon btn--sm"
              aria-label="Cerrar"
              @click="emit('close')"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </header>
          <div class="sheet__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="sheet__foot">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.sheet {
  position: fixed;
  inset: 0;
  z-index: 190;
  background: $overlay;
  @include flex(column, stretch, flex-end);

  @include from('md') {
    flex-direction: row;
    justify-content: flex-end;
  }

  &__panel {
    @include flex(column, stretch, flex-start);
    background: $paper;
    max-height: 92dvh;
    border-radius: $radius-md $radius-md 0 0;
    box-shadow: $shadow-lg;

    @include from('md') {
      width: min(460px, 100%);
      max-height: none;
      height: 100%;
      border-radius: 0;
    }
  }

  &__head {
    @include flex(row, flex-start, space-between, 1rem);
    padding: 1.1rem 1.1rem 0.9rem;
    border-bottom: 1px solid $line;
  }

  &__titles {
    min-width: 0;
  }

  &__title {
    @include display($text-xl, 500);
  }

  &__subtitle {
    font-size: $text-sm;
    color: $ink-muted;
    margin-top: 0.15rem;
  }

  &__body {
    @include flex(column, stretch, flex-start, 1rem);
    flex: 1;
    overflow-y: auto;
    padding: 1.1rem;
  }

  &__foot {
    @include flex(row, center, flex-end, 0.5rem);
    flex-wrap: wrap;
    padding: 0.9rem 1.1rem calc(0.9rem + env(safe-area-inset-bottom));
    border-top: 1px solid $line;
    background: $surface;

    :deep(.btn) {
      flex: 1 1 auto;
    }
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;

  .sheet__panel {
    transition: transform 0.35s $ease;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .sheet__panel {
    transform: translateY(40px);

    @include from('md') {
      transform: translateX(40px);
    }
  }
}
</style>
