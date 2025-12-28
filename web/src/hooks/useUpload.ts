'use client'

import { useState, useCallback, useRef } from 'react'
import {
    uploadApi,
    validateFile,
    FILE_TYPES,
    type UploadedFile
} from '@/lib/api'

interface UploadOptions {
    category?: string
    maxSize?: number
    allowedTypes?: string[]
    onProgress?: (progress: number) => void
}

// Hook for file uploads
export function useFileUpload(defaultOptions: UploadOptions = {}) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

    const uploadFile = useCallback(async (
        file: File,
        options: UploadOptions = {}
    ): Promise<UploadedFile | null> => {
        const mergedOptions = { ...defaultOptions, ...options }

        // Validate file
        const validation = validateFile(file, {
            maxSize: mergedOptions.maxSize,
            allowedTypes: mergedOptions.allowedTypes,
        })

        if (!validation.valid) {
            setError(validation.error || 'Invalid file')
            return null
        }

        try {
            setIsUploading(true)
            setError(null)
            setProgress(0)

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90))
            }, 100)

            const response = await uploadApi.uploadFile(file, mergedOptions.category)

            clearInterval(progressInterval)
            setProgress(100)

            if (response.success && response.data) {
                setUploadedFiles(prev => [...prev, response.data!])
                return response.data
            } else {
                setError(response.error || 'Upload failed')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            return null
        } finally {
            setIsUploading(false)
            setTimeout(() => setProgress(0), 500)
        }
    }, [defaultOptions])

    const uploadMultiple = useCallback(async (
        files: File[],
        options: UploadOptions = {}
    ) => {
        const mergedOptions = { ...defaultOptions, ...options }

        try {
            setIsUploading(true)
            setError(null)
            setProgress(0)

            const response = await uploadApi.uploadFiles(files, mergedOptions.category)

            setProgress(100)

            if (response.success && response.data) {
                setUploadedFiles(prev => [...prev, ...response.data!.uploaded])
                return response.data
            } else {
                setError(response.error || 'Upload failed')
                return null
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            return null
        } finally {
            setIsUploading(false)
            setTimeout(() => setProgress(0), 500)
        }
    }, [defaultOptions])

    const removeUploadedFile = useCallback((fileUrl: string) => {
        setUploadedFiles(prev => prev.filter(f => f.url !== fileUrl))
    }, [])

    const clearUploads = useCallback(() => {
        setUploadedFiles([])
        setError(null)
    }, [])

    return {
        uploadFile,
        uploadMultiple,
        isUploading,
        progress,
        error,
        uploadedFiles,
        removeUploadedFile,
        clearUploads
    }
}

// Hook for image uploads with preview
export function useImageUpload(category: string = 'images') {
    const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([])
    const {
        uploadFile,
        uploadMultiple,
        isUploading,
        progress,
        error,
        uploadedFiles,
        removeUploadedFile,
        clearUploads
    } = useFileUpload({
        category,
        allowedTypes: FILE_TYPES.images
    })

    const addPreview = useCallback((file: File) => {
        const preview = URL.createObjectURL(file)
        setPreviews(prev => [...prev, { file, preview }])
        return preview
    }, [])

    const removePreview = useCallback((preview: string) => {
        setPreviews(prev => {
            const item = prev.find(p => p.preview === preview)
            if (item) {
                URL.revokeObjectURL(item.preview)
            }
            return prev.filter(p => p.preview !== preview)
        })
    }, [])

    const clearPreviews = useCallback(() => {
        previews.forEach(p => URL.revokeObjectURL(p.preview))
        setPreviews([])
    }, [previews])

    const uploadAllPreviews = useCallback(async () => {
        if (previews.length === 0) return []

        const files = previews.map(p => p.file)
        const result = await uploadMultiple(files)

        if (result) {
            clearPreviews()
            return result.uploaded
        }

        return []
    }, [previews, uploadMultiple, clearPreviews])

    return {
        previews,
        addPreview,
        removePreview,
        clearPreviews,
        uploadFile,
        uploadAllPreviews,
        isUploading,
        progress,
        error,
        uploadedFiles,
        removeUploadedFile,
        clearUploads
    }
}

// Hook for drag and drop file uploads
export function useDragAndDrop(onFilesDropped?: (files: File[]) => void) {
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true)
        }
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current--
        if (dragCounter.current === 0) {
            setIsDragging(false)
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        dragCounter.current = 0

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
            onFilesDropped?.(files)
            e.dataTransfer.clearData()
        }
    }, [onFilesDropped])

    return {
        isDragging,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        }
    }
}
