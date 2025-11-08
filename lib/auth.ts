import { cookies } from 'next/headers';

/**
 * Retrieves the user ID from the ptt-session-id cookie.
 * @returns The user ID string if the cookie exists, null otherwise.
 */
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('ptt-session-id');
  return sessionId?.value || null;
}

