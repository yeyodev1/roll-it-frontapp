<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useNav } from '@/composables/useNav'
import { useBodyScroll } from '@/composables/useBodyScroll'

const emit = defineEmits<{ logout: [] }>()

const route = useRoute()
const { items } = useNav()
const copy = dashboardCopy.layout
const open = ref(false)

// La barra aguanta 5 botones cómodos con el pulgar; el resto va al cajón "Más".
const MAX = 5
const overflow = computed(() => items.value.length > MAX)
const primary = computed(() => (overflow.value ? items.value.slice(0, MAX - 1) : items.value))
const rest = computed(() => (overflow.value ? items.value.slice(MAX - 1) : []))
const restActive = computed(() => rest.value.some((item) => route.path.startsWith(item.to)))

useBodyScroll(open)
watch(
  () => route.fullPath,
  () => (open.value = false),
)

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}
watch(open, (value) => {
  if (value) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <nav class="mnav" :aria-label="copy.mainNav">
    <RouterLink v-for="item in primary" :key="item.to" :to="item.to" class="mnav__item">
      <i :class="item.icon" aria-hidden="true"></i>
      <span>{{ item.label }}</span>
    </RouterLink>
    <button
      v-if="overflow"
      type="button"
      class="mnav__item"
      :class="{ 'router-link-active': restActive || open }"
      :aria-expanded="open"
      aria-controls="mnav-drawer"
      @click="open = !open"
    >
      <i class="fa-solid fa-ellipsis" aria-hidden="true"></i>
      <span>{{ copy.more }}</span>
    </button>
  </nav>

  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet" @click.self="open = false">
        <div
          id="mnav-drawer"
          class="sheet__panel"
          role="dialog"
          aria-modal="true"
          :aria-label="copy.more"
        >
          <span class="sheet__grip" aria-hidden="true"></span>
          <RouterLink v-for="item in rest" :key="item.to" :to="item.to" class="sheet__link">
            <i :class="item.icon" aria-hidden="true"></i>{{ item.label }}
          </RouterLink>
          <RouterLink to="/cuenta" class="sheet__link">
            <i class="fa-solid fa-circle-user" aria-hidden="true"></i>{{ copy.account }}
          </RouterLink>
          <button type="button" class="sheet__link sheet__link--danger" @click="emit('logout')">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>{{ copy.logout }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.mnav {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 90;
  @include flex(row, stretch, space-around, 0.15rem);
  padding: 0.4rem 0.4rem calc(0.4rem + env(safe-area-inset-bottom));
  background: rgba($surface, 0.97);
  backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid $line-soft;
  border-radius: $radius-card $radius-card 0 0;
  box-shadow: 0 -8px 24px -10px rgba($ink, 0.12);

  @include from('lg') {
    display: none;
  }

  &__item {
    flex: 1 1 0;
    min-width: 0;
    @include flex(column, center, center, 0.2rem);
    min-height: 3.25rem;
    border-radius: $radius-ctl;
    color: $ink-muted;
    font-size: 0.64rem;
    font-weight: 600;
    @include transition(color);

    // El ícono lleva su propia pastilla: así la sección activa se ve de un vistazo.
    i {
      @include flex(row, center, center);
      width: 3rem;
      height: 1.85rem;
      border-radius: $radius-pill;
      font-size: 1rem;
      @include transition(background-color);
    }

    span {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.router-link-active {
      color: $accent-deep;

      i {
        background: $accent-soft;
        color: $accent;
      }
    }
  }
}

// Queda debajo de la barra (z 90) para que "Más" siga a mano y lo cierre.
.sheet {
  position: fixed;
  inset: 0;
  z-index: 85;
  background: $overlay;
  @include flex(column, stretch, flex-end);

  &__panel {
    @include flex(column, stretch, flex-start, 0.15rem);
    padding: 0.6rem 0.75rem calc(5rem + env(safe-area-inset-bottom));
    background: $surface;
    border-radius: $radius-md $radius-md 0 0;
    box-shadow: $shadow-lg;
  }

  &__grip {
    align-self: center;
    width: 2.5rem;
    height: 4px;
    border-radius: 4px;
    background: $line;
    margin-bottom: 0.6rem;
  }

  &__link {
    @include flex(row, center, flex-start, 0.85rem);
    min-height: 3rem;
    padding: 0.5rem 0.75rem;
    border-radius: $radius-sm;
    font-size: 0.95rem;
    font-weight: 500;
    color: $ink;
    text-align: left;
    width: 100%;

    i {
      width: 1.2rem;
      text-align: center;
      color: $ink-muted;
    }

    &.router-link-active {
      background: $accent-soft;

      i {
        color: $accent;
      }
    }

    &--danger,
    &--danger i {
      color: $danger;
    }
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;

  .sheet__panel {
    transition: transform 0.3s $ease;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .sheet__panel {
    transform: translateY(100%);
  }
}
</style>
