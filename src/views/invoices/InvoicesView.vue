<script setup lang="ts">
import { onMounted, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import SkeletonList from '@/components/ui/skeleton/SkeletonList.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import InvoiceCapture from '@/components/invoices/InvoiceCapture.vue'
import InvoiceList from '@/components/invoices/InvoiceList.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInvoiceList } from '@/composables/useInvoiceList'
import { useInvoiceUpload } from '@/composables/useInvoiceUpload'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import type { InvoiceStatus } from '@/types'

const copy = inventoryCopy.invoices
const { branch, branchName, isStaff, ensureBranches } = useInventoryBranch()
const { items, page, pages, status, loading, error, load } = useInvoiceList()
const { preview, uploading, upload } = useInvoiceUpload()

const statuses = Object.entries(site.invoiceStatus) as [InvoiceStatus, string][]

// La foto necesita una sucursal concreta: "todas" no sirve para sumar stock.
const uploadBranch = () => (branch.value === 'all' ? '' : branch.value)

function setStatus(value: InvoiceStatus | '') {
  status.value = value
  page.value = 1
  load(branch.value)
}

watch(branch, (value) => {
  page.value = 1
  load(value)
})
watch(page, () => load(branch.value))
onMounted(async () => {
  await ensureBranches()
  load(branch.value)
})
</script>

<template>
  <div class="page invoices">
    <PageHeader
      :title="copy.title"
      :subtitle="isStaff ? branchName : undefined"
      :help="site.help.invoices"
    >
      <template #actions>
        <BranchPicker v-if="!isStaff" v-model="branch" allow-all />
      </template>
    </PageHeader>

    <InvoiceCapture
      :uploading="uploading"
      :preview="preview"
      @file="upload($event, uploadBranch())"
    />
    <p v-if="!isStaff && branch === 'all'" class="hint muted">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i> {{ copy.branchFirst }}
    </p>

    <div class="tabs" role="group">
      <button class="chip" :aria-pressed="status === ''" @click="setStatus('')">
        {{ copy.allStatus }}
      </button>
      <button
        v-for="[value, label] in statuses"
        :key="value"
        class="chip"
        :aria-pressed="status === value"
        @click="setStatus(value)"
      >
        {{ label }}
      </button>
    </div>

    <SkeletonList v-if="loading" :rows="6" basis="320px" thumb />
    <LoadError v-else-if="error && !items.length" :message="error" @retry="load(branch)" />
    <EmptyState
      v-else-if="!items.length"
      icon="fa-solid fa-receipt"
      :title="copy.empty"
      :text="copy.emptyText"
    />
    <InvoiceList v-else :items="items" :show-branch="!isStaff && branch === 'all'" />

    <div v-if="pages > 1" class="pager">
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
  </div>
</template>

<style scoped lang="scss">
.hint {
  font-size: $text-sm;
  margin-top: -0.6rem;
}

.tabs {
  @include flex(row, center, flex-start, 0.4rem);
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.pager {
  @include flex(row, center, space-between, 0.6rem);
  font-size: $text-sm;
}
</style>
