'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    demandsApi,
    type Demand,
    type DemandsListParams,
    type CreateDemandData,
    type UpdateDemandData,
    type VoteType
} from '@/lib/api'

// Hook for fetching demands list
export function useDemands(initialParams: DemandsListParams = {}) {
    const [demands, setDemands] = useState<Demand[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        hasMore: boolean
    }>({ page: 1, limit: 20, total: 0, hasMore: false })

    const fetchDemands = useCallback(async (params: DemandsListParams = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await demandsApi.getList({ ...initialParams, ...params })

            if (response.success && response.data) {
                setDemands(response.data.demands)
                setPagination(response.data.pagination as typeof pagination)
            } else {
                setError(response.error || 'Failed to fetch demands')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch demands')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams])

    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return

        try {
            setIsLoading(true)
            const response = await demandsApi.getList({
                ...initialParams,
                page: pagination.page + 1,
            })

            if (response.success && response.data) {
                setDemands(prev => [...prev, ...response.data!.demands])
                setPagination(response.data.pagination as typeof pagination)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams, pagination, isLoading])

    const refresh = useCallback(() => fetchDemands({ page: 1 }), [fetchDemands])

    useEffect(() => {
        fetchDemands()
    }, [fetchDemands])

    return { demands, isLoading, error, pagination, loadMore, refresh, fetchDemands }
}

// Hook for single demand with voting
export function useDemand(demandId: string | null) {
    const [demand, setDemand] = useState<Demand | null>(null)
    const [userVote, setUserVote] = useState<VoteType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDemand = useCallback(async () => {
        if (!demandId) {
            setDemand(null)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await demandsApi.getById(demandId)

            if (response.success && response.data) {
                setDemand(response.data.demand)
                setUserVote(response.data.userVote)
            } else {
                setError(response.error || 'Failed to fetch demand')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch demand')
        } finally {
            setIsLoading(false)
        }
    }, [demandId])

    const vote = useCallback(async (voteType: VoteType) => {
        if (!demandId) return false

        try {
            const response = await demandsApi.vote(demandId, voteType)

            if (response.success && response.data) {
                setUserVote(response.data.voteType)
                // Refresh demand to get updated counts
                await fetchDemand()
                return true
            } else {
                setError(response.error || 'Failed to vote')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to vote')
            return false
        }
    }, [demandId, fetchDemand])

    useEffect(() => {
        fetchDemand()
    }, [fetchDemand])

    return { demand, userVote, isLoading, error, refresh: fetchDemand, vote }
}

// Hook for creating demands
export function useCreateDemand() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createDemand = useCallback(async (data: CreateDemandData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await demandsApi.create(data)

            if (response.success && response.data) {
                return response.data.demand
            } else {
                setError(response.error || 'Failed to create demand')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create demand')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { createDemand, isLoading, error }
}

// Hook for updating demands
export function useUpdateDemand() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateDemand = useCallback(async (id: string, data: UpdateDemandData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await demandsApi.update(id, data)

            if (response.success && response.data) {
                return response.data.demand
            } else {
                setError(response.error || 'Failed to update demand')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update demand')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { updateDemand, isLoading, error }
}
