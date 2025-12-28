import { apiGet, apiPatch } from './client'
import type { User } from './auth'
import type { Post } from './posts'

// Types
export interface UserProfile extends User {
    _count: {
        posts: number
        issues: number
        demands: number
        marketplace: number
    }
}

export interface UpdateProfileData {
    name?: string
    displayName?: string
    bio?: string
    department?: string
    batch?: string
    hall?: string
    phone?: string
    avatar?: string
}

// Users API Functions
export const usersApi = {
    /**
     * Get a user's public profile
     */
    getProfile: async (userId: string) => {
        return apiGet<{ user: UserProfile; recentPosts: Post[] }>(`/users/${userId}`)
    },

    /**
     * Update user profile
     */
    updateProfile: async (userId: string, data: UpdateProfileData) => {
        return apiPatch<{ user: User }>(`/users/${userId}`, data)
    },

    /**
     * Update own profile
     */
    updateMyProfile: async (data: UpdateProfileData) => {
        // This requires knowing the current user's ID
        // Typically you'd get this from auth context
        throw new Error('Use updateProfile with the user ID instead')
    },
}
