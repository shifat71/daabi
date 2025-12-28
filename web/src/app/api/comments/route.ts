import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// GET /api/comments - Get comments for a specific resource
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('postId')
        const issueId = searchParams.get('issueId')
        const demandId = searchParams.get('demandId')
        const parentId = searchParams.get('parentId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        if (!postId && !issueId && !demandId) {
            return errorResponse('One of postId, issueId, or demandId is required', 400)
        }

        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {}

        if (postId) where.postId = postId
        if (issueId) where.issueId = issueId
        if (demandId) where.demandId = demandId
        if (parentId) {
            where.parentId = parentId
        } else {
            where.parentId = null // Only get top-level comments
        }

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            avatar: true,
                            department: true,
                        },
                    },
                    replies: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    displayName: true,
                                    avatar: true,
                                },
                            },
                            _count: {
                                select: { reactions: true },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                        take: 5,
                    },
                    _count: {
                        select: {
                            replies: true,
                            reactions: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.comment.count({ where }),
        ])

        return successResponse({
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + comments.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const body = await request.json()
        const { postId, issueId, demandId, parentId, content, isAnonymous = false } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!postId && !issueId && !demandId) {
            errors.target = ['One of postId, issueId, or demandId is required']
        }

        if (!content || content.trim().length < 1) {
            errors.content = ['Comment cannot be empty']
        } else if (content.length > 2000) {
            errors.content = ['Comment must be less than 2000 characters']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Verify parent comment exists if provided
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
            })
            if (!parentComment) {
                return notFoundResponse('Parent comment not found')
            }
        }

        const comment = await prisma.comment.create({
            data: {
                authorId: user.id,
                postId: postId || null,
                issueId: issueId || null,
                demandId: demandId || null,
                parentId: parentId || null,
                content: content.trim(),
                isAnonymous,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                        department: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                        reactions: true,
                    },
                },
            },
        })

        return successResponse({ comment }, 'Comment added', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
