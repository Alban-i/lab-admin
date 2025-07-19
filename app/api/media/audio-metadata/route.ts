import { NextRequest, NextResponse } from 'next/server';
import { updateAudioMetadata, extractAudioMetadata } from '@/actions/media/update-audio-metadata';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    console.log('🎵 Audio metadata API called with action:', action);

    if (action === 'update') {
      const result = await updateAudioMetadata(data);
      return NextResponse.json(result);
    } else if (action === 'extract') {
      const result = await extractAudioMetadata(data.mediaId);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Audio metadata API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}