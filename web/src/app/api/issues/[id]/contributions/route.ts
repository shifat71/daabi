import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    notFoundResponse,
    unauthorizedResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

// GET /api/issues/[id]/contributions - Get all contributions for an issue
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        const skip = (page - 1) * limit

        const issue = await prisma.issue.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!issue) {
            return notFoundResponse('Issue not found')
        }

        const [contributions, total] = await Promise.all([
            prisma.issueContribution.findMany({
                where: { issueId: id },
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
                skip,
                take: limit,
            }),
            prisma.issueContribution.count({ where: { issueId: id } }),
        ])

        return successResponse({
            contributions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + contributions.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/issues/[id]/contributions - Add a contribution to an issue
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { type, content } = body

        // Validation
        const errors: Record<string, string[]> = {}

        const validTypes = ['UPDATE', 'COMMENT', 'EVIDENCE', 'SOLUTION', 'ESCALATION']
        if (!type || !validTypes.includes(type)) {
            errors.type = [`Type must be one of: ${validTypes.join(', ')}`]
        }

        if (!content || content.trim().length < 5) {
            errors.content = ['Content must be at least 5 characters']
        } else if (content.length > 5000) {
            errors.content = ['Content must be less than 5000 characters']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Check if issue exists
        const issue = await prisma.issue.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!issue) {
            return notFoundResponse('Issue not found')
        }

        const contribution = await prisma.issueContribution.create({
            data: {
                issueId: id,
                userId: user.id,
                type,
                content: content.trim(),
            },
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
        })

        // Update issue's updatedAt to reflect activity
        await prisma.issue.update({
            where: { id },
            data: { updatedAt: new Date() },
        })

        return successResponse({ contribution }, 'Contribution added successfully', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
