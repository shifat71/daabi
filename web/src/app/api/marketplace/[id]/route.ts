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

// GET /api/marketplace/[id] - Get a single marketplace item
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const item = await prisma.marketplaceItem.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                        department: true,
                        hall: true,
                        batch: true,
                        phone: true,
                        createdAt: true,
                    },
                },
                media: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!item) {
            return notFoundResponse('Item not found')
        }

        // Increment view count
        await prisma.marketplaceItem.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        })

        // Get seller's other items
        const sellerItems = await prisma.marketplaceItem.findMany({
            where: {
                sellerId: item.sellerId,
                id: { not: id },
                status: 'AVAILABLE',
            },
            include: {
                media: { take: 1 },
            },
            take: 4,
        })

        return successResponse({ item, sellerItems })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/marketplace/[id] - Update a marketplace item
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params
        const body = await request.json()
        const { title, description, price, category, condition, location, status } = body

        const item = await prisma.marketplaceItem.findUnique({
            where: { id },
        })

        if (!item) {
            return notFoundResponse('Item not found')
        }

        if (item.sellerId !== user.id && !user.isAdmin) {
            return forbiddenResponse('You can only edit your own items')
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
            } else if (description.length > 5000) {
                errors.description = ['Description must be less than 5000 characters']
            }
        }

        if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
            errors.price = ['Price must be a valid positive number']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const updatedItem = await prisma.marketplaceItem.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(description !== undefined && { description: description.trim() }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(category !== undefined && { category }),
                ...(condition !== undefined && { condition }),
                ...(location !== undefined && { location }),
                ...(status !== undefined && { status }),
                ...(status === 'SOLD' && { soldAt: new Date() }),
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                media: true,
            },
        })

        return successResponse({ item: updatedItem }, 'Item updated successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/marketplace/[id] - Delete a marketplace item
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { id } = await params

        const item = await prisma.marketplaceItem.findUnique({
            where: { id },
        })

        if (!item) {
            return notFoundResponse('Item not found')
        }

        if (item.sellerId !== user.id && !user.isAdmin) {
            return forbiddenResponse('You can only delete your own items')
        }

        await prisma.marketplaceItem.delete({
            where: { id },
        })

        return successResponse(null, 'Item deleted successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
