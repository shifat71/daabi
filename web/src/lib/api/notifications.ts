import { apiGet, apiPatch, apiDelete, buildQueryString } from './client'

// Types
export interface Notification {
    id: string
    userId: string
    type: 'COMMENT' | 'REACTION' | 'MENTION' | 'FOLLOW' | 'ISSUE_UPDATE' | 'DEMAND_UPDATE' | 'DONATION' | 'SYSTEM'
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

export interface NotificationsListParams {
    page?: number
    limit?: number
    unreadOnly?: boolean
}

// Notifications API Functions
export const notificationsApi = {
    /**
     * Get user's notifications
     */
    getList: async (params: NotificationsListParams = {}) => {
        const query = buildQueryString(params)
        return apiGet<{
            notifications: Notification[]
            unreadCount: number
            pagination: object
        }>(`/notifications${query}`)
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async () => {
        const response = await apiGet<{ unreadCount: number }>('/notifications?limit=0')
        return response.data?.unreadCount ?? 0
    },

    /**
     * Mark specific notifications as read
     */
    markAsRead: async (notificationIds: string[]) => {
        return apiPatch<null>('/notifications', { notificationIds })
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        return apiPatch<null>('/notifications', { markAllRead: true })
    },

    /**
     * Delete a notification
     */
    delete: async (id: string) => {
        return apiDelete<null>(`/notifications?id=${id}`)
    },

    /**
     * Delete all notifications
     */
    deleteAll: async () => {
        return apiDelete<null>('/notifications?deleteAll=true')
    },
}
