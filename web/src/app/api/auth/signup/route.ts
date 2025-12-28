import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    hashPassword,
    createSession,
    isValidEmail,
    validatePassword
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
        const { email, password, name, studentId, department, batch, hall } = body

        // Validation
        const errors: Record<string, string[]> = {}

        if (!email) {
            errors.email = ['Email is required']
        } else if (!isValidEmail(email)) {
            errors.email = ['Invalid email format']
        }

        if (!password) {
            errors.password = ['Password is required']
        } else {
            const passwordValidation = validatePassword(password)
            if (!passwordValidation.valid) {
                errors.password = passwordValidation.errors
            }
        }

        if (!name || name.trim().length < 2) {
            errors.name = ['Name must be at least 2 characters']
        }

        if (Object.keys(errors).length > 0) {
            return validationErrorResponse(errors)
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return errorResponse('An account with this email already exists', 409)
        }

        // Check if studentId is already taken
        if (studentId) {
            const existingStudentId = await prisma.user.findUnique({
                where: { studentId },
            })
            if (existingStudentId) {
                return errorResponse('This student ID is already registered', 409)
            }
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name: name.trim(),
                displayName: name.trim(),
                studentId: studentId || null,
                department: department || null,
                batch: batch || null,
                hall: hall || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                displayName: true,
                studentId: true,
                department: true,
                batch: true,
                hall: true,
                isVerified: true,
                createdAt: true,
            },
        })

        // Create session
        const userAgent = request.headers.get('user-agent') || undefined
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            undefined

        await createSession(user.id, userAgent, ipAddress)

        return successResponse(
            { user },
            'Account created successfully',
            201
        )
    } catch (error) {
        return serverErrorResponse(error)
    }
}
