import { api } from '../lib/api'
import type { Admin } from '../types'

export const adminService = {
  async getAdminByUserId(userId: string): Promise<Admin | null> {
    try {
      const admins = await api.getAdmins()
      return admins.find(a => a.user_id === userId && a.is_active) || null
    } catch (error: any) {
      console.error('Error fetching admin:', error)
      throw new Error(`Failed to fetch admin: ${error.message}`)
    }
  },

  async getAllAdmins(): Promise<Admin[]> {
    try {
      const admins = await api.getAdmins()
      return admins.filter((a: Admin) => a.is_active)
    } catch (error: any) {
      console.error('Error fetching admins:', error)
      throw new Error(`Failed to fetch admins: ${error.message}`)
    }
  },

  async getAllProfiles(): Promise<any[]> {
    try {
      return await api.getProfiles()
    } catch (error: any) {
      console.error('Error fetching all profiles:', error)
      throw new Error(`Failed to fetch profiles: ${error.message}`)
    }
  },

  async createAdmin(userId: string, permissions: Record<string, unknown>, createdBy?: string): Promise<Admin> {
    try {
      return await api.createAdmin({
        user_id: userId,
        permissions,
        is_active: true,
        created_by: createdBy,
      })
    } catch (error: any) {
      console.error('Error creating admin:', error)
      throw new Error(`Failed to create admin: ${error.message}`)
    }
  },

  async updateAdmin(adminId: string, updates: Partial<Admin>): Promise<Admin> {
    try {
      return await api.updateProfile(adminId, updates as any)
    } catch (error: any) {
      console.error('Error updating admin:', error)
      throw new Error(`Failed to update admin: ${error.message}`)
    }
  },

  async deleteAdmin(adminId: string): Promise<void> {
    try {
      await api.deleteAdmin(adminId)
    } catch (error: any) {
      console.error('Error deleting admin:', error)
      throw new Error(`Failed to delete admin: ${error.message}`)
    }
  },
}
