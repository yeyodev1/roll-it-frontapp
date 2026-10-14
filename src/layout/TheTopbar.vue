<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BrandMark from '@/components/ui/BrandMark.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useAccount } from '@/composables/useAccount'

const emit = defineEmits<{ logout: [] }>()

const route = useRoute()
const { initials, name } = useAccount()
const copy = dashboardCopy.layout

const title = computed(() => (route.meta.title as string | undefined) ?? '')
// El ícono de la sección acompaña al título, igual que en la barra lateral.
const icon = computed(() => site.nav.find((n) => route.path.startsWith(n.to))?.icon ?? '')
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="topbar__brand">
      <BrandMark :size="28" />
    </RouterLink>
    <p class="topbar__title">
      <i v-if="icon" :class="icon" aria-hidden="true"></i>
      {{ title }}
    </p>

    <div class="topbar__user">
      <RouterLink to="/cuenta" class="topbar__account" :aria-label="copy.account">
        <span class="topbar__avatar" aria-hidden="true">{{ initials }}</span>
        <span class="topbar__name">{{ name }}</span>
      </RouterLink>
      <button
        type="button"
        class="topbar__logout"
        :aria-label="copy.logout"
        :title="copy.logout"
        @click="emit('logout')"
      >
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.topbar {
  position: sticky;
  top: 0;
  z-index: 70;
  @include flex(row, center, space-between, $sp-3);
  min-height: 3.75rem;
  padding: $sp-2 $sp-3 $sp-2 $sp-4;
  background: rgba($surface, 0.88);
  backdrop-filter: saturate(1.4) blur(12px);
  border-bottom: 1px solid $line-soft;

  @include from('lg') {
    min-height: 4.25rem;
    padding-inline: $sp-8 $sp-6;
  }

  &__brand {
    @include from('lg') {
      display: none;
    }
  }

  &__title {
    @include flex(row, center, flex-start, 0.6rem);
    font-size: 0.92rem;
    font-weight: 600;
    color: $ink;

    i {
      @include flex(row, center, center);
      width: 2rem;
      height: 2rem;
      border-radius: $radius-ctl;
      background: $canvas;
      color: $accent;
      font-size: 0.85rem;
    }

    @include until('lg') {
      display: none;
    }
  }

  &__user {
    @include flex(row, center, flex-end, 0.25rem);
    min-width: 0;
    margin-left: auto;
  }

  &__account {
    @include flex(row, center, flex-start, 0.55rem);
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.25rem 0.75rem 0.25rem 0.3rem;
    border-radius: $radius-pill;
    @include transition(background-color);

    &:hover {
      background: $canvas;
    }
  }

  &__avatar {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 50%;
    background: $accent-soft;
    color: $accent-deep;
    font-size: 0.72rem;
    font-weight: 700;
  }

  &__name {
    display: none;
    font-size: 0.85rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 14rem;

    @include from('sm') {
      display: block;
    }
  }

  &__logout {
    @include flex(row, center, center);
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    color: $ink-muted;
    @include transition(color);

    &:hover {
      color: $danger;
    }

    // En escritorio salir ya está en la barra lateral.
    @include from('lg') {
      display: none;
    }
  }
}
</style>
