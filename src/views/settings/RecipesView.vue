<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import SearchField from '@/components/ui/SearchField.vue'
import SkeletonKpi from '@/components/ui/skeleton/SkeletonKpi.vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import RecipeImport from '@/components/settings/RecipeImport.vue'
import RecipeList from '@/components/settings/RecipeList.vue'
import RecipeEditor from '@/components/settings/RecipeEditor.vue'
import { useRecipes } from '@/composables/useRecipes'
import { useRecipesEditor } from '@/composables/useRecipesEditor'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'
import { formatPercent, formatQty } from '@/utils/format'
import type { KpiTone } from '@/components/ui/KpiCard.vue'

const copy = inventoryCopy.recipes
const r = useRecipes()
const { products, recipes, loading, error, onlyWithout, search, withoutCount, filtered } = r
const editor = useRecipesEditor(r.applyRecipe)

// Con cientos de platos la tabla se muestra por tandas: rápida en el celular.
const PAGE = 40
const limit = ref(PAGE)
const shown = computed(() => filtered.value.slice(0, limit.value))
watch([onlyWithout, search], () => (limit.value = PAGE))

const kpis = computed(() => {
  const active = products.value.filter((p) => p.isActive)
  const withR = active.filter((p) => p.hasRecipe).length
  const coverage = active.length ? withR / active.length : 0
  return [
    {
      label: copy.kpiDishes,
      value: formatQty(active.length),
      icon: 'fa-solid fa-bowl-food',
      tone: 'ink' as KpiTone,
      sub: copy.kpiCategories(new Set(active.map((p) => p.category)).size),
    },
    {
      label: copy.kpiCoverage,
      value: formatPercent(coverage),
      icon: 'fa-solid fa-book-open',
      tone: 'blue' as KpiTone,
      sub: copy.kpiWith(withR),
      help: site.help.recipeCoverage,
    },
    {
      label: copy.withoutRecipe,
      value: formatQty(withoutCount.value),
      icon: 'fa-solid fa-triangle-exclamation',
      tone: 'amber' as KpiTone,
      sub: copy.withoutSub,
    },
  ]
})

onMounted(r.load)
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title">
      <template #actions>
        <RecipeImport @done="r.load" />
      </template>
    </PageHeader>

    <SkeletonKpi v-if="loading" :count="3" :delta="false" />
    <section v-else class="rec__kpis">
      <KpiCard v-for="k in kpis" :key="k.label" v-bind="k" />
    </section>

    <ChartCard class="rec__card" :title="copy.dishes" flush>
      <template #action>
        <div class="rec__tools">
          <div class="rec__seg" role="group">
            <button type="button" :aria-pressed="!onlyWithout" @click="onlyWithout = false">
              {{ copy.all }} <span class="num">{{ products.length }}</span>
            </button>
            <button type="button" :aria-pressed="onlyWithout" @click="onlyWithout = true">
              {{ copy.withoutRecipe }} <span class="num">{{ withoutCount }}</span>
            </button>
          </div>
          <SearchField v-model="search" :placeholder="copy.search" />
        </div>
      </template>

      <SkeletonTable v-if="loading" :rows="8" :cols="4" />
      <LoadError v-else-if="error && !products.length" :message="error" @retry="r.load" />
      <div v-else-if="!filtered.length" class="rec__empty">
        <EmptyState icon="fa-solid fa-book-open" :title="copy.empty" />
      </div>
      <RecipeList v-else :products="shown" :recipes="recipes" @edit="editor.open" />

      <template v-if="filtered.length > limit" #footer>
        <div class="rec__more">
          <button type="button" class="btn btn--ghost btn--sm" @click="limit += PAGE">
            {{ copy.showMore(filtered.length - limit) }}
          </button>
        </div>
      </template>
    </ChartCard>

    <RecipeEditor :editor="editor" />
  </div>
</template>

<style scoped lang="scss">
.rec {
  &__kpis {
    @include flex-cards(150px, $sp-3);

    @include from('md') {
      @include flex-cards(220px, $sp-4);
    }
  }

  &__tools {
    @include flex(row, center, flex-start, $sp-2);
    flex-wrap: wrap;
    width: 100%;

    @include from('md') {
      flex-wrap: nowrap;
      justify-content: flex-end;
    }

    :deep(.search) {
      flex: 1 1 12rem;

      @include from('md') {
        flex: 0 0 14rem;
      }
    }
  }

  &__seg {
    @include flex(row, center, flex-start, 0.1rem);
    padding: 0.2rem;
    border-radius: $radius-pill;
    background: $canvas;

    button {
      padding: 0.3rem 0.75rem;
      border-radius: $radius-pill;
      font-size: 0.76rem;
      font-weight: 600;
      color: $ink-soft;
      white-space: nowrap;

      span {
        margin-left: 0.15rem;
        opacity: 0.6;
      }

      &[aria-pressed='true'] {
        background: $surface;
        color: $ink;
        box-shadow: $shadow-sm;
      }
    }
  }

  &__card :deep(.ccard__action) {
    @include until('md') {
      flex: 1 1 100%;
    }
  }

  &__empty {
    padding: 0 $sp-4 $sp-4;
  }

  &__more {
    @include flex(row, center, center);
    padding-bottom: $sp-4;
  }
}
</style>
