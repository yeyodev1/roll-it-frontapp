import { ref } from 'vue'
import { recipeService } from '@/services/recipe.service'
import { useInventoryIngredients } from './useInventoryIngredients'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { ApiError, Product, Recipe } from '@/types'

const copy = inventoryCopy.recipes

export interface RecipeItemDraft {
  key: number
  ingredient: string | null
  quantity: number | null
}

let nextKey = 1

export function useRecipesEditor(onChange: (productId: string, recipe: Recipe | null) => void) {
  const toast = useToastStore()
  const { loadIngredients, byId } = useInventoryIngredients()
  const product = ref<Product | null>(null)
  const items = ref<RecipeItemDraft[]>([])
  const notes = ref('')
  const loading = ref(false)
  const saving = ref(false)

  async function open(target: Product) {
    product.value = target
    items.value = []
    notes.value = ''
    loading.value = true
    try {
      const [recipe] = await Promise.all([
        recipeService.getByProduct(target._id),
        loadIngredients(),
      ])
      items.value = (recipe?.items || []).map((i) => ({
        key: nextKey++,
        ingredient: i.ingredient._id,
        quantity: i.quantity,
      }))
      notes.value = recipe?.notes || ''
      if (!items.value.length) addItem()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  function close() {
    product.value = null
  }

  function addItem() {
    items.value.push({ key: nextKey++, ingredient: null, quantity: null })
  }

  function removeItem(key: number) {
    items.value = items.value.filter((i) => i.key !== key)
  }

  async function save() {
    if (!product.value || saving.value) return
    const valid = items.value.filter((i) => i.ingredient && Number(i.quantity) > 0)
    if (!valid.length) return toast.error(copy.emptyItems)
    saving.value = true
    try {
      const recipe = await recipeService.save(product.value._id, {
        items: valid.map((i) => ({ ingredient: i.ingredient!, quantity: Number(i.quantity) })),
        notes: notes.value.trim(),
      })
      toast.success(copy.saved)
      onChange(product.value._id, recipe)
      close()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  async function remove() {
    if (!product.value || saving.value) return
    saving.value = true
    try {
      await recipeService.remove(product.value._id)
      toast.success(copy.removed)
      onChange(product.value._id, null)
      close()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return {
    product,
    items,
    notes,
    loading,
    saving,
    byId,
    open,
    close,
    addItem,
    removeItem,
    save,
    remove,
  }
}
