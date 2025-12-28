import { apiGet, apiPost, apiPatch, apiDelete, buildQueryString } from './client'
import type { User } from './auth'

// Types
export interface Media {
    id: string
    url: string
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    caption: string | null
    order: number
}

export interface Post {
    id: string
    authorId: string
    content: string
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL'
    visibility: 'PUBLIC' | 'CAMPUS_ONLY' | 'DEPARTMENT_ONLY' | 'PRIVATE'
    isPinned: boolean
    isAnonymous: boolean
    viewCount: number
    createdAt: string
    updatedAt: string
    author: Pick<User, 'id' | 'name' | 'displayName' | 'avatar' | 'department'>
    media: Media[]
    _count: {
        comments: number
        reactions: number
    }
}

export interface PostsListParams {
    page?: number
    limit?: number
    type?: string
    authorId?: string
}

export interface CreatePostData {
    content: string
    type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL'
    visibility?: 'PUBLIC' | 'CAMPUS_ONLY' | 'DEPARTMENT_ONLY' | 'PRIVATE'
    isAnonymous?: boolean
    media?: { url: string; type: string; caption?: string }[]
}

export interface UpdatePostData {
    content?: string
    visibility?: string
}

// Posts API Functions
export const postsApi = {
    /**
     * Get paginated posts feed
     */
    getList: async (params: PostsListParams = {}) => {
        const query = buildQueryString(params)
        return apiGet<{ posts: Post[]; pagination: object }>(`/posts${query}`)
    },

    /**
     * Get a single post by ID
     */
    getById: async (id: string) => {
        return apiGet<{ post: Post }>(`/posts/${id}`)
    },

    /**
     * Create a new post
     */
    create: async (data: CreatePostData) => {
        return apiPost<{ post: Post }>('/posts', data)
    },

    /**
     * Update a post
     */
    update: async (id: string, data: UpdatePostData) => {
        return apiPatch<{ post: Post }>(`/posts/${id}`, data)
    },

    /**
     * Delete a post
     */
    delete: async (id: string) => {
        return apiDelete<null>(`/posts/${id}`)
    },
}
