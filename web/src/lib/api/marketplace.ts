import { apiGet, apiPost, apiPatch, apiDelete, buildQueryString } from './client'
import type { User } from './auth'
import type { Media } from './posts'

// Types
export interface MarketplaceItem {
    id: string
    sellerId: string
    title: string
    description: string
    price: number
    currency: string
    category: 'ELECTRONICS' | 'BOOKS' | 'CLOTHING' | 'FURNITURE' | 'ACCESSORIES' | 'SPORTS' | 'STATIONERY' | 'OTHER'
    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'REMOVED'
    location: string | null
    viewCount: number
    createdAt: string
    updatedAt: string
    soldAt: string | null
    seller: Pick<User, 'id' | 'name' | 'displayName' | 'avatar' | 'department' | 'hall'>
    media: Media[]
}

export interface MarketplaceListParams {
    page?: number
    limit?: number
    category?: string
    condition?: string
    status?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    sortBy?: 'recent' | 'price_low' | 'price_high'
}

export interface CreateItemData {
    title: string
    description: string
    price: number
    category: string
    condition: string
    location?: string
    media?: { url: string; type: string; caption?: string }[]
}

export interface UpdateItemData {
    title?: string
    description?: string
    price?: number
    category?: string
    condition?: string
    location?: string
    status?: string
}

// Marketplace API Functions
export const marketplaceApi = {
    /**
     * Get paginated marketplace items
     */
    getList: async (params: MarketplaceListParams = {}) => {
        const query = buildQueryString(params)
        return apiGet<{ items: MarketplaceItem[]; pagination: object }>(`/marketplace${query}`)
    },

    /**
     * Get a single item by ID
     */
    getById: async (id: string) => {
        return apiGet<{ item: MarketplaceItem; sellerItems: MarketplaceItem[] }>(`/marketplace/${id}`)
    },

    /**
     * Create a new marketplace listing
     */
    create: async (data: CreateItemData) => {
        return apiPost<{ item: MarketplaceItem }>('/marketplace', data)
    },

    /**
     * Update a marketplace item
     */
    update: async (id: string, data: UpdateItemData) => {
        return apiPatch<{ item: MarketplaceItem }>(`/marketplace/${id}`, data)
    },

    /**
     * Delete a marketplace item
     */
    delete: async (id: string) => {
        return apiDelete<null>(`/marketplace/${id}`)
    },

    /**
     * Mark item as sold
     */
    markAsSold: async (id: string) => {
        return apiPatch<{ item: MarketplaceItem }>(`/marketplace/${id}`, { status: 'SOLD' })
    },

    /**
     * Mark item as reserved
     */
    markAsReserved: async (id: string) => {
        return apiPatch<{ item: MarketplaceItem }>(`/marketplace/${id}`, { status: 'RESERVED' })
    },
}
