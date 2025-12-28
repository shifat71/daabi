'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    postsApi,
    type Post,
    type PostsListParams,
    type CreatePostData,
    type UpdatePostData
} from '@/lib/api'

// Hook for fetching posts list
export function usePosts(initialParams: PostsListParams = {}) {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        hasMore: boolean
    }>({ page: 1, limit: 20, total: 0, hasMore: false })

    const fetchPosts = useCallback(async (params: PostsListParams = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await postsApi.getList({ ...initialParams, ...params })

            if (response.success && response.data) {
                setPosts(response.data.posts)
                setPagination(response.data.pagination as typeof pagination)
            } else {
                setError(response.error || 'Failed to fetch posts')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch posts')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams])

    // Load more posts (for infinite scroll)
    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return

        try {
            setIsLoading(true)
            const response = await postsApi.getList({
                ...initialParams,
                page: pagination.page + 1,
            })

            if (response.success && response.data) {
                setPosts(prev => [...prev, ...response.data!.posts])
                setPagination(response.data.pagination as typeof pagination)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams, pagination, isLoading])

    // Refresh posts
    const refresh = useCallback(() => fetchPosts({ page: 1 }), [fetchPosts])

    // Initial fetch
    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    return {
        posts,
        isLoading,
        error,
        pagination,
        loadMore,
        refresh,
        fetchPosts,
    }
}

// Hook for single post
export function usePost(postId: string | null) {
    const [post, setPost] = useState<Post | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPost = useCallback(async () => {
        if (!postId) {
            setPost(null)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await postsApi.getById(postId)

            if (response.success && response.data) {
                setPost(response.data.post)
            } else {
                setError(response.error || 'Failed to fetch post')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch post')
        } finally {
            setIsLoading(false)
        }
    }, [postId])

    useEffect(() => {
        fetchPost()
    }, [fetchPost])

    return { post, isLoading, error, refresh: fetchPost }
}

// Hook for creating posts
export function useCreatePost() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createPost = useCallback(async (data: CreatePostData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await postsApi.create(data)

            if (response.success && response.data) {
                return response.data.post
            } else {
                setError(response.error || 'Failed to create post')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { createPost, isLoading, error }
}

// Hook for updating posts
export function useUpdatePost() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updatePost = useCallback(async (id: string, data: UpdatePostData) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await postsApi.update(id, data)

            if (response.success && response.data) {
                return response.data.post
            } else {
                setError(response.error || 'Failed to update post')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update post')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { updatePost, isLoading, error }
}

// Hook for deleting posts
export function useDeletePost() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deletePost = useCallback(async (id: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await postsApi.delete(id)

            if (response.success) {
                return true
            } else {
                setError(response.error || 'Failed to delete post')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete post')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { deletePost, isLoading, error }
}
