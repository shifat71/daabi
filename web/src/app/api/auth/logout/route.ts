import { deleteSession } from '@/lib/auth'
import { successResponse, serverErrorResponse } from '@/lib/api-response'

export async function POST() {
    try {
        await deleteSession()
        return successResponse(null, 'Logged out successfully')
    } catch (error) {
        return serverErrorResponse(error)
    }
}
