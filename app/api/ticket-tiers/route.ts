import { NextRequest, NextResponse } from 'next/server';
import { TicketTierService } from '@/lib/services/ticketTier.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    // Public endpoint - no auth required for GET
    const ticketTiers = await TicketTierService.getAllTicketTiers();
    return NextResponse.json(ticketTiers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ticket tiers not found' },
      { status: 404 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admins can create ticket tiers)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const tierData = await req.json();
    const tier = await TicketTierService.createTicketTier(tierData);
    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error('Create ticket tier error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket tier' },
      { status: 500 }
    );
  }
}
