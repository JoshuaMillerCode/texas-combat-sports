import { NextRequest, NextResponse } from 'next/server';
import { DollService } from '@/lib/services/doll.service';
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
    const doll = await DollService.getDollById(params.id);
    return NextResponse.json(doll);
  } catch (error) {
    return NextResponse.json({ error: 'Doll not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can update dolls)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const dollData = await req.json();
    const doll = await DollService.updateDoll(params.id, dollData);

    if (!doll) {
      return NextResponse.json({ error: 'Doll not found' }, { status: 404 });
    }

    return NextResponse.json(doll);
  } catch (error) {
    console.error('Update doll error:', error);
    return NextResponse.json(
      { error: 'Failed to update doll' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can delete dolls)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const success = await DollService.deleteDoll(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Doll not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Doll deleted successfully' });
  } catch (error) {
    console.error('Delete doll error:', error);
    return NextResponse.json(
      { error: 'Failed to delete doll' },
      { status: 500 }
    );
  }
}
