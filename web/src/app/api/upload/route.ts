import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse
} from '@/lib/api-response'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf']

// Ensure upload directory exists
async function ensureUploadDir(subDir: string) {
    const fullPath = path.join(UPLOAD_DIR, subDir)
    if (!existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true })
    }
    return fullPath
}

// Generate unique filename
function generateFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = path.extname(originalName).toLowerCase()
    const safeName = path.basename(originalName, ext)
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 20)
    return `${safeName}_${timestamp}_${random}${ext}`
}

// Determine media type from MIME type
function getMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | null {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'IMAGE'
    if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'VIDEO'
    if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'DOCUMENT'
    return null
}

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const category = (formData.get('category') as string) || 'general'

        if (!file) {
            return errorResponse('No file provided', 400)
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return errorResponse('File size exceeds 10MB limit', 400)
        }

        // Validate file type
        const mediaType = getMediaType(file.type)
        if (!mediaType) {
            return errorResponse(
                `Invalid file type. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES].join(', ')}`,
                400
            )
        }

        // Create user-specific directory
        const subDir = `${user.id}/${category}`
        const uploadPath = await ensureUploadDir(subDir)

        // Generate filename and save
        const filename = generateFilename(file.name)
        const filePath = path.join(uploadPath, filename)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Generate public URL
        const publicUrl = `/uploads/${subDir}/${filename}`

        return successResponse({
            url: publicUrl,
            type: mediaType,
            filename: filename,
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
        }, 'File uploaded successfully', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/upload/multiple - Upload multiple files
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const category = (formData.get('category') as string) || 'general'

        if (!files || files.length === 0) {
            return errorResponse('No files provided', 400)
        }

        if (files.length > 10) {
            return errorResponse('Maximum 10 files allowed per upload', 400)
        }

        const subDir = `${user.id}/${category}`
        const uploadPath = await ensureUploadDir(subDir)

        const uploadedFiles = []
        const errors = []

        for (const file of files) {
            try {
                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                    errors.push({ name: file.name, error: 'File size exceeds 10MB limit' })
                    continue
                }

                // Validate file type
                const mediaType = getMediaType(file.type)
                if (!mediaType) {
                    errors.push({ name: file.name, error: 'Invalid file type' })
                    continue
                }

                // Generate filename and save
                const filename = generateFilename(file.name)
                const filePath = path.join(uploadPath, filename)

                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)
                await writeFile(filePath, buffer)

                const publicUrl = `/uploads/${subDir}/${filename}`

                uploadedFiles.push({
                    url: publicUrl,
                    type: mediaType,
                    filename: filename,
                    originalName: file.name,
                    size: file.size,
                    mimeType: file.type,
                })
            } catch (err) {
                errors.push({
                    name: file.name,
                    error: err instanceof Error ? err.message : 'Upload failed'
                })
            }
        }

        return successResponse({
            uploaded: uploadedFiles,
            errors: errors.length > 0 ? errors : undefined,
            totalUploaded: uploadedFiles.length,
            totalFailed: errors.length,
        }, `${uploadedFiles.length} file(s) uploaded successfully`)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
