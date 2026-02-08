import { NextRequest, NextResponse } from 'next/server';
import { DollService } from '@/lib/services/doll.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Public endpoint - no auth required for GET
    const dolls = await DollService.getAllDolls();
    return NextResponse.json(dolls);
  } catch (error) {
    return NextResponse.json({ error: 'Dolls not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admins can create dolls)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const dollData = await req.json();
    const doll = await DollService.createDoll(dollData);
    return NextResponse.json(doll, { status: 201 });
  } catch (error) {
    console.error('Create doll error:', error);
    return NextResponse.json(
      { error: 'Failed to create doll' },
      { status: 500 }
    );
  }
}
