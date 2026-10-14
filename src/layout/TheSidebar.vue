<script setup lang="ts">
import BrandMark from '@/components/ui/BrandMark.vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useNav } from '@/composables/useNav'
import { useAccount } from '@/composables/useAccount'

const emit = defineEmits<{ logout: [] }>()

const { items } = useNav()
const { initials, name, role } = useAccount()
const copy = dashboardCopy.layout
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="sidebar__brand">
      <BrandMark :size="32" />
    </RouterLink>

    <nav class="sidebar__nav" :aria-label="copy.mainNav">
      <p class="sidebar__group">{{ copy.menu }}</p>
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="sidebar__link">
        <i :class="item.icon" aria-hidden="true"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__foot">
      <RouterLink to="/cuenta" class="sidebar__user">
        <span class="sidebar__avatar" aria-hidden="true">{{ initials }}</span>
        <span class="sidebar__who">
          <strong>{{ name }}</strong>
          <small v-if="role">{{ role }}</small>
        </span>
      </RouterLink>
      <button
        type="button"
        class="sidebar__logout"
        :aria-label="copy.logout"
        :title="copy.logout"
        @click="emit('logout')"
      >
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 15rem;
  z-index: 80;
  @include flex(column, stretch, flex-start, $sp-6);
  padding: $sp-6 $sp-4 $sp-4;
  background: $surface;
  border-right: 1px solid $line-soft;

  &__brand {
    padding: 0 $sp-2;
  }

  &__nav {
    @include flex(column, stretch, flex-start, 0.2rem);
    flex: 1;
    overflow-y: auto;
  }

  &__group {
    padding: 0 $sp-3 $sp-2;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  &__link {
    position: relative;
    @include flex(row, center, flex-start, $sp-3);
    min-height: 2.75rem;
    padding: 0.55rem $sp-3;
    border-radius: $radius-ctl;
    font-size: 0.88rem;
    font-weight: 500;
    color: $ink-soft;
    @include transition(background-color);

    i {
      width: 1.1rem;
      text-align: center;
      font-size: 0.92rem;
      color: $ink-muted;
      @include transition(color);
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      background: $canvas;
      color: $ink;
    }

    &.router-link-active {
      background: $accent-soft;
      color: $accent-deep;
      font-weight: 600;

      i {
        color: $accent;
      }
    }
  }

  &__foot {
    @include flex(row, center, space-between, $sp-2);
    padding: $sp-2;
    border-radius: $radius-md;
    background: $canvas;
  }

  &__user {
    @include flex(row, center, flex-start, 0.6rem);
    flex: 1;
    min-width: 0;
    padding: 0.25rem;
    border-radius: $radius-ctl;
  }

  &__avatar {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: $ink;
    color: $surface;
    font-size: 0.72rem;
    font-weight: 700;
  }

  &__who {
    @include flex(column, flex-start, center);
    min-width: 0;
    line-height: 1.25;

    strong,
    small {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      font-size: 0.82rem;
      font-weight: 600;
      color: $ink;
    }

    small {
      font-size: 0.7rem;
      color: $ink-muted;
    }
  }

  &__logout {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: $radius-ctl;
    color: $ink-muted;
    @include transition(color);

    &:hover {
      color: $danger;
      background: $surface;
    }
  }
}
</style>
