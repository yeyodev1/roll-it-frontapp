<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BrandMark from '@/components/ui/BrandMark.vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{ logout: [] }>()

const route = useRoute()
const userStore = useUserStore()
const copy = dashboardCopy.layout

const title = computed(() => (route.meta.title as string | undefined) ?? '')
const initials = computed(() => {
  const name = userStore.user?.name || userStore.user?.email || ''
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
})
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="topbar__brand">
      <BrandMark :size="26" />
    </RouterLink>
    <p class="topbar__title">{{ title }}</p>

    <div class="topbar__user">
      <RouterLink to="/cuenta" class="topbar__account" :aria-label="copy.account">
        <span class="topbar__avatar" aria-hidden="true">{{ initials }}</span>
        <span class="topbar__name">{{ userStore.user?.name }}</span>
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
  @include flex(row, center, space-between, 0.75rem);
  min-height: 3.5rem;
  padding: 0.5rem 0.75rem 0.5rem 1rem;
  background: rgba($paper, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $line;

  @include from('lg') {
    padding-inline: 2rem 1.25rem;
  }

  &__brand {
    @include from('lg') {
      display: none;
    }
  }

  &__title {
    display: none;
    font-size: 0.9rem;
    font-weight: 600;
    color: $ink-soft;

    @include from('lg') {
      display: block;
    }
  }

  &__user {
    @include flex(row, center, flex-end, 0.25rem);
    min-width: 0;
  }

  &__account {
    @include flex(row, center, flex-start, 0.55rem);
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: $radius-pill;
    @include transition(background-color);

    &:hover {
      background: $sand;
    }
  }

  &__avatar {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: $accent-soft;
    color: $accent-deep;
    font-size: 0.72rem;
    font-weight: 700;
  }

  &__name {
    display: none;
    font-size: 0.85rem;
    font-weight: 500;
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
  }
}
</style>
