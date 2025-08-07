import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get('isPublic');
    const isLiveEvent = searchParams.get('isLiveEvent');
    const associatedEvent = searchParams.get('associatedEvent');

    const filters: any = {};

    if (isPublic !== null) {
      filters.isPublic = isPublic === 'true';
    }

    if (isLiveEvent !== null) {
      filters.isLiveEvent = isLiveEvent === 'true';
    }

    if (associatedEvent) {
      filters.associatedEvent = associatedEvent;
    }

    const videos = await VideoService.getAllVideos(filters);
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admins can create videos)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const videoData = await req.json();
    const video = await VideoService.createVideo(videoData);

    if (!video) {
      return NextResponse.json(
        { error: 'Failed to create video' },
        { status: 500 }
      );
    }

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
