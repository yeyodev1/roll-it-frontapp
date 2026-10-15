<script setup lang="ts">
import KpiCard from '@/components/ui/KpiCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import BranchRanking from './BranchRanking.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useCeoSummary } from '@/composables/useCeoSummary'

// Atención del período con las ventas de SmartMenu: existe para cualquier rango,
// aunque el reporte no diga qué mesero atendió cada mesa.
const copy = dashboardCopy.waiters
const { data, loading, kpis, branches, multiBranch } = useCeoSummary()
</script>

<template>
  <section class="svc">
    <template v-if="loading && !data">
      <SkeletonKpi :count="4" />
      <SkeletonTable :rows="3" :cols="4" />
    </template>

    <template v-else-if="data">
      <h2 class="svc__title">
        <i class="fa-solid fa-bell-concierge" aria-hidden="true"></i>
        {{ copy.serviceTitle }}
      </h2>
      <div class="svc__kpis">
        <KpiCard v-for="k in kpis" :key="k.label" v-bind="k" />
      </div>
      <ChartCard
        v-if="multiBranch"
        :title="copy.serviceByBranch"
        :help="site.help.serviceByBranch"
        flush
      >
        <BranchRanking :rows="branches" />
      </ChartCard>
    </template>
  </section>
</template>

<style scoped lang="scss">
.svc {
  @include flex(column, stretch, flex-start, $sp-3);

  @include from('md') {
    gap: $sp-4;
  }

  &__title {
    @include flex(row, center, flex-start, $sp-2);
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: $ink;

    i {
      color: $accent;
    }
  }

  &__kpis {
    @include flex-cards(150px, $sp-3);

    @include from('md') {
      @include flex-cards(220px, $sp-4);
    }
  }
}
</style>
