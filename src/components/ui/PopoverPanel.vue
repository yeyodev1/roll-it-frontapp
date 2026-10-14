<script setup lang="ts">
import { ref, toRef } from 'vue'
import { usePopover } from '@/composables/usePopover'
import { site } from '@/config/site'

/**
 * Panel flotante de los controles propios (AppSelect, AppDatePicker, AppDateRange).
 * En escritorio es un popover anclado al botón; en el celular, una hoja inferior
 * con fondo oscuro, título y botón de cerrar. Esc cierra sin cerrar lo de atrás.
 */
const props = defineProps<{
  open: boolean
  anchor: HTMLElement | null
  title?: string
  minWidth?: number
}>()
const emit = defineEmits<{ close: [reason: 'escape' | 'outside' | 'button'] }>()

const panel = ref<HTMLElement | null>(null)
const { mobile, style, placement } = usePopover(toRef(props, 'open'), () => props.anchor, panel, {
  minWidth: props.minWidth,
  onOutside: () => emit('close', 'outside'),
})

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  // Que no llegue a la hoja o al modal de atrás, que también escuchan Esc.
  event.stopPropagation()
  event.preventDefault()
  emit('close', 'escape')
}

defineExpose({ mobile })
</script>

<template>
  <Teleport to="body">
    <Transition :name="mobile ? 'pop-sheet' : 'pop'">
      <div v-if="open" class="pop" :class="{ 'pop--sheet': mobile }" @keydown="onKey">
        <div v-if="mobile" class="pop__backdrop" aria-hidden="true"></div>
        <div
          ref="panel"
          class="pop__panel"
          :class="`pop__panel--${placement}`"
          :style="mobile ? undefined : style"
        >
          <header v-if="mobile" class="pop__head">
            <span class="pop__title">{{ title }}</span>
            <button
              type="button"
              class="btn btn--ghost btn--icon btn--sm"
              :aria-label="site.ui.close"
              @click="emit('close', 'button')"
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </header>
          <div class="pop__body">
            <slot :mobile="mobile" />
          </div>
          <footer v-if="$slots.footer" class="pop__foot">
            <slot name="footer" :mobile="mobile" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
// Encima de hojas (190) y modales (200), debajo de los toasts (300).
.pop {
  position: fixed;
  inset: 0;
  z-index: 250;
  pointer-events: none;

  &__panel {
    position: fixed;
    @include flex(column, stretch, flex-start);
    overflow: hidden;
    pointer-events: auto;
    @include card;
    border-radius: $radius-sm;
    box-shadow: $shadow-md;
  }

  &__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  &__foot {
    @include flex(row, center, flex-end, 0.5rem);
    padding: 0.6rem 0.75rem;
    border-top: 1px solid $line;
    background: $surface;
  }

  &--sheet {
    pointer-events: auto;
    @include flex(column, stretch, flex-end);
  }

  &--sheet &__backdrop {
    position: absolute;
    inset: 0;
    background: $overlay;
  }

  &--sheet &__panel {
    position: relative;
    max-height: 82dvh;
    border: none;
    border-radius: $radius-md $radius-md 0 0;
    box-shadow: $shadow-lg;
    padding-bottom: env(safe-area-inset-bottom);
  }

  &__head {
    @include flex(row, center, space-between, 1rem);
    padding: 0.9rem 1rem 0.75rem;
    border-bottom: 1px solid $line;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-lg;
    font-weight: 500;
  }

  &--sheet &__foot {
    padding: 0.75rem 1rem;

    :deep(.btn) {
      flex: 1 1 auto;
      min-height: 2.9rem;
    }
  }
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.16s ease;

  .pop__panel {
    transition: transform 0.18s $ease;
  }
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;

  .pop__panel--bottom {
    transform: translateY(-4px);
  }

  .pop__panel--top {
    transform: translateY(4px);
  }
}

.pop-sheet-enter-active,
.pop-sheet-leave-active {
  transition: opacity 0.22s ease;

  .pop__panel {
    transition: transform 0.3s $ease;
  }
}

.pop-sheet-enter-from,
.pop-sheet-leave-to {
  opacity: 0;

  .pop__panel {
    transform: translateY(32px);
  }
}
</style>
