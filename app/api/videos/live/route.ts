import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video.service';

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
    console.error('Error fetching live events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live events' },
      { status: 500 }
    );
  }
}
