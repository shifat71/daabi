'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    commentsApi,
    reactionsApi,
    type Comment,
    type CommentsListParams,
    type CreateCommentData,
    type ReactionType
} from '@/lib/api'

// Hook for fetching comments
export function useComments(params: CommentsListParams) {
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        hasMore: boolean
    }>({ page: 1, limit: 20, total: 0, hasMore: false })

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await commentsApi.getList(params)

            if (response.success && response.data) {
                setComments(response.data.comments)
                setPagination(response.data.pagination as typeof pagination)
            } else {
                setError(response.error || 'Failed to fetch comments')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch comments')
        } finally {
            setIsLoading(false)
        }
    }, [params])

    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return

        try {
            setIsLoading(true)
            const response = await commentsApi.getList({
                ...params,
                page: pagination.page + 1,
            })

            if (response.success && response.data) {
                setComments(prev => [...prev, ...response.data!.comments])
                setPagination(response.data.pagination as typeof pagination)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more')
        } finally {
            setIsLoading(false)
        }
    }, [params, pagination, isLoading])

    const addComment = useCallback(async (data: CreateCommentData) => {
        try {
            const response = await commentsApi.create(data)

            if (response.success && response.data) {
                setComments(prev => [response.data!.comment, ...prev])
                return response.data.comment
            } else {
                setError(response.error || 'Failed to add comment')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add comment')
            return null
        }
    }, [])

    const deleteComment = useCallback(async (commentId: string) => {
        try {
            const response = await commentsApi.delete(commentId)

            if (response.success) {
                setComments(prev => prev.filter(c => c.id !== commentId))
                return true
            } else {
                setError(response.error || 'Failed to delete comment')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete comment')
            return false
        }
    }, [])

    useEffect(() => {
        if (params.postId || params.issueId || params.demandId) {
            fetchComments()
        }
    }, [fetchComments, params.postId, params.issueId, params.demandId])

    return {
        comments,
        isLoading,
        error,
        pagination,
        loadMore,
        refresh: fetchComments,
        addComment,
        deleteComment
    }
}

// Hook for reactions
export function useReactions() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const reactToPost = useCallback(async (postId: string, type: ReactionType) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await reactionsApi.reactToPost(postId, type)

            if (response.success && response.data) {
                return response.data
            } else {
                setError(response.error || 'Failed to react')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to react')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const reactToComment = useCallback(async (commentId: string, type: ReactionType) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await reactionsApi.reactToComment(commentId, type)

            if (response.success && response.data) {
                return response.data
            } else {
                setError(response.error || 'Failed to react')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to react')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const removeReactionFromPost = useCallback(async (postId: string) => {
        try {
            setIsLoading(true)
            const response = await reactionsApi.removeFromPost(postId)
            return response.success
        } catch {
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { reactToPost, reactToComment, removeReactionFromPost, isLoading, error }
}
