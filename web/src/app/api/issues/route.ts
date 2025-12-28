import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    unauthorizedResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// GET /api/issues - Get paginated issues
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const status = searchParams.get('status')
        const category = searchParams.get('category')
        const priority = searchParams.get('priority')
        const sortBy = searchParams.get('sortBy') || 'activity' // activity, recent, votes

        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {}

        if (status) {
            where.status = status
        }
        if (category) {
            where.category = category
        }
        if (priority) {
            where.priority = priority
        }

        let orderBy: Record<string, string>[] = [{ createdAt: 'desc' }]

        if (sortBy === 'activity') {
            orderBy = [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
        } else if (sortBy === 'votes') {
            orderBy = [{ viewCount: 'desc' }, { createdAt: 'desc' }]
        }

        const [issues, total] = await Promise.all([
            prisma.issue.findMany({
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
                            contributions: true,
                        },
                    },
                    contributions: {
                        take: 3,
                        orderBy: { createdAt: 'desc' },
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
                orderBy,
                skip,
                take: limit,
            }),
            prisma.issue.count({ where }),
        ])

        return successResponse({
            issues,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + issues.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/issues - Create a new issue
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
            location,
            priority = 'MEDIUM',
            isAnonymous = false,
            media = []
        } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!title || title.trim().length < 5) {
            errors.title = ['Title must be at least 5 characters']
        } else if (title.length > 200) {
            errors.title = ['Title must be less than 200 characters']
        }

        if (!description || description.trim().length < 20) {
            errors.description = ['Description must be at least 20 characters']
        } else if (description.length > 10000) {
            errors.description = ['Description must be less than 10000 characters']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const issue = await prisma.issue.create({
            data: {
                authorId: user.id,
                title: title.trim(),
                description: description.trim(),
                category: category || null,
                location: location || null,
                priority,
                isAnonymous,
                media: {
                    create: media.map((m: { url: string; type: string; caption?: string }, index: number) => ({
                        url: m.url,
                        type: m.type,
                        caption: m.caption,
                        order: index,
                    })),
                },
                // Create initial contribution for the issue creation
                contributions: {
                    create: {
                        userId: user.id,
                        type: 'UPDATE',
                        content: 'Issue reported',
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
                        contributions: true,
                    },
                },
            },
        })

        return successResponse({ issue }, 'Issue created successfully', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
