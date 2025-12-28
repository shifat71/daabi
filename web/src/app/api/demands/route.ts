import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    unauthorizedResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// GET /api/demands - Get paginated demands
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const category = searchParams.get('category')
        const status = searchParams.get('status')
        const sortBy = searchParams.get('sortBy') || 'popular' // popular, recent, votes

        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {}

        if (category) {
            where.category = category
        }
        if (status) {
            where.status = status
        }

        let orderBy: Record<string, string>[] = [{ createdAt: 'desc' }]

        if (sortBy === 'popular') {
            orderBy = [{ agreeCount: 'desc' }, { viewCount: 'desc' }]
        } else if (sortBy === 'votes') {
            orderBy = [{ agreeCount: 'desc' }]
        }

        const [demands, total] = await Promise.all([
            prisma.demand.findMany({
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
                    media: {
                        take: 1,
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
                orderBy,
                skip,
                take: limit,
            }),
            prisma.demand.count({ where }),
        ])

        return successResponse({
            demands,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + demands.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/demands - Create a new demand
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const body = await request.json()
        const {
            title,
            description,
            category,
            targetEntity,
            priority = 'MEDIUM',
            media = []
        } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!title || title.trim().length < 10) {
            errors.title = ['Title must be at least 10 characters']
        } else if (title.length > 300) {
            errors.title = ['Title must be less than 300 characters']
        }

        if (!description || description.trim().length < 50) {
            errors.description = ['Description must be at least 50 characters']
        } else if (description.length > 20000) {
            errors.description = ['Description must be less than 20000 characters']
        }

        const validCategories = [
            'DEPARTMENT', 'HALL', 'CLUB', 'ENVIRONMENT',
            'INFRASTRUCTURE', 'ACADEMIC', 'ADMINISTRATIVE', 'OTHER'
        ]
        if (!category || !validCategories.includes(category)) {
            errors.category = [`Category must be one of: ${validCategories.join(', ')}`]
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const demand = await prisma.demand.create({
            data: {
                authorId: user.id,
                title: title.trim(),
                description: description.trim(),
                category,
                targetEntity: targetEntity || null,
                priority,
                agreeCount: 1, // Author agrees by default
                media: {
                    create: media.map((m: { url: string; type: string; caption?: string }, index: number) => ({
                        url: m.url,
                        type: m.type,
                        caption: m.caption,
                        order: index,
                    })),
                },
                // Author's automatic agree vote
                votes: {
                    create: {
                        userId: user.id,
                        voteType: 'AGREE',
                    },
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

        return successResponse({ demand }, 'Demand created successfully', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
