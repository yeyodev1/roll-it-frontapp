import APIBase from './httpBase'
import type { Invoice, InvoiceStatus, Paginated } from '@/types'

export interface InvoiceLinePayload {
  rawName: string
  ingredient: string | null
  quantity: number
  rawQuantity?: number
  rawUnit?: string
  unitCostCents: number
  totalCents: number
}

export interface InvoiceUpdatePayload {
  supplier?: string
  invoiceNumber?: string
  date?: string
  lines?: InvoiceLinePayload[]
}

// La IA tarda en leer la foto: 15 s del default no alcanzan.
const UPLOAD_TIMEOUT = 90000

class InvoiceService extends APIBase {
  async list(
    query: { branch?: string; status?: InvoiceStatus | ''; page?: number } = {},
  ): Promise<Paginated<Invoice>> {
    const search = new URLSearchParams()
    if (query.branch) search.set('branch', query.branch)
    if (query.status) search.set('status', query.status)
    if (query.page) search.set('page', String(query.page))
    const text = search.toString()
    const { data } = await this.get<Paginated<Invoice>>(`invoices${text ? `?${text}` : ''}`)
    return data
  }

  async getOne(id: string): Promise<Invoice> {
    const { data } = await this.get<Invoice>(`invoices/${id}`)
    return data
  }

  /** `form` lleva `image` (archivo) y `branch`. */
  async upload(form: FormData): Promise<Invoice> {
    const { data } = await this.post<Invoice>('invoices', form, undefined, {
      timeout: UPLOAD_TIMEOUT,
    })
    return data
  }

  async update(id: string, payload: InvoiceUpdatePayload): Promise<Invoice> {
    const { data } = await this.put<Invoice>(`invoices/${id}`, payload)
    return data
  }

  async confirm(id: string): Promise<Invoice> {
    const { data } = await this.post<Invoice>(`invoices/${id}/confirm`, {})
    return data
  }

  async reject(id: string): Promise<Invoice> {
    const { data } = await this.post<Invoice>(`invoices/${id}/reject`, {})
    return data
  }
}

export const invoiceService = new InvoiceService()
