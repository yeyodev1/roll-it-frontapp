<script setup lang="ts">
import { onMounted } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadError from '@/components/ui/LoadError.vue'
import SkeletonCards from '@/components/ui/skeleton/SkeletonCards.vue'
import RecipeImport from '@/components/settings/RecipeImport.vue'
import RecipeList from '@/components/settings/RecipeList.vue'
import RecipeEditor from '@/components/settings/RecipeEditor.vue'
import { useRecipes } from '@/composables/useRecipes'
import { useRecipesEditor } from '@/composables/useRecipesEditor'
import { inventoryCopy } from '@/config/inventoryCopy'

const copy = inventoryCopy.recipes
const {
  products,
  recipes,
  loading,
  error,
  onlyWithout,
  search,
  withoutCount,
  filtered,
  load,
  applyRecipe,
} = useRecipes()
const editor = useRecipesEditor(applyRecipe)

onMounted(load)
</script>

<template>
  <div class="page recipes">
    <PageHeader :title="copy.title">
      <template #actions>
        <RecipeImport @done="load" />
      </template>
    </PageHeader>

    <div class="toolbar">
      <div class="toolbar__chips" role="group">
        <button class="chip" :aria-pressed="!onlyWithout" @click="onlyWithout = false">
          {{ copy.all }} · {{ products.length }}
        </button>
        <button class="chip" :aria-pressed="onlyWithout" @click="onlyWithout = true">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          {{ copy.withoutRecipe }} · {{ withoutCount }}
        </button>
      </div>
      <input v-model="search" class="toolbar__search" type="search" :placeholder="copy.search" />
    </div>

    <SkeletonCards v-if="loading" :count="6" basis="300px" :lines="2" min-height="7.5rem" />
    <LoadError v-else-if="error && !products.length" :message="error" @retry="load" />
    <EmptyState v-else-if="!filtered.length" icon="fa-solid fa-book-open" :title="copy.empty" />
    <RecipeList v-else :products="filtered" :recipes="recipes" @edit="editor.open" />

    <RecipeEditor :editor="editor" />
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  @include flex(row, center, space-between, 0.6rem);
  flex-wrap: wrap;

  &__chips {
    @include flex(row, center, flex-start, 0.4rem);
  }

  &__search {
    flex: 1 1 220px;
    max-width: 360px;
  }
}
</style>
