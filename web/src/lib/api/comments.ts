import { apiGet, apiPost, apiPatch, apiDelete, buildQueryString } from './client'
import type { User } from './auth'

// Types
export interface Comment {
    id: string
    authorId: string
    postId: string | null
    issueId: string | null
    demandId: string | null
    parentId: string | null
    content: string
    isAnonymous: boolean
    createdAt: string
    updatedAt: string
    author: Pick<User, 'id' | 'name' | 'displayName' | 'avatar' | 'department'>
    replies?: Comment[]
    _count: {
        replies: number
        reactions: number
    }
}

export interface CommentsListParams {
    postId?: string
    issueId?: string
    demandId?: string
    parentId?: string
    page?: number
    limit?: number
}

export interface CreateCommentData {
    postId?: string
    issueId?: string
    demandId?: string
    parentId?: string
    content: string
    isAnonymous?: boolean
}

export interface Reaction {
    id: string
    userId: string
    postId: string | null
    commentId: string | null
    type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'
    createdAt: string
    user: Pick<User, 'id' | 'name' | 'avatar'>
}

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'

// Comments API Functions
export const commentsApi = {
    /**
     * Get comments for a resource
     */
    getList: async (params: CommentsListParams) => {
        const query = buildQueryString(params)
        return apiGet<{ comments: Comment[]; pagination: object }>(`/comments${query}`)
    },

    /**
     * Get a single comment with replies
     */
    getById: async (id: string) => {
        return apiGet<{ comment: Comment }>(`/comments/${id}`)
    },

    /**
     * Create a new comment
     */
    create: async (data: CreateCommentData) => {
        return apiPost<{ comment: Comment }>('/comments', data)
    },

    /**
     * Update a comment
     */
    update: async (id: string, content: string) => {
        return apiPatch<{ comment: Comment }>(`/comments/${id}`, { content })
    },

    /**
     * Delete a comment
     */
    delete: async (id: string) => {
        return apiDelete<null>(`/comments/${id}`)
    },

    /**
     * Reply to a comment
     */
    reply: async (parentId: string, data: Omit<CreateCommentData, 'parentId'>) => {
        return apiPost<{ comment: Comment }>('/comments', { ...data, parentId })
    },
}

// Reactions API Functions
export const reactionsApi = {
    /**
     * Add or toggle a reaction
     */
    toggle: async (data: { postId?: string; commentId?: string; type: ReactionType }) => {
        return apiPost<{ reaction: Reaction | null; action: 'added' | 'updated' | 'removed' }>(
            '/reactions',
            data
        )
    },

    /**
     * React to a post
     */
    reactToPost: async (postId: string, type: ReactionType) => {
        return apiPost<{ reaction: Reaction | null; action: string }>('/reactions', {
            postId,
            type,
        })
    },

    /**
     * React to a comment
     */
    reactToComment: async (commentId: string, type: ReactionType) => {
        return apiPost<{ reaction: Reaction | null; action: string }>('/reactions', {
            commentId,
            type,
        })
    },

    /**
     * Remove reaction from a post
     */
    removeFromPost: async (postId: string) => {
        return apiDelete<null>(`/reactions?postId=${postId}`)
    },

    /**
     * Remove reaction from a comment
     */
    removeFromComment: async (commentId: string) => {
        return apiDelete<null>(`/reactions?commentId=${commentId}`)
    },
}
