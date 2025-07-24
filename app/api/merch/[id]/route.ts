import { NextRequest, NextResponse } from 'next/server';
import { MerchService } from '@/lib/services/merch.service';
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
    const merch = await MerchService.getMerchById(params.id);
    return NextResponse.json(merch);
  } catch (error) {
    return NextResponse.json({ error: 'Merch not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can update merch)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const merchData = await req.json();
    const merch = await MerchService.updateMerch(params.id, merchData);

    if (!merch) {
      return NextResponse.json({ error: 'Merch not found' }, { status: 404 });
    }

    return NextResponse.json(merch);
  } catch (error) {
    console.error('Update merch error:', error);
    return NextResponse.json(
      { error: 'Failed to update merch' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can delete merch)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const success = await MerchService.deleteMerch(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Merch not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Merch deleted successfully' });
  } catch (error) {
    console.error('Delete merch error:', error);
    return NextResponse.json(
      { error: 'Failed to delete merch' },
      { status: 500 }
    );
  }
}
