'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode
} from 'react'
import { authApi, type User, type SignupData, type LoginData } from '@/lib/api'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    isEmailVerified: boolean
    error: string | null
    login: (data: LoginData) => Promise<boolean>
    signup: (data: SignupData) => Promise<boolean>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
    clearError: () => void
    // Email verification
    sendVerificationEmail: () => Promise<boolean>
    confirmEmailVerification: (token: string) => Promise<boolean>
    // Password reset
    requestPasswordReset: (email: string) => Promise<boolean>
    verifyResetToken: (token: string) => Promise<boolean>
    confirmPasswordReset: (token: string, password: string, confirmPassword: string) => Promise<boolean>
    // Password change
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch current user on mount
    useEffect(() => {
        refreshUser()
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await authApi.getCurrentUser()
            if (response.success && response.data) {
                setUser(response.data.user)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const login = useCallback(async (data: LoginData): Promise<boolean> => {
        try {
            setError(null)
            setIsLoading(true)

            const response = await authApi.login(data)

            if (response.success && response.data) {
                setUser(response.data.user)
                return true
            } else {
                setError(response.error || 'Login failed')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    const signup = useCallback(async (data: SignupData): Promise<boolean> => {
        try {
            setError(null)
            setIsLoading(true)

            const response = await authApi.signup(data)

            if (response.success && response.data) {
                setUser(response.data.user)
                return true
            } else {
                setError(response.error || 'Signup failed')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await authApi.logout()
        } finally {
            setUser(null)
        }
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // ==========================================
    // EMAIL VERIFICATION
    // ==========================================

    const sendVerificationEmail = useCallback(async (): Promise<boolean> => {
        try {
            setError(null)
            const response = await authApi.sendVerificationEmail()

            if (response.success) {
                return true
            } else {
                setError(response.error || 'Failed to send verification email')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send verification email')
            return false
        }
    }, [])

    const confirmEmailVerification = useCallback(async (token: string): Promise<boolean> => {
        try {
            setError(null)
            const response = await authApi.confirmEmailVerification(token)

            if (response.success) {
                // Refresh user to get updated verification status
                await refreshUser()
                return true
            } else {
                setError(response.error || 'Failed to verify email')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify email')
            return false
        }
    }, [refreshUser])

    // ==========================================
    // PASSWORD RESET
    // ==========================================

    const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
        try {
            setError(null)
            const response = await authApi.requestPasswordReset(email)

            if (response.success) {
                return true
            } else {
                setError(response.error || 'Failed to request password reset')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request password reset')
            return false
        }
    }, [])

    const verifyResetToken = useCallback(async (token: string): Promise<boolean> => {
        try {
            setError(null)
            const response = await authApi.verifyResetToken(token)

            if (response.success && response.data?.valid) {
                return true
            } else {
                setError(response.error || 'Invalid or expired reset token')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify reset token')
            return false
        }
    }, [])

    const confirmPasswordReset = useCallback(async (
        token: string,
        password: string,
        confirmPassword: string
    ): Promise<boolean> => {
        try {
            setError(null)
            const response = await authApi.confirmPasswordReset(token, password, confirmPassword)

            if (response.success) {
                return true
            } else {
                setError(response.error || 'Failed to reset password')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password')
            return false
        }
    }, [])

    // ==========================================
    // PASSWORD CHANGE
    // ==========================================

    const changePassword = useCallback(async (
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<boolean> => {
        try {
            setError(null)
            const response = await authApi.changePassword(currentPassword, newPassword, confirmPassword)

            if (response.success) {
                return true
            } else {
                setError(response.error || 'Failed to change password')
                return false
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to change password')
            return false
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isEmailVerified: !!user?.emailVerifiedAt,
                error,
                login,
                signup,
                logout,
                refreshUser,
                clearError,
                sendVerificationEmail,
                confirmEmailVerification,
                requestPasswordReset,
                verifyResetToken,
                confirmPasswordReset,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Hook for requiring authentication
export function useRequireAuth(redirectUrl: string = '/login') {
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            window.location.href = redirectUrl
        }
    }, [isLoading, isAuthenticated, redirectUrl])

    return { isAuthenticated, isLoading }
}

// Hook for requiring verified email
export function useRequireVerifiedEmail(redirectUrl: string = '/verify-email') {
    const { isAuthenticated, isEmailVerified, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && isAuthenticated && !isEmailVerified) {
            window.location.href = redirectUrl
        }
    }, [isLoading, isAuthenticated, isEmailVerified, redirectUrl])

    return { isAuthenticated, isEmailVerified, isLoading }
}
