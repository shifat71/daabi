import { apiGet, apiPost, apiPatch, apiDelete, buildQueryString } from './client'
import type { User } from './auth'
import type { Media } from './posts'

// Types
export interface IssueContribution {
    id: string
    issueId: string
    userId: string
    type: 'UPDATE' | 'COMMENT' | 'EVIDENCE' | 'SOLUTION' | 'ESCALATION'
    content: string
    upvotes: number
    downvotes: number
    createdAt: string
    user: Pick<User, 'id' | 'name' | 'displayName' | 'avatar' | 'department'>
}

export interface Issue {
    id: string
    authorId: string
    title: string
    description: string
    status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'DISCUSSED' | 'ACTION_TAKEN' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: string | null
    location: string | null
    isAnonymous: boolean
    viewCount: number
    createdAt: string
    updatedAt: string
    resolvedAt: string | null
    author: Pick<User, 'id' | 'name' | 'displayName' | 'avatar' | 'department'>
    media: Media[]
    contributions?: IssueContribution[]
    _count: {
        comments: number
        contributions: number
    }
}

export interface IssuesListParams {
    page?: number
    limit?: number
    status?: string
    category?: string
    priority?: string
    sortBy?: 'activity' | 'recent' | 'votes'
}

export interface CreateIssueData {
    title: string
    description: string
    category?: string
    location?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    isAnonymous?: boolean
    media?: { url: string; type: string; caption?: string }[]
}

export interface UpdateIssueData {
    title?: string
    description?: string
    status?: string
    priority?: string
    category?: string
    location?: string
}

export interface CreateContributionData {
    type: 'UPDATE' | 'COMMENT' | 'EVIDENCE' | 'SOLUTION' | 'ESCALATION'
    content: string
}

// Issues API Functions
export const issuesApi = {
    /**
     * Get paginated issues list
     */
    getList: async (params: IssuesListParams = {}) => {
        const query = buildQueryString(params)
        return apiGet<{ issues: Issue[]; pagination: object }>(`/issues${query}`)
    },

    /**
     * Get a single issue by ID
     */
    getById: async (id: string) => {
        return apiGet<{ issue: Issue }>(`/issues/${id}`)
    },

    /**
     * Create a new issue
     */
    create: async (data: CreateIssueData) => {
        return apiPost<{ issue: Issue }>('/issues', data)
    },

    /**
     * Update an issue
     */
    update: async (id: string, data: UpdateIssueData) => {
        return apiPatch<{ issue: Issue }>(`/issues/${id}`, data)
    },

    /**
     * Delete an issue
     */
    delete: async (id: string) => {
        return apiDelete<null>(`/issues/${id}`)
    },

    /**
     * Get contributions for an issue
     */
    getContributions: async (issueId: string, params: { page?: number; limit?: number } = {}) => {
        const query = buildQueryString(params)
        return apiGet<{ contributions: IssueContribution[]; pagination: object }>(
            `/issues/${issueId}/contributions${query}`
        )
    },

    /**
     * Add a contribution to an issue
     */
    addContribution: async (issueId: string, data: CreateContributionData) => {
        return apiPost<{ contribution: IssueContribution }>(
            `/issues/${issueId}/contributions`,
            data
        )
    },
}
