import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    verifyPassword,
    createSession,
    isValidEmail
} from '@/lib/auth'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    serverErrorResponse
} from '@/lib/api-response'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!email) {
            errors.email = ['Email is required']
        } else if (!isValidEmail(email)) {
            errors.email = ['Invalid email format']
        }

        if (!password) {
            errors.password = ['Password is required']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (!user || !user.passwordHash) {
            return errorResponse('Invalid email or password', 401)
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash)
        if (!isValidPassword) {
            return errorResponse('Invalid email or password', 401)
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        })

        // Create session
        const userAgent = request.headers.get('user-agent') || undefined
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            undefined

        await createSession(user.id, userAgent, ipAddress)

        // Return user data (excluding sensitive fields)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            displayName: user.displayName,
            avatar: user.avatar,
            studentId: user.studentId,
            department: user.department,
            batch: user.batch,
            hall: user.hall,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            isModerator: user.isModerator,
        }

        return successResponse(
            { user: userData },
            'Login successful'
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
