import { getCurrentUser } from '@/lib/auth'
import {
    successResponse,
    unauthorizedResponse,
    serverErrorResponse
} from '@/lib/api-response'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return unauthorizedResponse('Not authenticated')
        }

        // Return user data (excluding sensitive fields)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            displayName: user.displayName,
            avatar: user.avatar,
            bio: user.bio,
            studentId: user.studentId,
            department: user.department,
            batch: user.batch,
            hall: user.hall,
            phone: user.phone,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            isModerator: user.isModerator,
            emailVerifiedAt: user.emailVerifiedAt,
            createdAt: user.createdAt,
        }

        return successResponse({ user: userData })
    } catch (error) {
        return serverErrorResponse(error)
    }
}
