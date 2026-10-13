import APIBase from './httpBase'
import type { StaffUser } from '@/types'

export interface CreateUserPayload {
  email: string
  password: string
  name: string
  accountType: 'admin' | 'staff'
  branch?: string | null
}

export interface UpdateUserPayload {
  name?: string
  branch?: string | null
  isActive?: boolean
  password?: string
}

class UserService extends APIBase {
  async list(): Promise<StaffUser[]> {
    const { data } = await this.get<StaffUser[]>('users')
    return data
  }

  async create(payload: CreateUserPayload): Promise<StaffUser> {
    const { data } = await this.post<StaffUser>('users', payload)
    return data
  }

  async update(id: string, payload: UpdateUserPayload): Promise<StaffUser> {
    const { data } = await this.put<StaffUser>(`users/${id}`, payload)
    return data
  }
}

export const userService = new UserService()
