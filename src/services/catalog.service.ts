import APIBase from './httpBase'
import type { Ingredient, Product, Waiter } from '@/types'

export type ProductPayload = Partial<
  Pick<Product, 'name' | 'smartmenuCode' | 'category' | 'priceCents' | 'isActive'>
>

export type IngredientPayload = Partial<Omit<Ingredient, '_id'>>

export type WaiterPayload = Partial<Pick<Waiter, 'name' | 'isActive'>>

class CatalogService extends APIBase {
  async listProducts(
    query: { q?: string; category?: string; onlyWithoutRecipe?: boolean } = {},
  ): Promise<Product[]> {
    const search = new URLSearchParams()
    if (query.q) search.set('q', query.q)
    if (query.category) search.set('category', query.category)
    if (query.onlyWithoutRecipe) search.set('onlyWithoutRecipe', 'true')
    const text = search.toString()
    const { data } = await this.get<Product[]>(`products${text ? `?${text}` : ''}`)
    return data
  }

  async createProduct(payload: ProductPayload): Promise<Product> {
    const { data } = await this.post<Product>('products', payload)
    return data
  }

  async updateProduct(id: string, payload: ProductPayload): Promise<Product> {
    const { data } = await this.put<Product>(`products/${id}`, payload)
    return data
  }

  async listIngredients(q = ''): Promise<Ingredient[]> {
    const { data } = await this.get<Ingredient[]>(
      `ingredients${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    )
    return data
  }

  async createIngredient(payload: IngredientPayload): Promise<Ingredient> {
    const { data } = await this.post<Ingredient>('ingredients', payload)
    return data
  }

  async updateIngredient(id: string, payload: IngredientPayload): Promise<Ingredient> {
    const { data } = await this.put<Ingredient>(`ingredients/${id}`, payload)
    return data
  }

  async listWaiters(branch = ''): Promise<Waiter[]> {
    const { data } = await this.get<Waiter[]>(
      `waiters${branch && branch !== 'all' ? `?branch=${branch}` : ''}`,
    )
    return data
  }

  // Los meseros los crea la sincronización con SmartMenu: el panel solo los edita.
  async updateWaiter(id: string, payload: WaiterPayload): Promise<Waiter> {
    const { data } = await this.put<Waiter>(`waiters/${id}`, payload)
    return data
  }
}

export const catalogService = new CatalogService()
