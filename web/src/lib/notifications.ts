import { prisma } from './prisma'

export type NotificationType =
    | 'COMMENT'
    | 'REACTION'
    | 'MENTION'
    | 'FOLLOW'
    | 'ISSUE_UPDATE'
    | 'DEMAND_UPDATE'
    | 'DONATION'
    | 'SYSTEM'

interface CreateNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
}

/**
 * Create a notification for a user
 */
export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
}: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            },
        })
        return notification
    } catch (error) {
        console.error('Error creating notification:', error)
        return null
    }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
    userIds: string[],
    params: Omit<CreateNotificationParams, 'userId'>
) {
    try {
        const notifications = await prisma.notification.createMany({
            data: userIds.map(userId => ({
                userId,
                ...params,
            })),
        })
        return notifications
    } catch (error) {
        console.error('Error creating notifications:', error)
        return null
    }
}

/**
 * Notify when someone comments on a post/issue/demand
 */
export async function notifyOnComment(
    authorId: string,
    commenterId: string,
    commenterName: string,
    targetType: 'post' | 'issue' | 'demand',
    targetId: string,
    targetTitle: string
) {
    // Don't notify if user comments on their own content
    if (authorId === commenterId) return null

    return createNotification({
        userId: authorId,
        type: 'COMMENT',
        title: 'New Comment',
        message: `${commenterName} commented on your ${targetType}: "${targetTitle.slice(0, 50)}..."`,
        link: `/${targetType}s/${targetId}`,
    })
}

/**
 * Notify when someone reacts to a post/comment
 */
export async function notifyOnReaction(
    authorId: string,
    reactorId: string,
    reactorName: string,
    reactionType: string,
    targetType: 'post' | 'comment',
    targetId: string
) {
    if (authorId === reactorId) return null

    return createNotification({
        userId: authorId,
        type: 'REACTION',
        title: 'New Reaction',
        message: `${reactorName} reacted with ${reactionType} to your ${targetType}`,
        link: targetType === 'post' ? `/posts/${targetId}` : undefined,
    })
}

/**
 * Notify issue author when status changes
 */
export async function notifyOnIssueStatusChange(
    authorId: string,
    issueId: string,
    issueTitle: string,
    newStatus: string
) {
    const statusMessages: Record<string, string> = {
        ASSIGNED: 'has been assigned to someone',
        IN_PROGRESS: 'is now being worked on',
        DISCUSSED: 'is being discussed',
        ACTION_TAKEN: 'has action taken',
        RESOLVED: 'has been resolved! 🎉',
        CLOSED: 'has been closed',
    }

    return createNotification({
        userId: authorId,
        type: 'ISSUE_UPDATE',
        title: 'Issue Update',
        message: `Your issue "${issueTitle.slice(0, 40)}..." ${statusMessages[newStatus] || 'was updated'}`,
        link: `/issues/${issueId}`,
    })
}

/**
 * Notify demand author when status changes
 */
export async function notifyOnDemandStatusChange(
    authorId: string,
    demandId: string,
    demandTitle: string,
    newStatus: string
) {
    const statusMessages: Record<string, string> = {
        UNDER_REVIEW: 'is under review',
        ACCEPTED: 'has been accepted! 🎉',
        IN_PROGRESS: 'is in progress',
        REJECTED: 'was not accepted',
        RESOLVED: 'has been resolved! 🎉',
    }

    return createNotification({
        userId: authorId,
        type: 'DEMAND_UPDATE',
        title: 'Demand Update',
        message: `Your demand "${demandTitle.slice(0, 40)}..." ${statusMessages[newStatus] || 'was updated'}`,
        link: `/demands/${demandId}`,
    })
}

/**
 * Notify on new donation to crowdfunding
 */
export async function notifyOnDonation(
    organizerId: string,
    crowdfundingTitle: string,
    donorName: string,
    amount: number,
    currency: string
) {
    return createNotification({
        userId: organizerId,
        type: 'DONATION',
        title: 'New Donation! 💝',
        message: `${donorName} donated ${currency} ${amount} to "${crowdfundingTitle.slice(0, 40)}..."`,
    })
}

/**
 * Send system notification
 */
export async function sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    link?: string
) {
    return createNotification({
        userId,
        type: 'SYSTEM',
        title,
        message,
        link,
    })
}
