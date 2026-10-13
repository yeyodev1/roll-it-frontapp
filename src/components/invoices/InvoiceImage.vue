<script setup lang="ts">
import { ref } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { inventoryCopy } from '@/config/inventoryCopy'

defineProps<{ src: string }>()

const zoomed = ref(false)
useBodyScroll(zoomed)
</script>

<template>
  <figure class="photo">
    <button
      type="button"
      class="photo__button"
      :aria-label="inventoryCopy.invoice.zoomHint"
      @click="zoomed = true"
    >
      <img :src="src" alt="" />
      <span class="photo__hint"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
    </button>
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="zoomed" class="zoom" role="dialog" aria-modal="true" @click="zoomed = false">
          <img :src="src" alt="" />
          <button class="zoom__close" type="button" aria-label="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </Transition>
    </Teleport>
  </figure>
</template>

<style scoped lang="scss">
.photo {
  &__button {
    position: relative;
    display: block;
    width: 100%;
    border-radius: $radius-md;
    overflow: hidden;
    background: $sand;
    border: 1px solid $line;

    img {
      width: 100%;
      max-height: 26rem;
      object-fit: contain;

      @include from('lg') {
        max-height: 70vh;
      }
    }
  }

  &__hint {
    position: absolute;
    right: 0.6rem;
    bottom: 0.6rem;
    @include flex(row, center, center);
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    background: rgba($ink, 0.75);
    color: $surface;
  }
}

// A pantalla completa y con scroll: en el celular se puede pellizcar para leer.
.zoom {
  position: fixed;
  inset: 0;
  z-index: 210;
  background: rgba($ink, 0.96);
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  img {
    width: 100%;
    max-width: none;
    min-height: 100%;
    object-fit: contain;

    @include from('lg') {
      width: auto;
      margin-inline: auto;
    }
  }

  &__close {
    position: fixed;
    top: 0.8rem;
    right: 0.8rem;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: $surface;
    color: $ink;
  }
}
</style>
