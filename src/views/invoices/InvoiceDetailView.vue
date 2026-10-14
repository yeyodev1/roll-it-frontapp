<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import AppBadge, { type BadgeTone } from '@/components/ui/AppBadge.vue'
import LoadError from '@/components/ui/LoadError.vue'
import InvoiceDetailSkeleton from '@/components/invoices/InvoiceDetailSkeleton.vue'
import AppDatePicker from '@/components/ui/AppDatePicker.vue'
import InvoiceImage from '@/components/invoices/InvoiceImage.vue'
import InvoiceLines from '@/components/invoices/InvoiceLines.vue'
import InvoiceActions from '@/components/invoices/InvoiceActions.vue'
import { useInvoiceEditor } from '@/composables/useInvoiceEditor'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import { formatCents } from '@/utils/format'
import { ecuadorDay } from '@/stores/filters'

const copy = inventoryCopy.invoice
const route = useRoute()
const editor = useInvoiceEditor()
const { invoice, loading, error, busy, form, lines, editable, unlinked, totalCents, summary } =
  editor

// Una factura no puede ser de mañana.
const today = ecuadorDay()
const TONE: Record<string, BadgeTone> = {
  review: 'warning',
  confirmed: 'success',
  rejected: 'danger',
}

const load = () => editor.load(String(route.params.id))
onMounted(load)
</script>

<template>
  <div class="page detail">
    <PageHeader :title="copy.title" :subtitle="invoice?.branch.name">
      <template #actions>
        <AppBadge v-if="invoice" :tone="TONE[invoice.status]" dot>
          {{ site.invoiceStatus[invoice.status] }}
        </AppBadge>
        <RouterLink class="btn btn--ghost btn--sm" :to="{ name: 'Invoices' }">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {{ inventoryCopy.invoices.title }}
        </RouterLink>
      </template>
    </PageHeader>

    <LoadError v-if="error && !invoice" :message="error" @retry="load" />
    <InvoiceDetailSkeleton v-else-if="loading || !invoice" />
    <div v-else class="detail__body">
      <aside class="detail__photo">
        <InvoiceImage v-if="invoice.imageUrl" :src="invoice.imageUrl" />
        <div v-else-if="invoice.source === 'closing'" class="nophoto">
          <i class="fa-solid fa-cash-register" aria-hidden="true"></i>
          <span>{{ copy.closingPhoto }}</span>
          <small>{{ copy.closingHint }}</small>
        </div>
        <div v-else class="nophoto">
          <i class="fa-solid fa-receipt" aria-hidden="true"></i>
          <span>{{ copy.noPhoto }}</span>
        </div>
        <p v-if="invoice.note" class="inv-note">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i> {{ invoice.note }}
        </p>
        <p v-if="invoice.aiError" class="ai-error">
          <i class="fa-solid fa-robot" aria-hidden="true"></i>
          {{ copy.aiError }} · <span>{{ invoice.aiError }}</span>
        </p>
      </aside>

      <section class="detail__form">
        <p v-if="!editable" class="locked">
          <i class="fa-solid fa-lock" aria-hidden="true"></i> {{ copy.readOnly }}
        </p>

        <ChartCard :title="copy.data">
          <div class="head-fields">
            <div class="field head-fields__supplier">
              <label for="inv-supplier">{{ copy.supplier }}</label>
              <input id="inv-supplier" v-model="form.supplier" type="text" :disabled="!editable" />
            </div>
            <div class="field">
              <label for="inv-number">{{ copy.number }}</label>
              <input
                id="inv-number"
                v-model="form.invoiceNumber"
                type="text"
                :disabled="!editable"
              />
            </div>
            <div class="field">
              <label for="inv-date">{{ copy.date }}</label>
              <AppDatePicker
                id="inv-date"
                v-model="form.date"
                :label="copy.date"
                :max="today"
                :disabled="!editable"
              />
            </div>
          </div>
        </ChartCard>

        <ChartCard :title="copy.lines" :subtitle="copy.linesCount(lines.length)">
          <p v-if="unlinked && editable" class="warn">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            {{ copy.unlinked(unlinked) }}
          </p>
          <InvoiceLines
            :lines="lines"
            :editable="editable"
            @add="editor.addLine"
            @remove="editor.removeLine"
          />
          <template #footer>
            <div class="total">
              <span>{{ copy.total }}</span>
              <strong class="num">{{ formatCents(totalCents) }}</strong>
            </div>
          </template>
        </ChartCard>
      </section>
    </div>

    <InvoiceActions
      v-if="invoice && editable"
      :branch="invoice.branch.name"
      :summary="summary"
      :unlinked="unlinked"
      :busy="busy"
      @save="editor.save"
      @confirm="editor.confirm"
      @reject="editor.reject"
    />
  </div>
</template>

<style scoped lang="scss">
.detail {
  padding-bottom: 7rem;

  &__body {
    @include flex(column, stretch, flex-start, $sp-4);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__photo {
    @include flex(column, stretch, flex-start, 0.6rem);

    @include from('lg') {
      flex: 0 0 36%;
      position: sticky;
      top: 5rem;
    }
  }

  &__form {
    @include flex(column, stretch, flex-start, $sp-4);
    flex: 1;
    min-width: 0;
  }
}

.nophoto {
  @include card;
  @include flex(column, center, center, 0.5rem);
  min-height: 7rem;
  color: $ink-muted;

  @include from('lg') {
    min-height: 14rem;
  }
  font-size: 0.82rem;

  padding: $sp-4;
  text-align: center;

  i {
    font-size: 1.8rem;
    color: $line;
  }

  small {
    max-width: 32ch;
    font-size: $text-xs;
  }
}

.inv-note {
  @include flex(row, flex-start, flex-start, 0.45rem);
  margin-top: 0.6rem;
  font-size: $text-xs;
  line-height: 1.45;
  color: $ink-soft;

  i {
    margin-top: 0.15rem;
    color: $ink-muted;
  }
}

.head-fields {
  @include flex-cards(150px, 0.6rem);

  &__supplier {
    flex-basis: 100%;
  }
}

.ai-error {
  font-size: $text-xs;
  color: $ink-muted;

  span {
    color: $ink-soft;
  }
}

.locked,
.warn {
  @include flex(row, center, flex-start, 0.45rem);
  font-size: $text-sm;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  border-radius: $radius-sm;
}

.locked {
  background: $sand;
  color: $ink-soft;
}

.warn {
  background: $warning-bg;
  color: darken($warning, 20%);
}

.total {
  @include flex(row, baseline, space-between, 1rem);

  span {
    @include card-label;
    font-weight: 600;
  }

  strong {
    @include figure(1.5rem);
  }
}
</style>
