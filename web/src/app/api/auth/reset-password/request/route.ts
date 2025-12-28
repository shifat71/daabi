import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { isValidEmail } from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    serverErrorResponse
} from '@/lib/api-response'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// POST /api/auth/reset-password/request - Request password reset
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return errorResponse('Email is required', 400)
        }

        if (!isValidEmail(email)) {
            return errorResponse('Invalid email format', 400)
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        // Always return success to prevent email enumeration
        const successMessage = 'If an account exists with this email, a password reset link has been sent.'

        if (!user) {
            // Don't reveal if email exists
            return successResponse(null, successMessage)
        }

        // Check if user has a password (might be OAuth only)
        if (!user.passwordHash) {
            return successResponse(null, successMessage)
        }

        // Create password reset token
        const token = await createPasswordResetToken(user.id)

        // Generate reset link
        const resetLink = `${APP_URL}/reset-password?token=${token}`

        // Send email
        const emailSent = await sendPasswordResetEmail(
            user.email,
            user.name || 'Student',
            resetLink
        )

        if (!emailSent) {
            console.error('Failed to send password reset email to:', email)
        }

        return successResponse(
            null,
            successMessage
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
