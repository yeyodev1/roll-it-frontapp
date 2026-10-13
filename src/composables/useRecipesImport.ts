import { ref } from 'vue'
import { recipeService, type RecipeImportResult } from '@/services/recipe.service'
import { useInventoryIngredients } from './useInventoryIngredients'
import { useToastStore } from '@/stores/toast'
import { inventoryCopy } from '@/config/inventoryCopy'
import type { ApiError } from '@/types'

export function useRecipesImport(onDone: () => void) {
  const toast = useToastStore()
  const { loadIngredients } = useInventoryIngredients()
  const importing = ref(false)
  const result = ref<RecipeImportResult | null>(null)

  async function run(file: File) {
    importing.value = true
    result.value = null
    try {
      const form = new FormData()
      form.append('file', file)
      result.value = await recipeService.import(form)
      toast.success(inventoryCopy.recipes.imported)
      // El import puede crear insumos nuevos: la caché compartida queda vieja.
      await loadIngredients(true)
      onDone()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      importing.value = false
    }
  }

  return { importing, result, run }
}
