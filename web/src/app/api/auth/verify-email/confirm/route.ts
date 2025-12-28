import { NextRequest } from 'next/server'
import { verifyEmailToken } from '@/lib/tokens'
import {
    successResponse,
    errorResponse,
    serverErrorResponse
} from '@/lib/api-response'

// POST /api/auth/verify-email/confirm - Confirm email with token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token) {
            return errorResponse('Verification token is required', 400)
        }

        const result = await verifyEmailToken(token)

        if (!result.valid) {
            return errorResponse(result.error || 'Invalid or expired token', 400)
        }

        return successResponse(
            { verified: true },
            'Email verified successfully! You can now access all features.'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}

// GET /api/auth/verify-email/confirm?token=xxx - Verify via GET (for direct link click)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return errorResponse('Verification token is required', 400)
        }

        const result = await verifyEmailToken(token)

        if (!result.valid) {
            return errorResponse(result.error || 'Invalid or expired token', 400)
        }

        return successResponse(
            { verified: true },
            'Email verified successfully!'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
