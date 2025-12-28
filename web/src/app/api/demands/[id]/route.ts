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

// GET /api/demands/[id] - Get a single demand with full details
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const user = await getCurrentUser()

        const demand = await prisma.demand.findUnique({
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
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                },
                events: {
                    orderBy: { startTime: 'asc' },
                },
                issues: {
                    include: {
                        issue: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                            },
                        },
                    },
                },
                crowdfunding: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        votes: true,
                        issues: true,
                        events: true,
                    },
                },
            },
        })

        if (!demand) {
            return notFoundResponse('Demand not found')
        }

        // Check if current user has voted
        let userVote = null
        if (user) {
            const vote = await prisma.demandVote.findUnique({
                where: {
                    demandId_userId: {
                        demandId: id,
                        userId: user.id,
                    },
                },
            })
            userVote = vote?.voteType || null
        }

        // Increment view count
        await prisma.demand.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        })

        return successResponse({ demand, userVote })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/demands/[id] - Update a demand
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { title, description, status, priority, category, targetEntity } = body

        const demand = await prisma.demand.findUnique({
            where: { id },
        })

        if (!demand) {
            return notFoundResponse('Demand not found')
        }

        const isAuthor = demand.authorId === user.id
        const canModerate = user.isAdmin || user.isModerator

        if (!isAuthor && !canModerate) {
            return forbiddenResponse('You do not have permission to edit this demand')
        }

        // Validation
        const errors: Record<string, string[]> = {}

        if (title !== undefined) {
            if (title.trim().length < 10) {
                errors.title = ['Title must be at least 10 characters']
            } else if (title.length > 300) {
                errors.title = ['Title must be less than 300 characters']
            }
        }

        if (description !== undefined) {
            if (description.trim().length < 50) {
                errors.description = ['Description must be at least 50 characters']
            } else if (description.length > 20000) {
                errors.description = ['Description must be less than 20000 characters']
            }
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const updatedDemand = await prisma.demand.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(description !== undefined && { description: description.trim() }),
                ...(status !== undefined && canModerate && { status }),
                ...(priority !== undefined && { priority }),
                ...(category !== undefined && { category }),
                ...(targetEntity !== undefined && { targetEntity }),
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
                        votes: true,
                    },
                },
            },
        })

        return successResponse({ demand: updatedDemand }, 'Demand updated successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/demands/[id] - Delete a demand
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params

        const demand = await prisma.demand.findUnique({
            where: { id },
        })

        if (!demand) {
            return notFoundResponse('Demand not found')
        }

        if (demand.authorId !== user.id && !user.isAdmin) {
            return forbiddenResponse('You can only delete your own demands')
        }

        await prisma.demand.delete({
            where: { id },
        })

        return successResponse(null, 'Demand deleted successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
