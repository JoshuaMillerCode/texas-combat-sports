import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await EventService.getEventBySlug(params.slug);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
}
