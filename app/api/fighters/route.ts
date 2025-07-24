import { NextRequest, NextResponse } from 'next/server';
import { FighterService } from '@/lib/services/fighter.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Public endpoint - no auth required for GET
    const fighters = await FighterService.getAllFighters();
    return NextResponse.json(fighters);
  } catch (error) {
    return NextResponse.json({ error: 'Fighters not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admins can create fighters)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const fighterData = await req.json();
    const fighter = await FighterService.createFighter(fighterData);
    return NextResponse.json(fighter, { status: 201 });
  } catch (error) {
    console.error('Create fighter error:', error);
    return NextResponse.json(
      { error: 'Failed to create fighter' },
      { status: 500 }
    );
  }
}
