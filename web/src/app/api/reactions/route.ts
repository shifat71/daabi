import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse
} from '@/lib/api-response'

// POST /api/reactions - Add or toggle a reaction
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const body = await request.json()
        const { postId, commentId, type } = body

        if (!postId && !commentId) {
            return errorResponse('Either postId or commentId is required', 400)
        }

        if (postId && commentId) {
            return errorResponse('Cannot react to both post and comment at once', 400)
        }

        const validTypes = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY']
        if (!type || !validTypes.includes(type)) {
            return errorResponse(`Reaction type must be one of: ${validTypes.join(', ')}`, 400)
        }

        // Check for existing reaction
        const existingReaction = await prisma.reaction.findFirst({
            where: {
                userId: user.id,
                ...(postId ? { postId } : {}),
                ...(commentId ? { commentId } : {}),
            },
        })

        if (existingReaction) {
            if (existingReaction.type === type) {
                // Same reaction - remove it (toggle off)
                await prisma.reaction.delete({
                    where: { id: existingReaction.id },
                })

                return successResponse({
                    reaction: null,
                    action: 'removed'
                })
            } else {
                // Different reaction - update it
                const updatedReaction = await prisma.reaction.update({
                    where: { id: existingReaction.id },
                    data: { type },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                })

                return successResponse({
                    reaction: updatedReaction,
                    action: 'updated'
                })
            }
        } else {
            // New reaction
            const reaction = await prisma.reaction.create({
                data: {
                    userId: user.id,
                    postId: postId || null,
                    commentId: commentId || null,
                    type,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            })

            return successResponse({
                reaction,
                action: 'added'
            }, undefined, 201)
        }
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/reactions - Remove a reaction
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('postId')
        const commentId = searchParams.get('commentId')

        if (!postId && !commentId) {
            return errorResponse('Either postId or commentId is required', 400)
        }

        const reaction = await prisma.reaction.findFirst({
            where: {
                userId: user.id,
                ...(postId ? { postId } : {}),
                ...(commentId ? { commentId } : {}),
            },
        })

        if (reaction) {
            await prisma.reaction.delete({
                where: { id: reaction.id },
            })
        }

        return successResponse(null, 'Reaction removed')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
