import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    unauthorizedResponse,
    serverErrorResponse
} from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

// POST /api/demands/[id]/vote - Vote on a demand (agree/disagree)
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { voteType } = body

        if (!voteType || !['AGREE', 'DISAGREE'].includes(voteType)) {
            return errorResponse('Vote type must be AGREE or DISAGREE', 400)
        }

        // Check if demand exists
        const demand = await prisma.demand.findUnique({
            where: { id },
            select: { id: true, agreeCount: true, disagreeCount: true },
        })

        if (!demand) {
            return notFoundResponse('Demand not found')
        }

        // Check for existing vote
        const existingVote = await prisma.demandVote.findUnique({
            where: {
                demandId_userId: {
                    demandId: id,
                    userId: user.id,
                },
            },
        })

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Same vote - remove it (toggle off)
                await prisma.$transaction([
                    prisma.demandVote.delete({
                        where: { id: existingVote.id },
                    }),
                    prisma.demand.update({
                        where: { id },
                        data: {
                            [voteType === 'AGREE' ? 'agreeCount' : 'disagreeCount']: {
                                decrement: 1,
                            },
                        },
                    }),
                ])

                return successResponse({
                    voteType: null,
                    message: 'Vote removed'
                })
            } else {
                // Different vote - change it
                await prisma.$transaction([
                    prisma.demandVote.update({
                        where: { id: existingVote.id },
                        data: { voteType },
                    }),
                    prisma.demand.update({
                        where: { id },
                        data: {
                            [voteType === 'AGREE' ? 'agreeCount' : 'disagreeCount']: {
                                increment: 1,
                            },
                            [voteType === 'AGREE' ? 'disagreeCount' : 'agreeCount']: {
                                decrement: 1,
                            },
                        },
                    }),
                ])

                return successResponse({
                    voteType,
                    message: `Changed vote to ${voteType}`
                })
            }
        } else {
            // New vote
            await prisma.$transaction([
                prisma.demandVote.create({
                    data: {
                        demandId: id,
                        userId: user.id,
                        voteType,
                    },
                }),
                prisma.demand.update({
                    where: { id },
                    data: {
                        [voteType === 'AGREE' ? 'agreeCount' : 'disagreeCount']: {
                            increment: 1,
                        },
                    },
                }),
            ])

            return successResponse({
                voteType,
                message: `Voted ${voteType}`
            }, undefined, 201)
        }
    } catch (error) {
        return serverErrorResponse(error)
    }
}
