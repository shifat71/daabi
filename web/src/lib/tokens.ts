import { prisma } from './prisma'
import type { VerificationTokenType } from '@prisma/client'

const EMAIL_VERIFICATION_EXPIRY_HOURS = 24
const PASSWORD_RESET_EXPIRY_HOURS = 1

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a short numeric code (for SMS or easy entry)
 */
export function generateCode(length: number = 6): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, b => (b % 10).toString()).join('')
}

/**
 * Create a verification token for email verification
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
    // Invalidate any existing email verification tokens
    await prisma.verificationToken.updateMany({
        where: {
            userId,
            type: 'EMAIL_VERIFICATION',
            usedAt: null,
        },
        data: {
            usedAt: new Date(), // Mark as used to invalidate
        },
    })

    // Create new token
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS)

    await prisma.verificationToken.create({
        data: {
            userId,
            token,
            type: 'EMAIL_VERIFICATION',
            expiresAt,
        },
    })

    return token
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
    // Invalidate any existing password reset tokens
    await prisma.verificationToken.updateMany({
        where: {
            userId,
            type: 'PASSWORD_RESET',
            usedAt: null,
        },
        data: {
            usedAt: new Date(),
        },
    })

    // Create new token
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRY_HOURS)

    await prisma.verificationToken.create({
        data: {
            userId,
            token,
            type: 'PASSWORD_RESET',
            expiresAt,
        },
    })

    return token
}

/**
 * Verify and consume a token
 */
export async function verifyToken(
    token: string,
    type: VerificationTokenType
): Promise<{ valid: boolean; userId?: string; error?: string }> {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true },
    })

    if (!verificationToken) {
        return { valid: false, error: 'Invalid or expired token' }
    }

    if (verificationToken.type !== type) {
        return { valid: false, error: 'Invalid token type' }
    }

    if (verificationToken.usedAt) {
        return { valid: false, error: 'Token has already been used' }
    }

    if (new Date() > verificationToken.expiresAt) {
        return { valid: false, error: 'Token has expired' }
    }

    // Mark token as used
    await prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
    })

    return { valid: true, userId: verificationToken.userId }
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    const result = await verifyToken(token, 'EMAIL_VERIFICATION')

    if (result.valid && result.userId) {
        // Update user's email verification status
        await prisma.user.update({
            where: { id: result.userId },
            data: {
                emailVerifiedAt: new Date(),
                isVerified: true,
            },
        })
    }

    return result
}

/**
 * Verify password reset token (does not reset password, just validates)
 */
export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    // Don't consume the token yet, just validate it
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!verificationToken) {
        return { valid: false, error: 'Invalid or expired token' }
    }

    if (verificationToken.type !== 'PASSWORD_RESET') {
        return { valid: false, error: 'Invalid token type' }
    }

    if (verificationToken.usedAt) {
        return { valid: false, error: 'Token has already been used' }
    }

    if (new Date() > verificationToken.expiresAt) {
        return { valid: false, error: 'Token has expired' }
    }

    return { valid: true, userId: verificationToken.userId }
}

/**
 * Complete password reset (validates token and updates password)
 */
export async function completePasswordReset(
    token: string,
    newPasswordHash: string
): Promise<{ success: boolean; error?: string }> {
    const result = await verifyToken(token, 'PASSWORD_RESET')

    if (!result.valid || !result.userId) {
        return { success: false, error: result.error }
    }

    // Update user's password
    await prisma.user.update({
        where: { id: result.userId },
        data: { passwordHash: newPasswordHash },
    })

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
        where: { userId: result.userId },
    })

    return { success: true }
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.verificationToken.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: new Date() } },
                { usedAt: { not: null } },
            ],
        },
    })

    return result.count
}
