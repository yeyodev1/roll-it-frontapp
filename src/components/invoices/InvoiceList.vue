<script setup lang="ts">
import { site } from '@/config/site'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatCents, formatDate } from '@/utils/format'
import type { Invoice } from '@/types'

defineProps<{ items: Invoice[]; showBranch: boolean }>()
</script>

<template>
  <ul class="invoices">
    <li v-for="inv in items" :key="inv._id">
      <RouterLink class="invoice" :to="{ name: 'InvoiceDetail', params: { id: inv._id } }">
        <img v-if="inv.imageUrl" :src="inv.imageUrl" alt="" class="invoice__thumb" loading="lazy" />
        <span v-else class="invoice__thumb invoice__thumb--empty"
          ><i class="fa-solid fa-receipt"></i
        ></span>
        <span class="invoice__main">
          <strong>{{ inv.supplier || inventoryCopy.invoices.noSupplier }}</strong>
          <small class="muted">
            {{ formatDate(inv.date || inv.createdAt) }}
            <template v-if="showBranch"> · {{ inv.branch.name }}</template>
          </small>
        </span>
        <span class="invoice__side">
          <span class="invoice__total num">{{ formatCents(inv.totalCents) }}</span>
          <span class="invoice__status" :class="`invoice__status--${inv.status}`">
            {{ site.invoiceStatus[inv.status] }}
          </span>
        </span>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.invoices {
  list-style: none;
  @include flex-cards(320px, 0.6rem);
}

.invoice {
  @include card;
  @include flex(row, center, flex-start, 0.85rem);
  padding: 0.7rem 0.9rem 0.7rem 0.7rem;
  @include transition;

  &:hover {
    box-shadow: $shadow-sm;
    border-color: $ink-muted;
  }

  &__thumb {
    flex: 0 0 auto;
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 8px;
    object-fit: cover;
    background: $sand;

    &--empty {
      @include flex(row, center, center);
      color: $ink-muted;
    }
  }

  &__main {
    @include flex(column, flex-start, center, 0.1rem);
    flex: 1;
    min-width: 0;

    strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    small {
      font-size: $text-xs;
    }
  }

  &__side {
    @include flex(column, flex-end, center, 0.25rem);
  }

  &__total {
    font-weight: 700;
  }

  &__status {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 0.15rem 0.55rem;
    border-radius: $radius-pill;

    &--review {
      color: darken($warning, 18%);
      background: $warning-bg;
    }

    &--confirmed {
      color: darken($success, 12%);
      background: $success-bg;
    }

    &--rejected {
      color: $ink-muted;
      background: $sand;
    }
  }
}
</style>
