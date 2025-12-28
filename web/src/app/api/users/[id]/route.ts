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

// GET /api/users/[id] - Get a user's public profile
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                displayName: true,
                avatar: true,
                bio: true,
                department: true,
                batch: true,
                hall: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        issues: true,
                        demands: true,
                        marketplace: true,
                    },
                },
            },
        })

        if (!user) {
            return notFoundResponse('User not found')
        }

        // Get user's recent posts
        const recentPosts = await prisma.post.findMany({
            where: {
                authorId: id,
                visibility: 'PUBLIC',
                isAnonymous: false,
            },
            include: {
                media: { take: 1 },
                _count: {
                    select: {
                        comments: true,
                        reactions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        })

        return successResponse({ user, recentPosts })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return unauthorizedResponse()
        }

        const { id } = await params

        // Users can only update their own profile (unless admin)
        if (currentUser.id !== id && !currentUser.isAdmin) {
            return forbiddenResponse('You can only update your own profile')
        }

        const body = await request.json()
        const { name, displayName, bio, department, batch, hall, phone, avatar } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (name !== undefined && name.trim().length < 2) {
            errors.name = ['Name must be at least 2 characters']
        }

        if (displayName !== undefined && displayName.trim().length < 2) {
            errors.displayName = ['Display name must be at least 2 characters']
        }

        if (bio !== undefined && bio.length > 500) {
            errors.bio = ['Bio must be less than 500 characters']
        }

        if (phone !== undefined && phone.length > 0) {
            const phoneRegex = /^[+]?[0-9]{10,15}$/
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                errors.phone = ['Invalid phone number format']
            }
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(displayName !== undefined && { displayName: displayName.trim() }),
                ...(bio !== undefined && { bio }),
                ...(department !== undefined && { department }),
                ...(batch !== undefined && { batch }),
                ...(hall !== undefined && { hall }),
                ...(phone !== undefined && { phone }),
                ...(avatar !== undefined && { avatar }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                displayName: true,
                avatar: true,
                bio: true,
                department: true,
                batch: true,
                hall: true,
                phone: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return successResponse({ user: updatedUser }, 'Profile updated successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
