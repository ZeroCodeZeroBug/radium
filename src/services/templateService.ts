import { api } from '../lib/api'
import type { Template, ProfileConfig } from '../types'

export const templateService = {
  async getTemplateByShareId(shareId: string): Promise<Template | null> {
    try {
      return await api.getTemplateByShareId(shareId)
    } catch (error: any) {
      console.error('Error fetching template:', error)
      throw new Error(`Failed to fetch template: ${error.message}`)
    }
  },

  async getTemplatesByUserId(userId: string): Promise<Template[]> {
    try {
      const templates = await api.getTemplates({ user_id: userId })
      return templates || []
    } catch (error: any) {
      console.error('Error fetching templates:', error)
      throw new Error(`Failed to fetch templates: ${error.message}`)
    }
  },

  async getPublicTemplates(limit = 20): Promise<Template[]> {
    try {
      const templates = await api.getTemplates({ is_public: 'true' })
      return (templates || []).slice(0, limit)
    } catch (error: any) {
      console.error('Error fetching public templates:', error)
      throw new Error(`Failed to fetch public templates: ${error.message}`)
    }
  },

  async createTemplate(
    userId: string,
    profileId: string,
    name: string,
    config: ProfileConfig,
    description?: string,
    isPublic = false
  ): Promise<Template> {
    try {
      return await api.createTemplate({
        user_id: userId,
        profile_id: profileId,
        name,
        description,
        config,
        is_public: isPublic,
      })
    } catch (error: any) {
      console.error('Error creating template:', error)
      throw new Error(`Failed to create template: ${error.message}`)
    }
  },

  async updateTemplate(templateId: string, updates: Partial<Template>): Promise<Template> {
    try {
      return await api.updateTemplate(templateId, updates)
    } catch (error: any) {
      console.error('Error updating template:', error)
      throw new Error(`Failed to update template: ${error.message}`)
    }
  },

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await api.deleteTemplate(templateId)
    } catch (error: any) {
      console.error('Error deleting template:', error)
      throw new Error(`Failed to delete template: ${error.message}`)
    }
  },

  async incrementTemplateViews(shareId: string): Promise<void> {
    try {
      const template = await api.getTemplateByShareId(shareId)
      if (template?._id) {
        await api.incrementTemplateViews(template._id)
      }
    } catch (error: any) {
      console.error('Error incrementing template views:', error)
    }
  },

  generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },
}
