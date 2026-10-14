<script setup lang="ts">
import { dashboardCopy } from '@/config/dashboardCopy'
import { useSalesUploadModal } from '@/composables/useSalesUploadModal'

/**
 * Acceso directo del dueño para subir el reporte de SmartMenu desde la barra
 * de filtros: abre el modal (SalesUploadModal). `tone` lo pinta según la pastilla a la que acompaña.
 */
withDefaults(defineProps<{ tone?: 'warning' | 'success' }>(), { tone: 'warning' })

const copy = dashboardCopy.salesUpload
const { show } = useSalesUploadModal()
</script>

<template>
  <button type="button" class="sact" :class="`sact--${tone}`" @click="show">
    <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
    <span class="sact__long">{{ copy.action }}</span>
    <span class="sact__short">{{ copy.actionShort }}</span>
  </button>
</template>

<style scoped lang="scss">
.sact {
  @include flex(row, center, center, 0.4rem);
  min-height: 2rem;
  padding: 0 0.85rem;
  border-radius: $radius-pill;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
  @include transition;
  @include focus-ring;

  margin-left: auto;

  // En el celular la pastilla de la fecha y el botón comparten fila: va la versión corta.
  &__long {
    @include until('sm') {
      display: none;
    }
  }

  &__short {
    @include from('sm') {
      display: none;
    }
  }

  &--warning {
    background: darken($warning, 22%);
    color: $surface;

    &:hover {
      background: $ink;
    }
  }

  &--success {
    background: $surface;
    border: 1px solid rgba($line, 0.8);
    color: $ink;
    box-shadow: $shadow-sm;

    &:hover {
      border-color: $ink;
    }
  }
}
</style>
