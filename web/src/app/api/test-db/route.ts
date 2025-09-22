import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Get all users
    const users = await prisma.user.findMany()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      users: users,
      userCount: users.length
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Create a new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
