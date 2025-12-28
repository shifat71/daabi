import { NextRequest } from 'next/server'
import { hashPassword, validatePassword } from '@/lib/auth'
import { completePasswordReset } from '@/lib/tokens'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// POST /api/auth/reset-password/confirm - Set new password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token, password, confirmPassword } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!token) {
            errors.token = ['Reset token is required']
        }

        if (!password) {
            errors.password = ['Password is required']
        } else {
            const passwordValidation = validatePassword(password)
            if (!passwordValidation.valid) {
                errors.password = passwordValidation.errors
            }
        }

        if (!confirmPassword) {
            errors.confirmPassword = ['Please confirm your password']
        } else if (password !== confirmPassword) {
            errors.confirmPassword = ['Passwords do not match']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Hash the new password
        const passwordHash = await hashPassword(password)

        // Complete the password reset
        const result = await completePasswordReset(token, passwordHash)

        if (!result.success) {
            return errorResponse(result.error || 'Failed to reset password', 400)
        }

        return successResponse(
            null,
            'Password reset successfully! You can now log in with your new password.'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
