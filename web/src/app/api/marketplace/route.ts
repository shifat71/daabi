import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    unauthorizedResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// GET /api/marketplace - Get paginated marketplace items
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const category = searchParams.get('category')
        const condition = searchParams.get('condition')
        const status = searchParams.get('status') || 'AVAILABLE'
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const search = searchParams.get('search')
        const sortBy = searchParams.get('sortBy') || 'recent' // recent, price_low, price_high

        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {
            status,
        }

        if (category) {
            where.category = category
        }
        if (condition) {
            where.condition = condition
        }
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) {
                (where.price as Record<string, number>).gte = parseFloat(minPrice)
            }
            if (maxPrice) {
                (where.price as Record<string, number>).lte = parseFloat(maxPrice)
            }
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        let orderBy: Record<string, string>[] = [{ createdAt: 'desc' }]

        if (sortBy === 'price_low') {
            orderBy = [{ price: 'asc' }]
        } else if (sortBy === 'price_high') {
            orderBy = [{ price: 'desc' }]
        }

        const [items, total] = await Promise.all([
            prisma.marketplaceItem.findMany({
                where,
                include: {
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            avatar: true,
                            department: true,
                            hall: true,
                        },
                    },
                    media: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.marketplaceItem.count({ where }),
        ])

        return successResponse({
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + items.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// POST /api/marketplace - Create a new marketplace item
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
            price,
            category,
            condition,
            location,
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
        } else if (description.length > 5000) {
            errors.description = ['Description must be less than 5000 characters']
        }

        if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            errors.price = ['Price must be a valid positive number']
        }

        const validCategories = [
            'ELECTRONICS', 'BOOKS', 'CLOTHING', 'FURNITURE',
            'ACCESSORIES', 'SPORTS', 'STATIONERY', 'OTHER'
        ]
        if (!category || !validCategories.includes(category)) {
            errors.category = [`Category must be one of: ${validCategories.join(', ')}`]
        }

        const validConditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']
        if (!condition || !validConditions.includes(condition)) {
            errors.condition = [`Condition must be one of: ${validConditions.join(', ')}`]
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const item = await prisma.marketplaceItem.create({
            data: {
                sellerId: user.id,
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                category,
                condition,
                location: location || null,
                media: {
                    create: media.map((m: { url: string; type: string; caption?: string }, index: number) => ({
                        url: m.url,
                        type: m.type,
                        caption: m.caption,
                        order: index,
                    })),
                },
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                        department: true,
                        hall: true,
                    },
                },
                media: true,
            },
        })

        return successResponse({ item }, 'Item listed successfully', 201)
    } catch (error) {
        return serverErrorResponse(error)
    }
}
