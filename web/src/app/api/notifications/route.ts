import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    unauthorizedResponse,
    serverErrorResponse
} from '@/lib/api-response'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const unreadOnly = searchParams.get('unreadOnly') === 'true'

        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {
            userId: user.id,
        }

        if (unreadOnly) {
            where.isRead = false
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { userId: user.id, isRead: false },
            }),
        ])

        return successResponse({
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + notifications.length < total,
            },
        })
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const body = await request.json()
        const { notificationIds, markAllRead } = body

        if (markAllRead) {
            // Mark all notifications as read
            await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true },
            })

            return successResponse(null, 'All notifications marked as read')
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: user.id,
                },
                data: { isRead: true },
            })

            return successResponse(null, 'Notifications marked as read')
        }

        return successResponse(null, 'No changes made')
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const { searchParams } = new URL(request.url)
        const notificationId = searchParams.get('id')
        const deleteAll = searchParams.get('deleteAll') === 'true'

        if (deleteAll) {
            await prisma.notification.deleteMany({
                where: { userId: user.id },
            })
            return successResponse(null, 'All notifications deleted')
        } else if (notificationId) {
            await prisma.notification.deleteMany({
                where: { id: notificationId, userId: user.id },
            })
            return successResponse(null, 'Notification deleted')
        }

        return successResponse(null, 'No changes made')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
