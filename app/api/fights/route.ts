import { NextRequest, NextResponse } from 'next/server';
import { FightService } from '@/lib/services/fight.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Public endpoint - no auth required for GET
    const fights = await FightService.getAllFights();
    return NextResponse.json(fights);
  } catch (error) {
    return NextResponse.json({ error: 'Fights not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admins can create fights)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const fightData = await req.json();
    const fight = await FightService.createFight(fightData);
    return NextResponse.json(fight, { status: 201 });
  } catch (error) {
    console.error('Create fight error:', error);
    return NextResponse.json(
      { error: 'Failed to create fight' },
      { status: 500 }
    );
  }
}
