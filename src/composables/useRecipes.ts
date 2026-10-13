import { computed, ref } from 'vue'
import { catalogService } from '@/services/catalog.service'
import { recipeService } from '@/services/recipe.service'
import { normalize } from './useInventoryStock'
import { useToastStore } from '@/stores/toast'
import type { ApiError, Product, Recipe } from '@/types'

export function useRecipes() {
  const toast = useToastStore()
  const products = ref<Product[]>([])
  const recipes = ref<Map<string, Recipe>>(new Map())
  const loading = ref(false)
  const onlyWithout = ref(false)
  const search = ref('')

  const withoutCount = computed(() => products.value.filter((p) => !p.hasRecipe).length)

  const filtered = computed(() => {
    const term = normalize(search.value)
    return products.value
      .filter((p) => p.isActive)
      .filter((p) => !onlyWithout.value || !p.hasRecipe)
      .filter((p) => !term || normalize(p.name).includes(term))
      .sort(
        (a, b) => a.category.localeCompare(b.category, 'es') || a.name.localeCompare(b.name, 'es'),
      )
  })

  async function load() {
    loading.value = true
    try {
      const [list, recipeList] = await Promise.all([
        catalogService.listProducts(),
        recipeService.list(),
      ])
      products.value = list
      recipes.value = new Map(recipeList.map((r) => [r.product._id, r]))
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  /** Refleja en la lista lo que se guardó o borró en el editor, sin recargar. */
  function applyRecipe(productId: string, recipe: Recipe | null) {
    const next = new Map(recipes.value)
    if (recipe) next.set(productId, recipe)
    else next.delete(productId)
    recipes.value = next
    const product = products.value.find((p) => p._id === productId)
    if (product) product.hasRecipe = Boolean(recipe)
  }

  return {
    products,
    recipes,
    loading,
    onlyWithout,
    search,
    withoutCount,
    filtered,
    load,
    applyRecipe,
  }
}
