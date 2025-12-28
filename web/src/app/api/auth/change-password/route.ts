import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword, verifyPassword, validatePassword } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// POST /api/auth/change-password - Change password for authenticated user
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return unauthorizedResponse()
        }

        const body = await request.json()
        const { currentPassword, newPassword, confirmPassword } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!currentPassword) {
            errors.currentPassword = ['Current password is required']
        }

        if (!newPassword) {
            errors.newPassword = ['New password is required']
        } else {
            const passwordValidation = validatePassword(newPassword)
            if (!passwordValidation.valid) {
                errors.newPassword = passwordValidation.errors
            }
        }

        if (!confirmPassword) {
            errors.confirmPassword = ['Please confirm your new password']
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = ['Passwords do not match']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Verify current password
        if (!user.passwordHash) {
            return errorResponse('Your account does not have a password set', 400)
        }

        const isValidPassword = await verifyPassword(currentPassword, user.passwordHash)
        if (!isValidPassword) {
            return errorResponse('Current password is incorrect', 400)
        }

        // Check if new password is different from current
        const isSamePassword = await verifyPassword(newPassword, user.passwordHash)
        if (isSamePassword) {
            return errorResponse('New password must be different from your current password', 400)
        }

        // Hash and update password
        const newPasswordHash = await hashPassword(newPassword)

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        })

        return successResponse(
            null,
            'Password changed successfully!'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
