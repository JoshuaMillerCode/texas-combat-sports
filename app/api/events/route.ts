import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Public endpoint - no auth required for GET
    if (req.nextUrl.searchParams.get('isPastEvent') === 'true') {
      const events = await EventService.getPastEvents();
      return NextResponse.json(events);
    } else if (req.nextUrl.searchParams.get('isActive') === 'true') {
      const events = await EventService.getUpcomingEvents();
      return NextResponse.json(events);
    }
    const events = await EventService.getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Events not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admins can create events)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const eventData = await req.json();
    const event = await EventService.createEvent(eventData);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
