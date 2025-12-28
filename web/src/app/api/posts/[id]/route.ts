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

type Params = { params: Promise<{ id: string }> }

// GET /api/posts/[id] - Get a single post
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const post = await prisma.post.findUnique({
            where: { id },
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
                comments: {
                    where: { parentId: null },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                avatar: true,
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
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                        _count: {
                            select: { reactions: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                reactions: {
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
                _count: {
                    select: {
                        comments: true,
                        reactions: true,
                    },
                },
            },
        })

        if (!post) {
            return notFoundResponse('Post not found')
        }

        // Increment view count
        await prisma.post.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        })

        return successResponse({ post })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/posts/[id] - Update a post
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { content, visibility } = body

        const post = await prisma.post.findUnique({
            where: { id },
        })

        if (!post) {
            return notFoundResponse('Post not found')
        }

        if (post.authorId !== user.id && !user.isAdmin && !user.isModerator) {
            return forbiddenResponse('You can only edit your own posts')
        }

        // Validation
        const errors: Record<string, string[]> = {}

        if (content !== undefined) {
            if (content.trim().length === 0) {
                errors.content = ['Content cannot be empty']
            } else if (content.length > 5000) {
                errors.content = ['Content must be less than 5000 characters']
            }
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                ...(content !== undefined && { content: content.trim() }),
                ...(visibility !== undefined && { visibility }),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatar: true,
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

        return successResponse({ post: updatedPost }, 'Post updated successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params

        const post = await prisma.post.findUnique({
            where: { id },
        })

        if (!post) {
            return notFoundResponse('Post not found')
        }

        if (post.authorId !== user.id && !user.isAdmin && !user.isModerator) {
            return forbiddenResponse('You can only delete your own posts')
        }

        await prisma.post.delete({
            where: { id },
        })

        return successResponse(null, 'Post deleted successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
