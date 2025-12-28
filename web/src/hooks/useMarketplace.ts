'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    marketplaceApi,
    type MarketplaceItem,
    type MarketplaceListParams,
    type CreateItemData,
    type UpdateItemData
} from '@/lib/api'

// Hook for fetching marketplace items
export function useMarketplace(initialParams: MarketplaceListParams = {}) {
    const [items, setItems] = useState<MarketplaceItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        hasMore: boolean
    }>({ page: 1, limit: 20, total: 0, hasMore: false })

    const fetchItems = useCallback(async (params: MarketplaceListParams = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await marketplaceApi.getList({ ...initialParams, ...params })

            if (response.success && response.data) {
                setItems(response.data.items)
                setPagination(response.data.pagination as typeof pagination)
            } else {
                setError(response.error || 'Failed to fetch items')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch items')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams])

    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return

        try {
            setIsLoading(true)
            const response = await marketplaceApi.getList({
                ...initialParams,
                page: pagination.page + 1,
            })

            if (response.success && response.data) {
                setItems(prev => [...prev, ...response.data!.items])
                setPagination(response.data.pagination as typeof pagination)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams, pagination, isLoading])

    const refresh = useCallback(() => fetchItems({ page: 1 }), [fetchItems])

    // Search items
    const search = useCallback((query: string) => {
        fetchItems({ search: query, page: 1 })
    }, [fetchItems])

    // Filter by category
    const filterByCategory = useCallback((category: string) => {
        fetchItems({ category, page: 1 })
    }, [fetchItems])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    return {
        items,
        isLoading,
        error,
        pagination,
        loadMore,
        refresh,
        fetchItems,
        search,
        filterByCategory
    }
}

// Hook for single marketplace item
export function useMarketplaceItem(itemId: string | null) {
    const [item, setItem] = useState<MarketplaceItem | null>(null)
    const [sellerItems, setSellerItems] = useState<MarketplaceItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchItem = useCallback(async () => {
        if (!itemId) {
            setItem(null)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await marketplaceApi.getById(itemId)

            if (response.success && response.data) {
                setItem(response.data.item)
                setSellerItems(response.data.sellerItems)
            } else {
                setError(response.error || 'Failed to fetch item')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch item')
        } finally {
            setIsLoading(false)
        }
    }, [itemId])

    useEffect(() => {
        fetchItem()
    }, [fetchItem])

    return { item, sellerItems, isLoading, error, refresh: fetchItem }
}

// Hook for creating marketplace listings
export function useCreateListing() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createListing = useCallback(async (data: CreateItemData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await marketplaceApi.create(data)

            if (response.success && response.data) {
                return response.data.item
            } else {
                setError(response.error || 'Failed to create listing')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create listing')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { createListing, isLoading, error }
}

// Hook for managing own listing
export function useManageListing() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateListing = useCallback(async (id: string, data: UpdateItemData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await marketplaceApi.update(id, data)

            if (response.success && response.data) {
                return response.data.item
            } else {
                setError(response.error || 'Failed to update listing')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update listing')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const markAsSold = useCallback(async (id: string) => {
        return updateListing(id, { status: 'SOLD' })
    }, [updateListing])

    const markAsReserved = useCallback(async (id: string) => {
        return updateListing(id, { status: 'RESERVED' })
    }, [updateListing])

    const deleteListing = useCallback(async (id: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await marketplaceApi.delete(id)

            if (response.success) {
                return true
            } else {
                setError(response.error || 'Failed to delete listing')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete listing')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { updateListing, markAsSold, markAsReserved, deleteListing, isLoading, error }
}
