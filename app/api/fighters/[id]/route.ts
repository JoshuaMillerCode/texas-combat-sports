import { NextRequest, NextResponse } from 'next/server';
import { FighterService } from '@/lib/services/fighter.service';
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
    const fighter = await FighterService.getFighterById(params.id);
    return NextResponse.json(fighter);
  } catch (error) {
    return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can update fighters)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const fighterData = await req.json();
    const fighter = await FighterService.updateFighter(params.id, fighterData);

    if (!fighter) {
      return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
    }

    return NextResponse.json(fighter);
  } catch (error) {
    console.error('Update fighter error:', error);
    return NextResponse.json(
      { error: 'Failed to update fighter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can delete fighters)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const success = await FighterService.deleteFighter(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Fighter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Fighter deleted successfully' });
  } catch (error) {
    console.error('Delete fighter error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fighter' },
      { status: 500 }
    );
  }
}
