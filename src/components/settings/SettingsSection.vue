<script setup lang="ts">
import InfoTip from '@/components/ui/InfoTip.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { inventoryCopy } from '@/config/inventoryCopy'

// Marco común de cada pestaña: barra con "Agregar", lista y estados vacío/cargando.
defineProps<{ loading: boolean; empty: boolean; addLabel?: string; help?: string }>()
const emit = defineEmits<{ add: [] }>()
</script>

<template>
  <section class="section">
    <div v-if="addLabel || help || $slots.tools" class="section__bar">
      <slot name="tools" />
      <InfoTip v-if="help" :text="help" />
      <button v-if="addLabel" class="btn btn--primary btn--sm section__add" @click="emit('add')">
        <i class="fa-solid fa-plus" aria-hidden="true"></i> {{ addLabel }}
      </button>
    </div>
    <LoadingBlock v-if="loading && empty" :lines="5" />
    <EmptyState v-else-if="empty" icon="fa-solid fa-inbox" :title="inventoryCopy.settings.empty" />
    <ul v-else class="section__list">
      <slot />
    </ul>
  </section>
</template>

<style scoped lang="scss">
.section {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__bar {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__add {
    margin-left: auto;
  }

  &__list {
    list-style: none;
    @include card;
  }
}
</style>
