import { NextRequest, NextResponse } from 'next/server';
import { FighterService } from '@/lib/services/fighter.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fighter = await FighterService.getFighterById(params.id);
    return NextResponse.json(fighter);
  } catch (error) {
    return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
  }
}
