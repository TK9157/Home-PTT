import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';

/**
 * GET handler to check current user session.
 * Returns userId if authenticated, null otherwise.
 */
export async function GET() {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      userId,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

