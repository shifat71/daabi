import { NextRequest } from 'next/server'
import { verifyPasswordResetToken } from '@/lib/tokens'
import {
    successResponse,
    errorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// POST /api/auth/reset-password/verify - Verify reset token is valid
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token) {
            return errorResponse('Reset token is required', 400)
        }

        const result = await verifyPasswordResetToken(token)

        if (!result.valid) {
            return errorResponse(result.error || 'Invalid or expired token', 400)
        }

        return successResponse(
            { valid: true },
            'Token is valid. You can now set a new password.'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// GET /api/auth/reset-password/verify?token=xxx - Verify via GET
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return errorResponse('Reset token is required', 400)
        }

        const result = await verifyPasswordResetToken(token)

        if (!result.valid) {
            return errorResponse(result.error || 'Invalid or expired token', 400)
        }

        return successResponse(
            { valid: true },
            'Token is valid'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
