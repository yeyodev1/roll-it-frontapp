<script setup lang="ts">
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatCents, formatQty } from '@/utils/format'
import type { Product, Recipe } from '@/types'

defineProps<{ products: Product[]; recipes: Map<string, Recipe> }>()
const emit = defineEmits<{ edit: [product: Product] }>()

const copy = inventoryCopy.recipes
</script>

<template>
  <ul class="dishes">
    <li v-for="p in products" :key="p._id">
      <button
        type="button"
        class="dish"
        :class="{ 'dish--missing': !p.hasRecipe }"
        @click="emit('edit', p)"
      >
        <span class="dish__head">
          <span class="dish__name">
            {{ p.name }}
            <small>{{ p.category }}</small>
          </span>
          <span class="dish__price num">{{ formatCents(p.priceCents) }}</span>
        </span>
        <span v-if="recipes.get(p._id)?.items.length" class="dish__items">
          <span
            v-for="item in recipes.get(p._id)!.items"
            :key="item.ingredient._id"
            class="dish__item"
          >
            {{ item.ingredient.name }}
            <b class="num">{{ formatQty(item.quantity, item.ingredient.unit) }}</b>
          </span>
        </span>
        <span v-else class="dish__missing">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> {{ copy.noRecipe }}
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.dishes {
  list-style: none;
  @include flex-cards(300px, 0.6rem);
}

.dish {
  @include card;
  @include flex(column, stretch, flex-start, 0.6rem);
  width: 100%;
  height: 100%;
  padding: 0.9rem 1rem;
  text-align: left;
  @include transition;

  &:hover {
    border-color: $ink-muted;
    box-shadow: $shadow-sm;
  }

  &--missing {
    border-style: dashed;
    border-color: rgba($warning, 0.8);
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.6rem);
  }

  &__name {
    font-weight: 600;
    line-height: 1.3;

    small {
      display: block;
      font-weight: 400;
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__price {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__items {
    @include flex(row, center, flex-start, 0.3rem);
    flex-wrap: wrap;
  }

  &__item {
    font-size: $text-xs;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    background: $sand;
    color: $ink-soft;

    b {
      color: $ink;
      font-weight: 600;
    }
  }

  &__missing {
    font-size: $text-xs;
    font-weight: 600;
    color: darken($warning, 18%);
  }
}
</style>
