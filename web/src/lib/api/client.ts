// API Configuration and Utilities
const API_BASE = '/api'

export interface ApiResponse<T> {
    success: boolean
    message?: string
    data?: T
    error?: string
    errors?: Record<string, string[]>
}

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
}

export interface PaginatedResponse<T> {
    items: T[]
    pagination: PaginationInfo
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        const data = await response.json()
        return data
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        }
    }
}

// GET request
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, { method: 'GET' })
}

// POST request
export async function apiPost<T>(
    endpoint: string,
    body: unknown
): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

// PATCH request
export async function apiPatch<T>(
    endpoint: string,
    body: unknown
): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
}

// DELETE request
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, { method: 'DELETE' })
}

// File upload
export async function apiUpload<T>(
    endpoint: string,
    formData: FormData
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
        })

        const data = await response.json()
        return data
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }
    }
}

// Build query string from params
export function buildQueryString(params: object): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
        }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
}
