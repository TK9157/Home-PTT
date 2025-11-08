'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Ably from 'ably';
import { PTTButton } from '@/components/ptt/PTTButton';
import { getAblyChannel } from '@/lib/realtime';

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          setUserId(data.userId);
          // Store username in localStorage or get from somewhere
          setUsername(data.userId.substring(0, 8));
        } else {
          setAuthenticated(false);
          router.push('/login');
        }
      })
      .catch(() => {
        setAuthenticated(false);
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    if (!authenticated || !userId) return;

    // Subscribe to Ably channel for audio playback
    const channel = getAblyChannel('house-wide');

    channel.subscribe('audio-message', (message: Ably.Message) => {
      const { audioUrl, senderId } = message.data as {
        audioUrl: string;
        senderId: string;
        timestamp: number;
      };

      // Don't play our own messages
      if (senderId === userId) {
        return;
      }

      // Play the audio
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
      });

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New PTT Message', {
          body: `Message from ${senderId.substring(0, 8)}`,
          icon: '/favicon.ico',
        });
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      channel.unsubscribe();
    };
  }, [authenticated, userId]);

  if (authenticated === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              PTT - Push to Talk
            </h1>
            <p className="text-gray-600">
              Connected as: <span className="font-semibold">{username}</span>
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <PTTButton />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Press and hold the button to record, release to broadcast
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Works on desktop, tablet, and mobile
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
