import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { authenticateToken, requireAdmin, createAuthErrorResponse } from '@/lib/middleware/auth';
import { TicketTierService } from '@/lib/services/ticketTier.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = authenticateToken(req);
  if (!authUser || !requireAdmin(authUser)) {
    return createAuthErrorResponse('Admin access required', 403);
  }

  try {
    const tier = await TicketTierService.getTicketTierById(params.id);
    if (!tier) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 });
    }

    // Retrieve the current Stripe price to get the product ID
    const currentPrice = await stripe.prices.retrieve(tier.stripePriceId);
    const productId = typeof currentPrice.product === 'string'
      ? currentPrice.product
      : currentPrice.product.id;

    // List all active prices for this product
    const { data: prices } = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 20,
    });

    // Sort by unit_amount ascending
    const sorted = prices
      .filter((p) => p.unit_amount !== null)
      .sort((a, b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0));

    return NextResponse.json({
      currentPriceId: tier.stripePriceId,
      productId,
      prices: sorted.map((p) => ({
        id: p.id,
        unit_amount: p.unit_amount,
        currency: p.currency,
        created: p.created,
      })),
    });
  } catch (error: any) {
    console.error('Stripe prices fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch Stripe prices' }, { status: 500 });
  }
}
