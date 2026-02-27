import { NextRequest, NextResponse } from 'next/server'

interface LoginRequest {
  username: string
  password: string
}

const MOCK_USER = {
  id: '1',
  username: 'admin',
  password: '1234',
  email: 'admin@pulsar.dev',
  avatar_url: null,
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      const token = Buffer.from(
        JSON.stringify({ userId: MOCK_USER.id, username: MOCK_USER.username })
      ).toString('base64')

      return NextResponse.json({
        token,
        user: {
          id: MOCK_USER.id,
          username: MOCK_USER.username,
          email: MOCK_USER.email,
          avatar_url: MOCK_USER.avatar_url,
        },
      })
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
