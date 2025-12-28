import { apiUpload } from './client'

// Types
export interface UploadedFile {
    url: string
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    filename: string
    originalName: string
    size: number
    mimeType: string
}

export interface MultiUploadResult {
    uploaded: UploadedFile[]
    errors?: { name: string; error: string }[]
    totalUploaded: number
    totalFailed: number
}

// Upload API Functions
export const uploadApi = {
    /**
     * Upload a single file
     */
    uploadFile: async (file: File, category: string = 'general') => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)

        return apiUpload<UploadedFile>('/upload', formData)
    },

    /**
     * Upload multiple files
     */
    uploadFiles: async (files: File[], category: string = 'general') => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('category', category)

        // Use PUT for multiple files
        const response = await fetch('/api/upload', {
            method: 'PUT',
            body: formData,
        })

        return response.json() as Promise<{ success: boolean; data?: MultiUploadResult; error?: string }>
    },

    /**
     * Upload an image for a post
     */
    uploadPostImage: async (file: File) => {
        return uploadApi.uploadFile(file, 'posts')
    },

    /**
     * Upload an image for an issue
     */
    uploadIssueImage: async (file: File) => {
        return uploadApi.uploadFile(file, 'issues')
    },

    /**
     * Upload an image for a marketplace item
     */
    uploadMarketplaceImage: async (file: File) => {
        return uploadApi.uploadFile(file, 'marketplace')
    },

    /**
     * Upload a profile avatar
     */
    uploadAvatar: async (file: File) => {
        return uploadApi.uploadFile(file, 'avatars')
    },
}

// Helper function to validate file before upload
export function validateFile(
    file: File,
    options: {
        maxSize?: number // in bytes
        allowedTypes?: string[]
    } = {}
): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
        }
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        }
    }

    return { valid: true }
}

// Commonly used file type groups
export const FILE_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    videos: ['video/mp4', 'video/webm', 'video/quicktime'],
    documents: ['application/pdf'],
    all: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf',
    ],
}
