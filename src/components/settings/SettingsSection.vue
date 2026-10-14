<script setup lang="ts">
import InfoTip from '@/components/ui/InfoTip.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import SkeletonList from '@/components/ui/skeleton/SkeletonList.vue'
import { inventoryCopy } from '@/config/inventoryCopy'

// Marco común de cada pestaña: barra con "Agregar", lista y estados vacío/cargando.
defineProps<{
  loading: boolean
  empty: boolean
  error?: string
  addLabel?: string
  help?: string
}>()
const emit = defineEmits<{ add: []; retry: [] }>()
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
    <SkeletonList v-if="loading" :rows="6" />
    <LoadError v-else-if="error && empty" :message="error" @retry="emit('retry')" />
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

    // Buscador de las pestañas: pastilla gris como en el resto del panel.
    :deep(.search) {
      flex: 1 1 14rem;
      max-width: 22rem;
      padding: 0.55rem 1rem;
      border-radius: $radius-pill;
      border-color: rgba($line, 0.6);
      font-size: 0.86rem;
      box-shadow: $shadow-sm;
    }
  }

  &__add {
    margin-left: auto;
  }

  &__list {
    list-style: none;
    @include card;
    overflow: hidden;
  }
}
</style>
