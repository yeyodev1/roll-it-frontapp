import APIBase from './httpBase'
import type { Branch } from '@/types'

export interface BranchInput {
  name: string
  smartmenuUrl?: string
}

export interface BranchUpdate {
  name?: string
  smartmenuUrl?: string
  isActive?: boolean
}

class BranchService extends APIBase {
  async list(): Promise<Branch[]> {
    const { data } = await this.get<Branch[]>('branches')
    return data
  }

  async create(data: BranchInput): Promise<Branch> {
    const res = await this.post<Branch>('branches', data)
    return res.data
  }

  async update(id: string, data: BranchUpdate): Promise<Branch> {
    const res = await this.put<Branch>(`branches/${id}`, data)
    return res.data
  }
}

export const branchService = new BranchService()
