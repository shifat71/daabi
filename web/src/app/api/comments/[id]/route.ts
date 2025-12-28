import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

// GET /api/comments/[id] - Get a single comment with replies
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const comment = await prisma.comment.findUnique({
            where: { id },
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
                        replies: true,
                        reactions: true,
                    },
                },
            },
        })

        if (!comment) {
            return notFoundResponse('Comment not found')
        }

        return successResponse({ comment })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/comments/[id] - Update a comment
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { content } = body

        const comment = await prisma.comment.findUnique({
            where: { id },
        })

        if (!comment) {
            return notFoundResponse('Comment not found')
        }

        if (comment.authorId !== user.id && !user.isAdmin && !user.isModerator) {
            return forbiddenResponse('You can only edit your own comments')
        }

        // Validation
        const errors: Record<string, string[]> = {}

        if (!content || content.trim().length < 1) {
            errors.content = ['Comment cannot be empty']
        } else if (content.length > 2000) {
            errors.content = ['Comment must be less than 2000 characters']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                content: content.trim(),
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
                _count: {
                    select: {
                        replies: true,
                        reactions: true,
                    },
                },
            },
        })

        return successResponse({ comment: updatedComment }, 'Comment updated')
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params

        const comment = await prisma.comment.findUnique({
            where: { id },
        })

        if (!comment) {
            return notFoundResponse('Comment not found')
        }

        if (comment.authorId !== user.id && !user.isAdmin && !user.isModerator) {
            return forbiddenResponse('You can only delete your own comments')
        }

        await prisma.comment.delete({
            where: { id },
        })

        return successResponse(null, 'Comment deleted')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
