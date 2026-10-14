<script setup lang="ts">
import { site } from '@/config/site'

// Forma de la pantalla de revisión: foto a la izquierda, campos y productos a la derecha.
</script>

<template>
  <div class="sk-detail" role="status" aria-busy="true">
    <span class="sk sk-detail__photo" aria-hidden="true"></span>
    <div class="sk-detail__form" aria-hidden="true">
      <div class="sk-detail__fields">
        <span v-for="n in 3" :key="n" class="sk-detail__field">
          <span class="sk sk--line sk-detail__label"></span>
          <span class="sk sk-detail__input"></span>
        </span>
      </div>
      <span class="sk sk--line sk-detail__label"></span>
      <span v-for="n in 3" :key="`l${n}`" class="sk sk-detail__line"></span>
      <span class="sk sk-detail__total"></span>
    </div>
    <span class="visually-hidden">{{ site.ui.loading }}</span>
  </div>
</template>

<style scoped lang="scss">
.sk-detail {
  @include flex(column, stretch, flex-start, 1.25rem);

  @include from('lg') {
    flex-direction: row;
    align-items: flex-start;
  }

  &__photo {
    height: 16rem;
    border-radius: 14px;

    @include from('lg') {
      flex: 0 0 38%;
      height: 28rem;
    }
  }

  &__form {
    @include flex(column, stretch, flex-start, 0.8rem);
    flex: 1;
    min-width: 0;
  }

  &__fields {
    @include flex-cards(150px, 0.6rem);

    > :first-child {
      flex-basis: 100%;
    }
  }

  &__field {
    @include flex(column, stretch, flex-start, 0.4rem);
  }

  &__label {
    width: 5rem;
    height: 0.65rem;
  }

  &__input {
    height: 2.9rem;
  }

  &__line {
    height: 5.5rem;
    border-radius: 14px;
  }

  &__total {
    height: 2.4rem;
    margin-top: 0.4rem;
  }
}
</style>
