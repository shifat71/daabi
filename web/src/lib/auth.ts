import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { User } from '@prisma/client'

const SESSION_COOKIE_NAME = 'daabi_session'
const SESSION_DURATION_DAYS = 30

export async function hashPassword(password: string): Promise<string> {
    // Using Web Crypto API for password hashing
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password)
    return passwordHash === hash
}

export function generateSessionToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
    const token = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

    const session = await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt,
            userAgent,
            ipAddress,
        },
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    })

    return session
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
        return null
    }

    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
    })

    if (!session) {
        return null
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
        await prisma.session.delete({ where: { id: session.id } })
        return null
    }

    return session
}

export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession()
    return session?.user ?? null
}

export async function deleteSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (token) {
        await prisma.session.deleteMany({ where: { token } })
        cookieStore.delete(SESSION_COOKIE_NAME)
    }
}

export async function deleteAllUserSessions(userId: string) {
    await prisma.session.deleteMany({ where: { userId } })
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Validate student email (customize for your university)
export function isStudentEmail(email: string): boolean {
    // Add your university email domains here
    const studentDomains = ['student.sust.edu', 'sust.edu', 'edu.bd']
    return studentDomains.some(domain => email.endsWith(`@${domain}`))
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    return { valid: errors.length === 0, errors }
}
