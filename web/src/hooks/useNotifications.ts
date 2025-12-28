'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    notificationsApi,
    type Notification,
    type NotificationsListParams
} from '@/lib/api'

// Hook for notifications with real-time unread count
export function useNotifications(initialParams: NotificationsListParams = {}) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        hasMore: boolean
    }>({ page: 1, limit: 20, total: 0, hasMore: false })

    const fetchNotifications = useCallback(async (params: NotificationsListParams = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await notificationsApi.getList({ ...initialParams, ...params })

            if (response.success && response.data) {
                setNotifications(response.data.notifications)
                setUnreadCount(response.data.unreadCount)
                setPagination(response.data.pagination as typeof pagination)
            } else {
                setError(response.error || 'Failed to fetch notifications')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams])

    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return

        try {
            setIsLoading(true)
            const response = await notificationsApi.getList({
                ...initialParams,
                page: pagination.page + 1,
            })

            if (response.success && response.data) {
                setNotifications(prev => [...prev, ...response.data!.notifications])
                setPagination(response.data.pagination as typeof pagination)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more')
        } finally {
            setIsLoading(false)
        }
    }, [initialParams, pagination, isLoading])

    const markAsRead = useCallback(async (notificationIds: string[]) => {
        try {
            const response = await notificationsApi.markAsRead(notificationIds)

            if (response.success) {
                setNotifications(prev =>
                    prev.map(n =>
                        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
                    )
                )
                setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
                return true
            }
            return false
        } catch {
            return false
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await notificationsApi.markAllAsRead()

            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                setUnreadCount(0)
                return true
            }
            return false
        } catch {
            return false
        }
    }, [])

    const deleteNotification = useCallback(async (id: string) => {
        try {
            const response = await notificationsApi.delete(id)

            if (response.success) {
                const notification = notifications.find(n => n.id === id)
                setNotifications(prev => prev.filter(n => n.id !== id))
                if (notification && !notification.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1))
                }
                return true
            }
            return false
        } catch {
            return false
        }
    }, [notifications])

    const deleteAll = useCallback(async () => {
        try {
            const response = await notificationsApi.deleteAll()

            if (response.success) {
                setNotifications([])
                setUnreadCount(0)
                return true
            }
            return false
        } catch {
            return false
        }
    }, [])

    const refresh = useCallback(() => fetchNotifications({ page: 1 }), [fetchNotifications])

    // Refresh unread count periodically
    const refreshUnreadCount = useCallback(async () => {
        try {
            const count = await notificationsApi.getUnreadCount()
            setUnreadCount(count)
        } catch {
            // Silently fail
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Poll for unread count every 30 seconds
    useEffect(() => {
        const interval = setInterval(refreshUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [refreshUnreadCount])

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        pagination,
        loadMore,
        refresh,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAll,
        refreshUnreadCount
    }
}

// Simple hook for just unread count (for navbar badge)
export function useUnreadNotificationsCount() {
    const [count, setCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const unreadCount = await notificationsApi.getUnreadCount()
            setCount(unreadCount)
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
        const interval = setInterval(refresh, 30000)
        return () => clearInterval(interval)
    }, [refresh])

    return { count, isLoading, refresh }
}
