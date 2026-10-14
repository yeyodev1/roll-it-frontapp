<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { inventoryCopy } from '@/config/inventoryCopy'

/**
 * Barra fija de la factura en revisión: rechazar, guardar y confirmar. Confirmar
 * y rechazar piden un sí antes: mueven stock o descartan la factura.
 */
defineProps<{ branch: string; summary: string[]; unlinked: number; busy: boolean }>()
const emit = defineEmits<{ save: []; confirm: []; reject: [] }>()

const copy = inventoryCopy.invoice
const confirming = ref(false)
const rejecting = ref(false)

function doConfirm() {
  confirming.value = false
  emit('confirm')
}

function doReject() {
  rejecting.value = false
  emit('reject')
}
</script>

<template>
  <div class="actions">
    <button class="btn btn--ghost" :disabled="busy" @click="rejecting = true">
      <i class="fa-solid fa-ban" aria-hidden="true"></i> {{ copy.reject }}
    </button>
    <button class="btn btn--ghost" :disabled="busy" @click="emit('save')">
      <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> {{ copy.save }}
    </button>
    <button
      class="btn btn--primary actions__main"
      :disabled="busy || !summary.length"
      @click="confirming = true"
    >
      <i class="fa-solid fa-check" aria-hidden="true"></i> {{ copy.confirm }}
    </button>
  </div>

  <BaseModal
    :open="confirming"
    :title="copy.confirmTitle"
    :message="copy.confirmMessage(branch)"
    :confirm-label="copy.confirm"
    @confirm="doConfirm"
    @cancel="confirming = false"
  >
    <ul class="summary">
      <li v-for="text in summary" :key="text" class="num">{{ text }}</li>
    </ul>
    <p v-if="unlinked" class="warn">{{ copy.unlinked(unlinked) }}</p>
  </BaseModal>

  <BaseModal
    :open="rejecting"
    :title="copy.rejectTitle"
    :message="copy.rejectMessage"
    :confirm-label="copy.reject"
    danger
    @confirm="doReject"
    @cancel="rejecting = false"
  />
</template>

<style scoped lang="scss">
.actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  @include flex(row, center, flex-end, 0.5rem);
  padding: 0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom));
  background: rgba($surface, 0.94);
  backdrop-filter: blur(8px);
  border-top: 1px solid $line;

  // En escritorio no tapa la barra lateral.
  @include from('lg') {
    left: 15rem;
    padding-inline: $sp-8;
  }

  .btn {
    padding-inline: 1rem;
  }

  &__main {
    flex: 1 1 auto;

    @include from('md') {
      flex: 0 0 auto;
    }
  }
}

.summary {
  list-style: none;
  width: 100%;
  text-align: left;
  font-weight: 600;
  font-size: $text-sm;
  max-height: 14rem;
  overflow-y: auto;
  padding: 0.6rem 0.8rem;
  border-radius: $radius-sm;
  background: $success-bg;
  color: darken($success, 18%);

  li + li {
    margin-top: 0.2rem;
  }
}

.warn {
  padding: 0.6rem 0.8rem;
  border-radius: $radius-sm;
  background: $warning-bg;
  color: darken($warning, 20%);
  font-size: $text-sm;
  font-weight: 600;
}
</style>
