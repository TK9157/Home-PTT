import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST handler for user login.
 * Accepts a username, generates a secure userId, and sets it in an httpOnly cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    // Validate username is provided
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Generate secure userId using UUID v4
    const userId = uuidv4();

    // Set secure cookie with userId
    const cookieStore = await cookies();
    cookieStore.set('ptt-session-id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      success: true,
      userId,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

