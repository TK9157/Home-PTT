'use client';

import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder with WebM/Opus format
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        chunksRef.current = [];
        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorder.onerror = (event) => {
        setIsRecording(false);
        reject(new Error('Recording error'));
      };

      mediaRecorder.stop();
      mediaRecorderRef.current = null;
    });
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}

