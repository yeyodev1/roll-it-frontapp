<script setup lang="ts">
import { onMounted } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
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

    <LoadingBlock v-if="loading && !products.length" />
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
