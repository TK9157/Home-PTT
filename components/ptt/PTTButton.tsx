'use client';

import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { getAblyChannel } from '@/lib/realtime';

export function PTTButton() {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from API
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.userId) {
          setUserId(data.userId);
        }
      })
      .catch(() => {
        console.error('Failed to get userId');
      });
  }, []);

  const handleMouseDown = async () => {
    try {
      setError('');
      await startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const handleMouseUp = async () => {
    if (!isRecording) return;

    try {
      setUploading(true);
      setError('');

      // Step 1: Stop recording and get audio Blob
      const audioBlob = await stopRecording();

      // Step 2: Upload audio to server
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const uploadResponse = await fetch('/api/audio-upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { audio_url } = await uploadResponse.json();

      // Step 3: Use userId from state
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Step 4: Publish to Ably channel
      const channel = getAblyChannel('house-wide');
      await channel.publish('audio-message', {
        senderId: userId,
        audioUrl: audio_url,
        timestamp: Date.now(),
      });

      console.log('Audio published successfully:', audio_url);
    } catch (err) {
      console.error('Error in PTT workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={isRecording ? handleMouseUp : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={uploading}
        className={`
          w-48 h-48 rounded-full
          flex items-center justify-center
          text-white font-bold text-xl
          transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse scale-110'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          }
          ${uploading ? 'bg-yellow-600 animate-pulse' : ''}
          shadow-2xl
        `}
      >
        {uploading ? (
          <span className="text-center">
            <div className="animate-spin mb-2">⏳</div>
            <div className="text-sm">Sending...</div>
          </span>
        ) : isRecording ? (
          <span className="text-center">
            <div className="text-4xl mb-2">🎤</div>
            <div className="text-sm">Recording</div>
          </span>
        ) : (
          <span className="text-center">
            <div className="text-4xl mb-2">📻</div>
            <div className="text-sm">Push to Talk</div>
          </span>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm max-w-md text-center">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-600 text-center max-w-md">
        {isRecording
          ? 'Release to send message'
          : uploading
          ? 'Uploading and broadcasting...'
          : 'Press and hold to record, release to send'}
      </p>
    </div>
  );
}

