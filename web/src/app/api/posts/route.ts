import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// GET /api/posts - Get paginated posts feed
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const type = searchParams.get('type') // TEXT, IMAGE, VIDEO, etc.
        const authorId = searchParams.get('authorId')

        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {
            visibility: 'PUBLIC',
        }

        if (type) {
            where.type = type
        }

        if (authorId) {
            where.authorId = authorId
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            avatar: true,
                            department: true,
                            batch: true,
                        },
                    },
                    media: {
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            comments: true,
                            reactions: true,
                        },
                    },
                    reactions: {
                        take: 5,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ])

        return successResponse({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + posts.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const body = await request.json()
        const { content, type = 'TEXT', visibility = 'PUBLIC', isAnonymous = false, media = [] } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!content || content.trim().length === 0) {
            errors.content = ['Content is required']
        } else if (content.length > 5000) {
            errors.content = ['Content must be less than 5000 characters']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const post = await prisma.post.create({
            data: {
                authorId: user.id,
                content: content.trim(),
                type,
                visibility,
                isAnonymous,
                media: {
                    create: media.map((m: { url: string; type: string; caption?: string }, index: number) => ({
                        url: m.url,
                        type: m.type,
                        caption: m.caption,
                        order: index,
                    })),
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                        department: true,
                        batch: true,
                    },
                },
                media: true,
                _count: {
                    select: {
                        comments: true,
                        reactions: true,
                    },
                },
            },
        })

        return successResponse({ post }, 'Post created successfully', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
