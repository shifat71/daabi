import { apiGet, apiPost } from './client'

// Types
export interface User {
    id: string
    email: string
    name: string | null
    displayName: string | null
    avatar: string | null
    bio: string | null
    studentId: string | null
    department: string | null
    batch: string | null
    hall: string | null
    phone: string | null
    isVerified: boolean
    isAdmin: boolean
    isModerator: boolean
    emailVerifiedAt: string | null
    createdAt: string
}

export interface SignupData {
    email: string
    password: string
    name: string
    studentId?: string
    department?: string
    batch?: string
    hall?: string
}

export interface LoginData {
    email: string
    password: string
}

// Auth API Functions
export const authApi = {
    /**
     * Register a new user
     */
    signup: async (data: SignupData) => {
        return apiPost<{ user: User }>('/auth/signup', data)
    },

    /**
     * Log in with email and password
     */
    login: async (data: LoginData) => {
        return apiPost<{ user: User }>('/auth/login', data)
    },

    /**
     * Log out the current user
     */
    logout: async () => {
        return apiPost<null>('/auth/logout', {})
    },

    /**
     * Get the currently authenticated user
     */
    getCurrentUser: async () => {
        return apiGet<{ user: User }>('/auth/me')
    },

    // ==========================================
    // EMAIL VERIFICATION
    // ==========================================

    /**
     * Send email verification link
     */
    sendVerificationEmail: async (email?: string) => {
        return apiPost<{ email: string }>('/auth/verify-email/send', { email })
    },

    /**
     * Confirm email verification with token
     */
    confirmEmailVerification: async (token: string) => {
        return apiPost<{ verified: boolean }>('/auth/verify-email/confirm', { token })
    },

    // ==========================================
    // PASSWORD RESET
    // ==========================================

    /**
     * Request password reset link
     */
    requestPasswordReset: async (email: string) => {
        return apiPost<null>('/auth/reset-password/request', { email })
    },

    /**
     * Verify password reset token is valid
     */
    verifyResetToken: async (token: string) => {
        return apiPost<{ valid: boolean }>('/auth/reset-password/verify', { token })
    },

    /**
     * Confirm password reset with new password
     */
    confirmPasswordReset: async (token: string, password: string, confirmPassword: string) => {
        return apiPost<null>('/auth/reset-password/confirm', {
            token,
            password,
            confirmPassword
        })
    },

    // ==========================================
    // PASSWORD CHANGE
    // ==========================================

    /**
     * Change password for authenticated user
     */
    changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        return apiPost<null>('/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword
        })
    },
}
