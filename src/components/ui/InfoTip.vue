<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId } from 'vue'

defineProps<{ text: string }>()

const open = ref(false)
const alignEnd = ref(false)
const root = ref<HTMLElement | null>(null)
const id = useId()

function onDocPointer(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', onDocPointer as EventListener)
  document[method]('keydown', onKey as EventListener)
}

async function toggle() {
  if (open.value) return close()
  // En el borde derecho de la pantalla el globo se abre hacia la izquierda.
  const rect = root.value?.getBoundingClientRect()
  alignEnd.value = rect ? rect.left > window.innerWidth / 2 : false
  open.value = true
  await nextTick()
  listen(true)
}

function close() {
  open.value = false
  listen(false)
}

onBeforeUnmount(() => listen(false))
</script>

<template>
  <span ref="root" class="tip">
    <button
      type="button"
      class="tip__btn"
      :aria-expanded="open"
      :aria-controls="id"
      aria-label="Más información"
      @click.stop="toggle"
    >
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
    </button>
    <Transition name="tip">
      <span
        v-if="open"
        :id="id"
        role="tooltip"
        class="tip__pop"
        :class="{ 'tip__pop--end': alignEnd }"
      >
        {{ text }}
      </span>
    </Transition>
  </span>
</template>

<style scoped lang="scss">
.tip {
  position: relative;
  display: inline-flex;
  vertical-align: middle;

  &__btn {
    @include flex(row, center, center);
    // Área táctil de 32px aunque el icono sea chico.
    width: 2rem;
    height: 2rem;
    margin: -0.4rem -0.3rem;
    border-radius: 50%;
    color: $ink-muted;
    font-size: 0.85rem;
    @include transition(color);

    &:hover,
    &[aria-expanded='true'] {
      color: $accent;
    }
  }

  &__pop {
    position: absolute;
    top: calc(100% + 0.45rem);
    left: -0.5rem;
    z-index: 60;
    width: max-content;
    max-width: min(260px, calc(100vw - 2rem));
    padding: 0.7rem 0.85rem;
    border-radius: $radius-sm;
    background: $ink;
    color: $paper;
    font-family: $font-principal;
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
    text-transform: none;
    text-align: left;
    white-space: normal;
    box-shadow: $shadow-md;

    &--end {
      left: auto;
      right: -0.5rem;
    }
  }
}

.tip-enter-active,
.tip-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s $ease;
}

.tip-enter-from,
.tip-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
