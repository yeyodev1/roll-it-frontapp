<script setup lang="ts">
// Buscador chico en pastilla, para la cabecera de una tarjeta (insumos, platos, conteo).
defineProps<{ placeholder: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <label class="search">
    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
    <span class="visually-hidden">{{ placeholder }}</span>
    <input v-model="model" type="search" :placeholder="placeholder" />
  </label>
</template>

<style scoped lang="scss">
.search {
  position: relative;
  display: block;
  margin: 0;
  width: min(16rem, 100%);

  i {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    font-size: 0.8rem;
  }

  input {
    padding: 0.5rem 0.9rem 0.5rem 2.2rem;
    border-radius: $radius-pill;
    background: $canvas;
    border-color: transparent;
    font-size: 0.84rem;

    &:focus {
      background: $surface;
    }
  }
}
</style>
