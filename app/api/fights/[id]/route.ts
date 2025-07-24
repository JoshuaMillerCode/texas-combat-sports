import { NextRequest, NextResponse } from 'next/server';
import { FightService } from '@/lib/services/fight.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Public endpoint - no auth required for GET
    const fight = await FightService.getFightById(params.id);
    if (!fight) {
      return NextResponse.json({ error: 'Fight not found' }, { status: 404 });
    }
    return NextResponse.json(fight);
  } catch (error) {
    console.error('Error fetching fight:', error);
    return NextResponse.json({ error: 'Fight not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can update fights)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const fightData = await req.json();
    const fight = await FightService.updateFight(params.id, fightData);

    if (!fight) {
      return NextResponse.json({ error: 'Fight not found' }, { status: 404 });
    }

    return NextResponse.json(fight);
  } catch (error) {
    console.error('Update fight error:', error);
    return NextResponse.json(
      { error: 'Failed to update fight' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can delete fights)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const success = await FightService.deleteFight(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Fight not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Fight deleted successfully' });
  } catch (error) {
    console.error('Delete fight error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fight' },
      { status: 500 }
    );
  }
}
