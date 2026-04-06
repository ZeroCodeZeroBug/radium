import { api } from '../lib/api'
import type { Profile, ProfileConfig } from '../types'

export const profileService = {
  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const profile = await api.getProfileByUsername(username)
      return profile.is_active ? profile : null
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }
  },

  async getProfileByAuth0Id(auth0Id: string): Promise<Profile | null> {
    try {
      return await api.getProfileByAuth0Id(auth0Id)
    } catch (error) {
      console.error('Error fetching profile by auth0_id:', error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }
  },

  async createProfile(profileData: {
    auth0_id: string
    email?: string
    username: string
    display_name?: string
  }): Promise<Profile> {
    try {
      return await api.createProfile(profileData)
    } catch (error) {
      console.error('Error creating profile:', error)
      throw new Error(`Failed to create profile: ${error.message}`)
    }
  },

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      return await api.updateProfile(profileId, updates)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }
  },

  async updateProfileConfig(profileId: string, config: Partial<ProfileConfig>): Promise<Profile> {
    const existingProfile = await api.getProfileByUsername('')
    if (!existingProfile) {
      throw new Error('Profile not found')
    }

    const updatedConfig = {
      ...(existingProfile as any).config,
      ...config,
    }

    return this.updateProfile(profileId, { config: updatedConfig } as any)
  },

  async incrementViewCount(profileId: string): Promise<void> {
    try {
      await api.incrementViewCount(profileId)
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const profiles = await api.getProfiles()
      return !profiles.some(p => p.username === username.toLowerCase())
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  },

  async updateUsername(profileId: string, newUsername: string): Promise<Profile> {
    const isAvailable = await this.checkUsernameAvailability(newUsername)
    if (!isAvailable) {
      throw new Error('Username is already taken')
    }

    return this.updateProfile(profileId, { username: newUsername.toLowerCase() } as any)
  },
}
