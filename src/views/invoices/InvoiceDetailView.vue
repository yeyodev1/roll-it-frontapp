<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import InvoiceImage from '@/components/invoices/InvoiceImage.vue'
import InvoiceLines from '@/components/invoices/InvoiceLines.vue'
import { useInvoiceEditor } from '@/composables/useInvoiceEditor'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import { formatCents } from '@/utils/format'

const copy = inventoryCopy.invoice
const route = useRoute()
const editor = useInvoiceEditor()
const { invoice, loading, busy, form, lines, editable, unlinked, totalCents, summary } = editor

const confirming = ref(false)
const rejecting = ref(false)

async function doConfirm() {
  confirming.value = false
  await editor.confirm()
}

async function doReject() {
  rejecting.value = false
  await editor.reject()
}

onMounted(() => editor.load(String(route.params.id)))
</script>

<template>
  <div class="page detail">
    <PageHeader
      :title="copy.title"
      :subtitle="
        invoice ? `${invoice.branch.name} · ${site.invoiceStatus[invoice.status]}` : undefined
      "
    >
      <template #actions>
        <RouterLink class="btn btn--ghost btn--sm" :to="{ name: 'Invoices' }">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {{ inventoryCopy.invoices.title }}
        </RouterLink>
      </template>
    </PageHeader>

    <LoadingBlock v-if="loading || !invoice" height="20rem" />
    <div v-else class="detail__body">
      <aside class="detail__photo">
        <InvoiceImage v-if="invoice.imageUrl" :src="invoice.imageUrl" />
        <p v-if="invoice.aiError" class="ai-error">
          <i class="fa-solid fa-robot" aria-hidden="true"></i>
          {{ copy.aiError }} · <span>{{ invoice.aiError }}</span>
        </p>
      </aside>

      <section class="detail__form">
        <p v-if="!editable" class="locked">
          <i class="fa-solid fa-lock" aria-hidden="true"></i> {{ copy.readOnly }}
        </p>

        <div class="head-fields">
          <div class="field head-fields__supplier">
            <label for="inv-supplier">{{ copy.supplier }}</label>
            <input id="inv-supplier" v-model="form.supplier" type="text" :disabled="!editable" />
          </div>
          <div class="field">
            <label for="inv-number">{{ copy.number }}</label>
            <input id="inv-number" v-model="form.invoiceNumber" type="text" :disabled="!editable" />
          </div>
          <div class="field">
            <label for="inv-date">{{ copy.date }}</label>
            <input id="inv-date" v-model="form.date" type="date" :disabled="!editable" />
          </div>
        </div>

        <h2 class="detail__lines-title">{{ copy.lines }}</h2>
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

        <div class="total">
          <span>{{ copy.total }}</span>
          <strong class="num">{{ formatCents(totalCents) }}</strong>
        </div>
      </section>
    </div>

    <div v-if="invoice && editable" class="actions">
      <button class="btn btn--ghost" :disabled="busy" @click="rejecting = true">
        <i class="fa-solid fa-ban" aria-hidden="true"></i> {{ copy.reject }}
      </button>
      <button class="btn btn--ghost" :disabled="busy" @click="editor.save">
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
      :message="invoice ? copy.confirmMessage(invoice.branch.name) : ''"
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
  </div>
</template>

<style scoped lang="scss">
.detail {
  padding-bottom: 7rem;

  &__body {
    @include flex(column, stretch, flex-start, 1.25rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__photo {
    @include flex(column, stretch, flex-start, 0.6rem);

    @include from('lg') {
      flex: 0 0 38%;
      position: sticky;
      top: 1rem;
    }
  }

  &__form {
    @include flex(column, stretch, flex-start, 0.8rem);
    flex: 1;
    min-width: 0;
  }

  &__lines-title {
    @include eyebrow;
    color: $ink-muted;
    margin-top: 0.4rem;
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
  padding: 0.8rem 0.2rem 0;
  border-top: 2px solid $ink;

  span {
    @include eyebrow;
    color: $ink;
  }

  strong {
    @include display($text-xl, 600);
  }
}

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
</style>
