import { NextRequest, NextResponse } from 'next/server';
import { FighterService } from '@/lib/services/fighter.service';

export async function GET(req: NextRequest) {
  try {
    const fighters = await FighterService.getAllFighters();
    return NextResponse.json(fighters);
  } catch (error) {
    return NextResponse.json({ error: 'Fighters not found' }, { status: 404 });
  }
}
