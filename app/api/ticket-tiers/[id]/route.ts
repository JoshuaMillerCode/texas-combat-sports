import { NextRequest, NextResponse } from 'next/server';
import { TicketTierService } from '@/lib/services/ticketTier.service';
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
    const tier = await TicketTierService.getTicketTierById(params.id);
    if (!tier) {
      return NextResponse.json(
        { error: 'Ticket tier not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(tier);
  } catch (error) {
    console.error('Error fetching ticket tier:', error);
    return NextResponse.json(
      { error: 'Ticket tier not found' },
      { status: 404 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can update ticket tiers)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const tierData = await req.json();
    const tier = await TicketTierService.updateTicketTier(params.id, tierData);

    if (!tier) {
      return NextResponse.json(
        { error: 'Ticket tier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tier);
  } catch (error) {
    console.error('Update ticket tier error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket tier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request (only admins can delete ticket tiers)
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const success = await TicketTierService.deleteTicketTier(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Ticket tier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ticket tier deleted successfully' });
  } catch (error) {
    console.error('Delete ticket tier error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket tier' },
      { status: 500 }
    );
  }
}
