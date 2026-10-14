<script setup lang="ts">
import InfoTip from './InfoTip.vue'

/**
 * Tarjeta contenedora de un gráfico o tabla: título con (i) a la izquierda,
 * acción a la derecha (slot `action`: un total, un selector, un enlace) y
 * un pie opcional (slot `footer`). `flush` quita el padding del cuerpo
 * para tablas que llegan hasta el borde.
 */
defineProps<{ title: string; help?: string; subtitle?: string; flush?: boolean }>()
</script>

<template>
  <section class="ccard" :class="{ 'ccard--flush': flush }">
    <header class="ccard__head">
      <div class="ccard__titles">
        <h2 class="ccard__title">
          {{ title }}
          <InfoTip v-if="help" :text="help" />
        </h2>
        <p v-if="subtitle" class="ccard__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.action" class="ccard__action"><slot name="action" /></div>
    </header>
    <div class="ccard__body"><slot /></div>
    <footer v-if="$slots.footer" class="ccard__foot"><slot name="footer" /></footer>
  </section>
</template>

<style scoped lang="scss">
.ccard {
  @include card;
  @include flex(column, stretch, flex-start, $sp-4);
  min-width: 0;
  padding: $sp-4;

  @include from('md') {
    padding: $sp-5 $sp-6 $sp-6;
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.75rem);
    flex-wrap: wrap;
  }

  &__titles {
    min-width: 0;
  }

  &__title {
    @include flex(row, center, flex-start, 0.4rem);
    font-family: $font-principal;
    font-size: 0.98rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: $ink;
  }

  &__subtitle {
    margin-top: 0.15rem;
    font-size: 0.75rem;
    color: $ink-muted;
  }

  &__action {
    @include flex(row, center, flex-end, 0.5rem);
    margin-left: auto;
    font-size: 0.8rem;
  }

  &__body {
    min-width: 0;
  }

  &__foot {
    margin-top: auto;
    padding-top: $sp-3;
    border-top: 1px solid $line-soft;
    font-size: 0.8rem;
  }

  &--flush {
    padding-bottom: 0;

    .ccard__body {
      margin-inline: -$sp-4;

      @include from('md') {
        margin-inline: -$sp-6;
      }
    }
  }
}
</style>
