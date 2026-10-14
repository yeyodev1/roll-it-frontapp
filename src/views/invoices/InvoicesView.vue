<script setup lang="ts">
import { onMounted, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import SkeletonList from '@/components/ui/skeleton/SkeletonList.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import InvoiceCapture from '@/components/invoices/InvoiceCapture.vue'
import InvoiceCounters from '@/components/invoices/InvoiceCounters.vue'
import InvoiceList from '@/components/invoices/InvoiceList.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInvoiceList } from '@/composables/useInvoiceList'
import { useInvoiceUpload } from '@/composables/useInvoiceUpload'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import type { InvoiceStatus } from '@/types'

const copy = inventoryCopy.invoices
const { branch, branchName, isStaff, ensureBranches } = useInventoryBranch()
const { items, page, pages, total, status, counts, loading, error, load } = useInvoiceList()
const { preview, uploading, upload } = useInvoiceUpload()

// La foto necesita una sucursal concreta: "todas" no sirve para sumar stock.
const uploadBranch = () => (branch.value === 'all' ? '' : branch.value)

function toggleStatus(value: InvoiceStatus) {
  status.value = status.value === value ? '' : value
  page.value = 1
  load(branch.value)
}

watch(branch, (value) => {
  page.value = 1
  load(value, true)
})
watch(page, () => load(branch.value))
onMounted(async () => {
  await ensureBranches()
  load(branch.value, true)
})
</script>

<template>
  <div class="page">
    <PageHeader
      :title="copy.title"
      :subtitle="isStaff ? branchName : undefined"
      :help="site.help.invoices"
    >
      <template #actions>
        <BranchPicker v-if="!isStaff" v-model="branch" allow-all />
      </template>
    </PageHeader>

    <div class="inv__top">
      <div class="inv__capture">
        <InvoiceCapture
          :uploading="uploading"
          :preview="preview"
          @file="upload($event, uploadBranch())"
        />
        <p v-if="!isStaff && branch === 'all'" class="inv__hint">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i> {{ copy.branchFirst }}
        </p>
      </div>
      <InvoiceCounters
        class="inv__counts"
        :counts="counts"
        :active="status"
        @toggle="toggleStatus"
      />
    </div>

    <ChartCard :title="copy.list" flush>
      <template #action>
        <span class="inv__total num">{{ copy.total(total) }}</span>
      </template>
      <SkeletonList v-if="loading" :rows="6" :card="false" thumb />
      <LoadError v-else-if="error && !items.length" :message="error" @retry="load(branch)" />
      <div v-else-if="!items.length" class="inv__empty">
        <EmptyState icon="fa-solid fa-receipt" :title="copy.empty" :text="copy.emptyText" />
      </div>
      <InvoiceList v-else :items="items" :show-branch="!isStaff && branch === 'all'" />

      <template v-if="pages > 1" #footer>
        <div class="inv__pager">
          <button class="btn btn--ghost btn--sm" :disabled="page <= 1" @click="page--">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            {{ inventoryCopy.movements.prev }}
          </button>
          <span class="muted num">{{ inventoryCopy.movements.page(page, pages) }}</span>
          <button class="btn btn--ghost btn--sm" :disabled="page >= pages" @click="page++">
            {{ inventoryCopy.movements.next }}
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </template>
    </ChartCard>
  </div>
</template>

<style scoped lang="scss">
.inv {
  &__top {
    @include flex(column, stretch, flex-start, $sp-3);

    @include from('md') {
      gap: $sp-4;
    }

    @include from('lg') {
      flex-direction: row;
    }
  }

  &__capture {
    @include flex(column, stretch, flex-start, $sp-2);
    flex: 1 1 0;
    min-width: 0;
  }

  &__counts {
    flex: 2 1 0;
    min-width: 0;
  }

  &__hint {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.75rem;
    color: $ink-muted;
  }

  &__total {
    font-size: 0.78rem;
    color: $ink-muted;
  }

  &__empty {
    padding: 0 $sp-4 $sp-4;

    @include from('md') {
      padding: 0 $sp-6 $sp-6;
    }
  }

  &__pager {
    @include flex(row, center, space-between, 0.6rem);
    padding-bottom: $sp-4;
  }
}
</style>
