import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video.service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Public endpoint - anyone can increment view count
    const success = await VideoService.incrementViewCount(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'View count incremented successfully',
    });
  } catch (error) {
    console.error('Increment view count error:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
