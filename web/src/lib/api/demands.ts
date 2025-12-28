import { apiGet, apiPost, apiPatch, apiDelete, buildQueryString } from './client'
import type { User } from './auth'
import type { Media } from './posts'

// Types
export interface DemandEvent {
    id: string
    demandId: string
    title: string
    description: string | null
    location: string | null
    startTime: string
    endTime: string | null
}

export interface Demand {
    id: string
    authorId: string
    title: string
    description: string
    category: 'DEPARTMENT' | 'HALL' | 'CLUB' | 'ENVIRONMENT' | 'INFRASTRUCTURE' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'OTHER'
    status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'REJECTED' | 'RESOLVED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    targetEntity: string | null
    agreeCount: number
    disagreeCount: number
    viewCount: number
    createdAt: string
    updatedAt: string
    resolvedAt: string | null
    author: Pick<User, 'id' | 'name' | 'displayName' | 'avatar' | 'department'>
    media: Media[]
    events?: DemandEvent[]
    _count: {
        comments: number
        votes: number
        issues: number
        events: number
    }
}

export interface DemandsListParams {
    page?: number
    limit?: number
    category?: string
    status?: string
    sortBy?: 'popular' | 'recent' | 'votes'
}

export interface CreateDemandData {
    title: string
    description: string
    category: string
    targetEntity?: string
    priority?: string
    media?: { url: string; type: string; caption?: string }[]
}

export interface UpdateDemandData {
    title?: string
    description?: string
    status?: string
    priority?: string
    category?: string
    targetEntity?: string
}

export type VoteType = 'AGREE' | 'DISAGREE'

// Demands API Functions
export const demandsApi = {
    /**
     * Get paginated demands list
     */
    getList: async (params: DemandsListParams = {}) => {
        const query = buildQueryString(params)
        return apiGet<{ demands: Demand[]; pagination: object }>(`/demands${query}`)
    },

    /**
     * Get a single demand by ID
     */
    getById: async (id: string) => {
        return apiGet<{ demand: Demand; userVote: VoteType | null }>(`/demands/${id}`)
    },

    /**
     * Create a new demand
     */
    create: async (data: CreateDemandData) => {
        return apiPost<{ demand: Demand }>('/demands', data)
    },

    /**
     * Update a demand
     */
    update: async (id: string, data: UpdateDemandData) => {
        return apiPatch<{ demand: Demand }>(`/demands/${id}`, data)
    },

    /**
     * Delete a demand
     */
    delete: async (id: string) => {
        return apiDelete<null>(`/demands/${id}`)
    },

    /**
     * Vote on a demand (agree/disagree)
     */
    vote: async (demandId: string, voteType: VoteType) => {
        return apiPost<{ voteType: VoteType | null; message: string }>(
            `/demands/${demandId}/vote`,
            { voteType }
        )
    },
}
