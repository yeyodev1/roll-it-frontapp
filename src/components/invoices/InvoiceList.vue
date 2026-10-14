<script setup lang="ts">
import AppBadge, { type BadgeTone } from '@/components/ui/AppBadge.vue'
import { site } from '@/config/site'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatCents, formatDate } from '@/utils/format'
import type { Invoice, InvoiceStatus } from '@/types'

/**
 * Facturas como filas de tabla (cada una lleva a su revisión): foto, proveedor
 * con número y fecha, sucursal, productos, total y estado.
 */
defineProps<{ items: Invoice[]; showBranch: boolean }>()

const copy = inventoryCopy.invoices
const TONE: Record<InvoiceStatus, BadgeTone> = {
  review: 'warning',
  confirmed: 'success',
  rejected: 'danger',
}
</script>

<template>
  <div class="ilist">
    <div class="ilist__head" aria-hidden="true">
      <span class="ilist__c-main">{{ copy.cols.supplier }}</span>
      <span v-if="showBranch" class="ilist__c-branch">{{ copy.cols.branch }}</span>
      <span class="ilist__c-lines">{{ copy.cols.lines }}</span>
      <span class="ilist__c-total">{{ copy.cols.total }}</span>
      <span class="ilist__c-status">{{ copy.cols.status }}</span>
      <span class="ilist__go ilist__go--space"></span>
    </div>
    <ul>
      <li v-for="inv in items" :key="inv._id">
        <RouterLink class="ilist__row" :to="{ name: 'InvoiceDetail', params: { id: inv._id } }">
          <span class="ilist__c-main">
            <img
              v-if="inv.imageUrl"
              :src="inv.imageUrl"
              alt=""
              class="ilist__thumb"
              loading="lazy"
            />
            <span v-else class="ilist__thumb ilist__thumb--empty" aria-hidden="true"
              ><i
                :class="
                  inv.source === 'closing' ? 'fa-solid fa-cash-register' : 'fa-solid fa-receipt'
                "
              ></i
            ></span>
            <span class="ilist__who">
              <strong>{{ inv.supplier || copy.noSupplier }}</strong>
              <small class="num">
                {{ formatDate(inv.date || inv.createdAt) }}
                <template v-if="inv.invoiceNumber"> · #{{ inv.invoiceNumber }}</template>
                <template v-else-if="inv.source === 'closing'"> · {{ copy.closingTag }}</template>
                <span v-if="showBranch" class="ilist__mbranch"> · {{ inv.branch.name }}</span>
              </small>
              <AppBadge class="ilist__mstatus" :tone="TONE[inv.status]" dot>{{
                site.invoiceStatus[inv.status]
              }}</AppBadge>
            </span>
          </span>
          <span v-if="showBranch" class="ilist__c-branch">{{ inv.branch.name }}</span>
          <span class="ilist__c-lines num">{{ inv.lines.length }}</span>
          <span class="ilist__c-total num">{{ formatCents(inv.totalCents) }}</span>
          <span class="ilist__c-status">
            <AppBadge :tone="TONE[inv.status]" dot>{{ site.invoiceStatus[inv.status] }}</AppBadge>
          </span>
          <i class="fa-solid fa-chevron-right ilist__go" aria-hidden="true"></i>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.ilist {
  ul {
    list-style: none;
  }

  &__head,
  &__row {
    @include flex(row, center, flex-start, $sp-3);
    padding-inline: $sp-4;

    @include from('md') {
      gap: $sp-4;
      padding-inline: $sp-6;
    }
  }

  &__head {
    padding-block: 0.6rem;
    background: rgba($canvas, 0.7);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: $ink-muted;

    @include until('md') {
      display: none;
    }
  }

  &__row {
    padding-block: 0.75rem;
    border-top: 1px solid $line-soft;
    font-size: 0.84rem;
    @include transition(background-color);

    &:hover {
      background: rgba($canvas, 0.6);

      .ilist__go {
        transform: translateX(2px);
        color: $ink;
      }
    }
  }

  &__c-main {
    @include flex(row, center, flex-start, 0.75rem);
    flex: 1 1 0;
    min-width: 0;
  }

  // En el celular la fila es foto + proveedor + total; el resto ya va debajo del nombre.
  &__c-branch,
  &__c-lines {
    flex: 0 0 6.5rem;
    color: $ink-soft;

    @include until('md') {
      display: none;
    }
  }

  &__c-lines {
    flex-basis: 5rem;
    text-align: right;
  }

  &__c-total {
    flex: 0 0 auto;
    min-width: 6rem;
    text-align: right;
    font-weight: 700;

    @include until('md') {
      min-width: 0;
    }
  }

  &__c-status {
    flex: 0 0 8rem;

    @include until('md') {
      display: none;
    }
  }

  &__head &__c-main {
    padding-left: calc(2.75rem + 0.75rem);
  }

  &__thumb {
    flex: 0 0 auto;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: $radius-ctl;
    object-fit: cover;
    background: $sand;

    &--empty {
      @include flex(row, center, center);
      color: $ink-muted;
    }
  }

  &__who {
    @include flex(column, flex-start, center);
    min-width: 0;
    line-height: 1.3;

    strong {
      max-width: 100%;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      font-size: 0.72rem;
      color: $ink-muted;
    }
  }

  &__mbranch {
    @include from('md') {
      display: none;
    }
  }

  &__go--space {
    width: 0.7rem;
  }

  &__mstatus {
    margin-top: 0.3rem;

    @include from('md') {
      display: none;
    }
  }

  &__go {
    flex: 0 0 auto;
    font-size: 0.7rem;
    color: $ink-muted;
    @include transition(transform);
  }
}
</style>
