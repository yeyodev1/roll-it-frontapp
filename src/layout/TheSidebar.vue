<script setup lang="ts">
import BrandMark from '@/components/ui/BrandMark.vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useNav } from '@/composables/useNav'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{ logout: [] }>()

const { items } = useNav()
const userStore = useUserStore()
const copy = dashboardCopy.layout
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="sidebar__brand">
      <BrandMark inverse :size="30" />
    </RouterLink>

    <nav class="sidebar__nav" :aria-label="copy.mainNav">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="sidebar__link">
        <i :class="item.icon" aria-hidden="true"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__foot">
      <RouterLink to="/cuenta" class="sidebar__link sidebar__link--user">
        <i class="fa-solid fa-circle-user" aria-hidden="true"></i>
        <span>{{ userStore.user?.name || copy.account }}</span>
      </RouterLink>
      <button type="button" class="sidebar__link" @click="emit('logout')">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
        <span>{{ copy.logout }}</span>
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
  @include flex(column, stretch, flex-start, 1.5rem);
  padding: 1.4rem 0.85rem 1rem;
  background: $ink;
  color: rgba($paper, 0.72);

  &__brand {
    padding: 0.2rem 0.65rem 0.6rem;
  }

  &__nav {
    @include flex(column, stretch, flex-start, 0.15rem);
    flex: 1;
    overflow-y: auto;
  }

  &__link {
    position: relative;
    @include flex(row, center, flex-start, 0.8rem);
    width: 100%;
    min-height: 2.75rem;
    padding: 0.55rem 0.75rem;
    border-radius: $radius-sm;
    font-size: 0.9rem;
    font-weight: 500;
    color: inherit;
    text-align: left;
    @include transition(background-color);

    i {
      width: 1.1rem;
      text-align: center;
      font-size: 0.95rem;
      color: rgba($paper, 0.5);
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      background: rgba($paper, 0.06);
      color: $paper;
    }

    &.router-link-active {
      background: rgba($paper, 0.09);
      color: $paper;

      i {
        color: $accent;
      }

      // Marca de la sección activa: una barra corta del color de marca.
      &::before {
        content: '';
        position: absolute;
        left: -0.85rem;
        top: 25%;
        bottom: 25%;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: $accent;
      }
    }
  }

  &__foot {
    @include flex(column, stretch, flex-start, 0.15rem);
    padding-top: 0.75rem;
    border-top: 1px solid rgba($paper, 0.08);
  }
}
</style>
