import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event.service';

export async function GET(req: NextRequest) {
  try {
    const events = await EventService.getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Events not found' }, { status: 404 });
  }
}
