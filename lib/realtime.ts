'use client';

import * as Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    const apiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
    
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_ABLY_API_KEY is not set');
    }

    ablyClient = new Ably.Realtime({
      key: apiKey,
    });
  }

  return ablyClient;
}

export function getAblyChannel(channelName: string): Ably.RealtimeChannel {
  const client = getAblyClient();
  return client.channels.get(channelName);
}

