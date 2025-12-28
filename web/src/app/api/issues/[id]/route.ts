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

// GET /api/issues/[id] - Get a single issue with full details
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const issue = await prisma.issue.findUnique({
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
                contributions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                avatar: true,
                                department: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
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
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        contributions: true,
                    },
                },
            },
        })

        if (!issue) {
            return notFoundResponse('Issue not found')
        }

        // Increment view count
        await prisma.issue.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        })

        return successResponse({ issue })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/issues/[id] - Update an issue
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { title, description, status, priority, category, location } = body

        const issue = await prisma.issue.findUnique({
            where: { id },
        })

        if (!issue) {
            return notFoundResponse('Issue not found')
        }

        // Only author, admin, or moderator can update
        const isAuthor = issue.authorId === user.id
        const canModerate = user.isAdmin || user.isModerator

        if (!isAuthor && !canModerate) {
            return forbiddenResponse('You do not have permission to edit this issue')
        }

        // Validation
        const errors: Record<string, string[]> = {}

        if (title !== undefined) {
            if (title.trim().length < 5) {
                errors.title = ['Title must be at least 5 characters']
            } else if (title.length > 200) {
                errors.title = ['Title must be less than 200 characters']
            }
        }

        if (description !== undefined) {
            if (description.trim().length < 20) {
                errors.description = ['Description must be at least 20 characters']
            } else if (description.length > 10000) {
                errors.description = ['Description must be less than 10000 characters']
            }
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Track status change for contribution log
        const statusChanged = status && status !== issue.status

        const updatedIssue = await prisma.issue.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(description !== undefined && { description: description.trim() }),
                ...(status !== undefined && { status }),
                ...(priority !== undefined && { priority }),
                ...(category !== undefined && { category }),
                ...(location !== undefined && { location }),
                ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
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
                        contributions: true,
                    },
                },
            },
        })

        // Add contribution for status change
        if (statusChanged) {
            await prisma.issueContribution.create({
                data: {
                    issueId: id,
                    userId: user.id,
                    type: 'UPDATE',
                    content: `Status changed to ${status}`,
                },
            })
        }

        return successResponse({ issue: updatedIssue }, 'Issue updated successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/issues/[id] - Delete an issue
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params

        const issue = await prisma.issue.findUnique({
            where: { id },
        })

        if (!issue) {
            return notFoundResponse('Issue not found')
        }

        if (issue.authorId !== user.id && !user.isAdmin) {
            return forbiddenResponse('You can only delete your own issues')
        }

        await prisma.issue.delete({
            where: { id },
        })

        return successResponse(null, 'Issue deleted successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
