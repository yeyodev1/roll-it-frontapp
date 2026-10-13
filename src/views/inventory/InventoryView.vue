<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import BranchPicker from '@/components/inventory/BranchPicker.vue'
import StockCounters from '@/components/inventory/StockCounters.vue'
import StockAsk from '@/components/inventory/StockAsk.vue'
import StockList from '@/components/inventory/StockList.vue'
import AdjustSheet from '@/components/inventory/AdjustSheet.vue'
import { useInventoryBranch } from '@/composables/useInventoryBranch'
import { useInventoryStock } from '@/composables/useInventoryStock'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import type { StockRow } from '@/types'

const copy = inventoryCopy.stock
const { branch, branchName, isStaff, ensureBranches } = useInventoryBranch()
const { rows, counts, loading, status, search, filtered, load, replaceRow, toggleStatus } =
  useInventoryStock()

const adjusting = ref<StockRow | null>(null)

watch(branch, (value) => load(value))
onMounted(async () => {
  await ensureBranches()
  load(branch.value)
})
</script>

<template>
  <div class="page inventory">
    <PageHeader
      :title="copy.title"
      :subtitle="isStaff ? branchName : undefined"
      :help="site.help.stockStatus"
    >
      <template #actions>
        <BranchPicker v-if="!isStaff" v-model="branch" allow-all />
      </template>
    </PageHeader>

    <nav class="quick">
      <RouterLink class="btn btn--primary quick__main" :to="{ name: 'Invoices' }">
        <i class="fa-solid fa-camera" aria-hidden="true"></i> {{ copy.actions.invoice }}
      </RouterLink>
      <RouterLink class="btn btn--ghost" :to="{ name: 'InitialInventory' }">
        <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i> {{ copy.actions.initial }}
      </RouterLink>
      <RouterLink class="btn btn--ghost" :to="{ name: 'Movements' }">
        <i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
        {{ copy.actions.movements }}
      </RouterLink>
    </nav>

    <StockAsk :branch="branch" />

    <StockCounters :counts="counts" :active="status" @toggle="toggleStatus" />

    <label class="search">
      <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      <span class="visually-hidden">{{ copy.search }}</span>
      <input v-model="search" type="search" :placeholder="copy.search" />
    </label>

    <LoadingBlock v-if="loading && !rows.length" />
    <EmptyState
      v-else-if="!filtered.length"
      icon="fa-solid fa-box-open"
      :title="copy.empty"
      :text="rows.length ? undefined : copy.emptyText"
    />
    <StockList
      v-else
      :rows="filtered"
      :show-branch="branch === 'all'"
      @adjust="adjusting = $event"
    />

    <AdjustSheet :row="adjusting" @close="adjusting = null" @saved="replaceRow" />
  </div>
</template>

<style scoped lang="scss">
.quick {
  @include flex(row, center, flex-start, 0.5rem);
  flex-wrap: wrap;

  .btn {
    flex: 1 1 auto;

    @include from('md') {
      flex: 0 0 auto;
    }
  }

  &__main {
    flex-basis: 100%;

    @include from('md') {
      flex-basis: auto;
    }
  }
}

.search {
  position: relative;
  margin: 0;

  i {
    position: absolute;
    left: 0.95rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    font-size: 0.85rem;
  }

  input {
    padding-left: 2.4rem;
  }
}
</style>
