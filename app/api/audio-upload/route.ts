import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getUserId } from '@/lib/auth';

/**
 * POST handler for audio file upload.
 * Accepts FormData with an audio file, uploads it to Vercel Blob Storage,
 * and returns the public URL.
 */
export async function POST(request: Request) {
  try {
    // Get userId from cookie to authorize the request
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract audio file from FormData
    const formData = await request.formData();
    const file = formData.get('audio') as File | null;

    // Validate file is provided
    if (!file) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file type (optional but recommended)
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Construct unique file path
    const filePath = `/user_${userId}/${Date.now()}.webm`;

    // Upload to Vercel Blob Storage
    const blob = await put(filePath, buffer, {
      access: 'public',
      contentType: file.type || 'audio/webm',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Return the public URL
    return NextResponse.json({
      audio_url: blob.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

