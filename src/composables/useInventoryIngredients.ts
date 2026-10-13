import { computed, ref } from 'vue'
import { catalogService } from '@/services/catalog.service'
import type { Ingredient } from '@/types'

// Caché de módulo: inventario inicial, facturas y recetas usan la misma lista.
const ingredients = ref<Ingredient[]>([])
let pending: Promise<Ingredient[]> | null = null

export function useInventoryIngredients() {
  const active = computed(() =>
    ingredients.value.filter((i) => i.isActive).sort((a, b) => a.name.localeCompare(b.name, 'es')),
  )

  async function loadIngredients(force = false) {
    if (ingredients.value.length && !force) return ingredients.value
    if (!pending) {
      pending = catalogService.listIngredients().finally(() => {
        pending = null
      })
    }
    ingredients.value = await pending
    return ingredients.value
  }

  function byId(id: string | null | undefined) {
    return ingredients.value.find((i) => i._id === id) || null
  }

  return { ingredients, active, loadIngredients, byId }
}
