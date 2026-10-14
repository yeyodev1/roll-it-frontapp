<script setup lang="ts">
import { site } from '@/config/site'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { InvoiceCounts } from '@/composables/useInvoiceList'
import type { InvoiceStatus } from '@/types'

// Una tarjeta por estado de factura; tocarla filtra la lista (otra vez, quita el filtro).
defineProps<{ counts: InvoiceCounts; active: InvoiceStatus | '' }>()
const emit = defineEmits<{ toggle: [status: InvoiceStatus] }>()

const copy = inventoryCopy.invoices
const ICON: Record<InvoiceStatus, string> = {
  review: 'fa-solid fa-hourglass-half',
  confirmed: 'fa-solid fa-circle-check',
  rejected: 'fa-solid fa-ban',
}
const order: InvoiceStatus[] = ['review', 'confirmed', 'rejected']
</script>

<template>
  <div class="icount" role="group" :aria-label="copy.byStatus">
    <button
      v-for="key in order"
      :key="key"
      type="button"
      class="icount__card"
      :class="[`icount__card--${key}`, { 'is-on': active === key }]"
      :aria-pressed="active === key"
      @click="emit('toggle', key)"
    >
      <span class="icount__head">
        <span class="icount__label">{{ site.invoiceStatus[key] }}</span>
        <span class="icount__icon" aria-hidden="true"><i :class="ICON[key]"></i></span>
      </span>
      <span class="icount__num num">{{ counts[key] }}</span>
      <span class="icount__sub">{{ copy.statusSub[key] }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.icount {
  @include flex-cards(90px, $sp-2);

  @include from('md') {
    gap: $sp-4;
  }

  &__card {
    --tone: #{$ink-muted};
    --tone-bg: #{$sand};
    @include card;
    @include flex(column, stretch, flex-start, 0.3rem);
    padding: $sp-4;
    text-align: left;
    @include transition;
    @include focus-ring;

    @include until('md') {
      padding: $sp-3;
    }

    @include from('md') {
      padding: $sp-5;
    }

    &--review {
      --tone: #{darken($warning, 14%)};
      --tone-bg: #{$warning-bg};
    }

    &--confirmed {
      --tone: #{darken($success, 8%)};
      --tone-bg: #{$success-bg};
    }

    &--rejected {
      --tone: #{$danger};
      --tone-bg: #{$danger-bg};
    }

    &:hover {
      box-shadow: $shadow-hover;
    }

    &.is-on {
      border-color: var(--tone);
      box-shadow:
        0 0 0 1px var(--tone),
        $shadow-hover;
    }
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.5rem);
  }

  &__label {
    @include card-label;
    padding-top: 0.2rem;
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    border-radius: $radius-ctl;
    background: var(--tone-bg);
    color: var(--tone);
    font-size: 0.8rem;

    @include until('md') {
      display: none;
    }
  }

  &__num {
    @include figure(clamp(1.75rem, 1.4rem + 1.2vw, 2.4rem));
    color: var(--tone);
  }

  &__sub {
    margin-top: auto;
    padding-top: $sp-2;
    border-top: 1px solid $line-soft;
    font-size: 0.72rem;
    color: $ink-muted;

    @include until('md') {
      display: none;
    }
  }
}
</style>
