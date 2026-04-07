import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TicketTierService } from '@/lib/services/ticketTier.service';
import {
  authenticateToken,
  requireAdmin,
  createAuthErrorResponse,
} from '@/lib/middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

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
    const authUser = authenticateToken(req);
    if (!authUser || !requireAdmin(authUser)) {
      return createAuthErrorResponse('Admin access required', 403);
    }

    const body = await req.json();
    const { newPriceAmount, ...tierData } = body;

    if (newPriceAmount != null) {
      const parsed = typeof newPriceAmount === 'number' ? newPriceAmount : parseFloat(newPriceAmount);
      if (!isFinite(parsed) || parsed < 0.5) {
        return NextResponse.json(
          { error: 'Invalid price: must be a number ≥ $0.50' },
          { status: 400 }
        );
      }
    }

    let oldPriceIdToArchive: string | null = null;

    if (newPriceAmount != null) {
      // Create a new Stripe price
      const currentTier = await TicketTierService.getTicketTierById(params.id);
      if (!currentTier) {
        return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 });
      }

      const currentPrice = await stripe.prices.retrieve(currentTier.stripePriceId);
      const productId = typeof currentPrice.product === 'string'
        ? currentPrice.product
        : currentPrice.product.id;

      const newPrice = await stripe.prices.create({
        unit_amount: Math.round(newPriceAmount * 100),
        currency: currentPrice.currency,
        product: productId,
      });

      oldPriceIdToArchive = currentTier.stripePriceId;
      tierData.stripePriceId = newPrice.id;
      tierData.price = Math.round(newPriceAmount * 100); // store in cents
    } else if (tierData.stripePriceId) {
      // Existing price selected — sync the stored price from Stripe (unit_amount is already cents)
      const price = await stripe.prices.retrieve(tierData.stripePriceId);
      if (price.unit_amount != null) {
        tierData.price = price.unit_amount;
      }
    }

    const tier = await TicketTierService.updateTicketTier(params.id, tierData);

    if (!tier) {
      return NextResponse.json(
        { error: 'Ticket tier not found' },
        { status: 404 }
      );
    }

    // Archive old price after DB is updated — non-critical, don't let it fail the request
    if (oldPriceIdToArchive) {
      stripe.prices.update(oldPriceIdToArchive, { active: false }).catch((err) => {
        console.error('Failed to archive old Stripe price:', oldPriceIdToArchive, err);
      });
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
