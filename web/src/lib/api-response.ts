import { NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
    success: boolean
    message?: string
    data?: T
    error?: string
    errors?: Record<string, string[]>
}

export function successResponse<T>(data: T, message?: string, status = 200) {
    return NextResponse.json<ApiResponse<T>>(
        {
            success: true,
            message,
            data,
        },
        { status }
    )
}

export function errorResponse(
    message: string,
    status = 400,
    errors?: Record<string, string[]>
) {
    return NextResponse.json<ApiResponse>(
        {
            success: false,
            error: message,
            errors,
        },
        { status }
    )
}

export function notFoundResponse(message = 'Resource not found') {
    return errorResponse(message, 404)
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Forbidden') {
    return errorResponse(message, 403)
}

export function serverErrorResponse(error: unknown) {
    console.error('Server error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return errorResponse(message, 500)
}

export function validationErrorResponse(errors: Record<string, string[]>) {
    return NextResponse.json<ApiResponse>(
        {
            success: false,
            error: 'Validation failed',
            errors,
        },
        { status: 422 }
    )
}
