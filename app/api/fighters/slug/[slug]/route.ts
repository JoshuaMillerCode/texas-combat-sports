import { NextRequest, NextResponse } from 'next/server';
import { FighterService } from '@/lib/services/fighter.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const fighter = await FighterService.getFighterBySlug(params.slug);
    if (!fighter) {
      return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
    }

    const [upcomingFights, pastFights] = await Promise.all([
      FighterService.getFighterUpcomingFights(fighter._id.toString()),
      FighterService.getFighterFights(fighter._id.toString()),
    ]);

    // pastFights includes all fights; filter to those with a result
    const completedFights = pastFights.filter((f: any) => f.result?.method);

    return NextResponse.json({ fighter, upcomingFights, pastFights: completedFights });
  } catch (error) {
    console.error('Fighter by slug error:', error);
    return NextResponse.json({ error: 'Failed to fetch fighter' }, { status: 500 });
  }
}
