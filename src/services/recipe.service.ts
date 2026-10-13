import APIBase from './httpBase'
import type { Recipe } from '@/types'

export interface RecipePayload {
  items: { ingredient: string; quantity: number }[]
  notes?: string
}

export interface RecipeImportResult {
  products: number
  ingredients: number
  recipes: number
  warnings: string[]
}

class RecipeService extends APIBase {
  async list(): Promise<Recipe[]> {
    const { data } = await this.get<Recipe[]>('recipes')
    return data
  }

  /** null si el plato todavía no tiene receta (el API responde 404). */
  async getByProduct(productId: string): Promise<Recipe | null> {
    try {
      const { data } = await this.get<Recipe>(`recipes/product/${productId}`)
      return data
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null
      throw error
    }
  }

  async save(productId: string, payload: RecipePayload): Promise<Recipe> {
    const { data } = await this.put<Recipe>(`recipes/product/${productId}`, payload)
    return data
  }

  async remove(productId: string): Promise<{ ok: boolean }> {
    const { data } = await this.delete<{ ok: boolean }>(`recipes/product/${productId}`)
    return data
  }

  /** `form` lleva `file` (.xlsx o .csv). */
  async import(form: FormData): Promise<RecipeImportResult> {
    const { data } = await this.post<RecipeImportResult>('recipes/import', form, undefined, {
      timeout: 60000,
    })
    return data
  }
}

export const recipeService = new RecipeService()
