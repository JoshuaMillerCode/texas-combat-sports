import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get('upcoming');

    let videos;
    if (upcoming === 'true') {
      videos = await VideoService.getUpcomingLiveEvents();
    } else {
      videos = await VideoService.getLiveEvents();
    }

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch live events' },
      { status: 500 }
    );
  }
}
