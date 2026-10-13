<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'

const props = defineProps<{ status: 'out' | 'low' | 'ok' | 'over' }>()

const meta = computed(() => site.stockStatus[props.status])
</script>

<template>
  <span class="badge" :class="`badge--${status}`">
    <i :class="meta.icon" aria-hidden="true"></i>
    {{ meta.label }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: $radius-pill;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;

  i {
    font-size: 0.7rem;
  }

  &--out {
    color: darken($danger, 6%);
    background: $danger-bg;
  }

  &--low {
    color: darken($warning, 18%);
    background: $warning-bg;
  }

  &--ok {
    color: darken($success, 12%);
    background: $success-bg;
  }

  &--over {
    color: darken($info, 10%);
    background: $info-bg;
  }
}
</style>
