'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    issuesApi,
    type Issue,
    type IssuesListParams,
    type CreateIssueData,
    type UpdateIssueData,
    type IssueContribution,
    type CreateContributionData
} from '@/lib/api'

// Hook for fetching issues list
export function useIssues(initialParams: IssuesListParams = {}) {
    const [issues, setIssues] = useState<Issue[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        hasMore: boolean
    }>({ page: 1, limit: 20, total: 0, hasMore: false })

    const fetchIssues = useCallback(async (params: IssuesListParams = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await issuesApi.getList({ ...initialParams, ...params })

            if (response.success && response.data) {
                setIssues(response.data.issues)
                setPagination(response.data.pagination as typeof pagination)
            } else {
                setError(response.error || 'Failed to fetch issues')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch issues')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams])

    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return

        try {
            setIsLoading(true)
            const response = await issuesApi.getList({
                ...initialParams,
                page: pagination.page + 1,
            })

            if (response.success && response.data) {
                setIssues(prev => [...prev, ...response.data!.issues])
                setPagination(response.data.pagination as typeof pagination)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams, pagination, isLoading])

    const refresh = useCallback(() => fetchIssues({ page: 1 }), [fetchIssues])

    useEffect(() => {
        fetchIssues()
    }, [fetchIssues])

    return { issues, isLoading, error, pagination, loadMore, refresh, fetchIssues }
}

// Hook for single issue
export function useIssue(issueId: string | null) {
    const [issue, setIssue] = useState<Issue | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchIssue = useCallback(async () => {
        if (!issueId) {
            setIssue(null)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await issuesApi.getById(issueId)

            if (response.success && response.data) {
                setIssue(response.data.issue)
            } else {
                setError(response.error || 'Failed to fetch issue')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch issue')
        } finally {
            setIsLoading(false)
        }
    }, [issueId])

    useEffect(() => {
        fetchIssue()
    }, [fetchIssue])

    return { issue, isLoading, error, refresh: fetchIssue }
}

// Hook for creating issues
export function useCreateIssue() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createIssue = useCallback(async (data: CreateIssueData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await issuesApi.create(data)

            if (response.success && response.data) {
                return response.data.issue
            } else {
                setError(response.error || 'Failed to create issue')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create issue')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { createIssue, isLoading, error }
}

// Hook for updating issues
export function useUpdateIssue() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateIssue = useCallback(async (id: string, data: UpdateIssueData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await issuesApi.update(id, data)

            if (response.success && response.data) {
                return response.data.issue
            } else {
                setError(response.error || 'Failed to update issue')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update issue')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { updateIssue, isLoading, error }
}

// Hook for issue contributions
export function useIssueContributions(issueId: string | null) {
    const [contributions, setContributions] = useState<IssueContribution[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchContributions = useCallback(async () => {
        if (!issueId) return

        try {
            setIsLoading(true)
            setError(null)

            const response = await issuesApi.getContributions(issueId)

            if (response.success && response.data) {
                setContributions(response.data.contributions)
            } else {
                setError(response.error || 'Failed to fetch contributions')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch contributions')
        } finally {
            setIsLoading(false)
        }
    }, [issueId])

    const addContribution = useCallback(async (data: CreateContributionData) => {
        if (!issueId) return null

        try {
            setIsLoading(true)
            setError(null)

            const response = await issuesApi.addContribution(issueId, data)

            if (response.success && response.data) {
                setContributions(prev => [response.data!.contribution, ...prev])
                return response.data.contribution
            } else {
                setError(response.error || 'Failed to add contribution')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add contribution')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [issueId])

    useEffect(() => {
        fetchContributions()
    }, [fetchContributions])

    return { contributions, isLoading, error, refresh: fetchContributions, addContribution }
}
