import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createEmailVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse
} from '@/lib/api-response'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// POST /api/auth/verify-email/send - Send verification email
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        // Allow both authenticated and unauthenticated requests
        let targetUser = user

        if (!user) {
            // Check if email is provided in body
            const body = await request.json()
            const { email } = body

            if (!email) {
                return unauthorizedResponse('Please log in or provide an email address')
            }

            // Find user by email
            targetUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            })

            if (!targetUser) {
                // Don't reveal if email exists
                return successResponse(null, 'If an account exists with this email, a verification link has been sent.')
            }
        }

        if (!targetUser) {
            return unauthorizedResponse()
        }

        // Check if already verified
        if (targetUser.emailVerifiedAt) {
            return errorResponse('Email is already verified', 400)
        }

        // Create verification token
        const token = await createEmailVerificationToken(targetUser.id)

        // Generate verification link
        const verificationLink = `${APP_URL}/verify-email?token=${token}`

        // Send email
        const emailSent = await sendVerificationEmail(
            targetUser.email,
            targetUser.name || 'Student',
            verificationLink
        )

        if (!emailSent) {
            return errorResponse('Failed to send verification email. Please try again.', 500)
        }

        return successResponse(
            { email: targetUser.email },
            'Verification email sent. Please check your inbox.'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
