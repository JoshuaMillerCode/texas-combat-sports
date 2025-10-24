import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { CheckoutSessionData } from '@/types/stripe';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { TicketTierService } from '@/lib/services/ticketTier.service';
import { FlashSaleService } from '@/lib/services/flashSale.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Check if ticket sales are enabled
    if (!isFeatureEnabled('TICKET_SALES_ENABLED')) {
      return NextResponse.json(
        { error: 'Ticket sales are currently disabled' },
        { status: 503 }
      );
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system configuration error' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body: CheckoutSessionData;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Invalid JSON in request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.eventId || !body.tickets || body.tickets.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId and tickets are required' },
        { status: 400 }
      );
    }

    // Validate ticket data
    for (const ticket of body.tickets) {
      if (!ticket.stripePriceId || !ticket.quantity || ticket.quantity <= 0) {
        return NextResponse.json(
          {
            error:
              'Invalid ticket data: each ticket must have a valid price ID and quantity',
          },
          { status: 400 }
        );
      }
    }

    // Validate ticket availability (but don't reserve yet)
    console.log('Validating ticket availability...');

    for (const ticket of body.tickets) {
      const ticketTier = await TicketTierService.getTicketTierById(
        ticket.tierId
      );
      if (!ticketTier) {
        return NextResponse.json(
          { error: `Ticket tier not found: ${ticket.tierName}` },
          { status: 400 }
        );
      }

      if (!ticketTier.isActive) {
        return NextResponse.json(
          { error: `Ticket tier "${ticket.tierName}" is no longer available` },
          { status: 400 }
        );
      }

      if (ticketTier.availableQuantity < ticket.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient tickets available for "${ticket.tierName}". Only ${ticketTier.availableQuantity} tickets remaining.`,
          },
          { status: 400 }
        );
      }

      console.log(
        `✅ ${ticket.tierName}: ${ticket.quantity} tickets available (${ticketTier.availableQuantity} remaining)`
      );
    }

    // Check for active flash sales and use flash sale prices if applicable
    const pricePromises = body.tickets.map(async (ticket) => {
      try {
        // Get the ticket tier to check for flash sales
        const ticketTier = await TicketTierService.getTicketTierById(
          ticket.tierId
        );

        if (!ticketTier) {
          throw new Error(`Ticket tier not found: ${ticket.tierId}`);
        }

        // Check if flash sales are enabled and get effective price ID
        let effectivePriceId = ticket.stripePriceId;
        let isFlashSale = false;

        if (isFeatureEnabled('FLASH_SALES_ENABLED')) {
          const priceInfo = await FlashSaleService.getEffectiveStripePriceId(
            ticketTier
          );
          effectivePriceId = priceInfo.stripePriceId;
          isFlashSale = priceInfo.isFlashSale;

          if (isFlashSale) {
            console.log(
              `✨ Flash sale active for ${ticket.tierName}: using price ${effectivePriceId}`
            );
          }
        }

        // Fetch the actual price from Stripe to ensure accuracy
        const stripePrice = await stripe.prices.retrieve(effectivePriceId);
        return {
          priceId: effectivePriceId,
          quantity: ticket.quantity,
          unitAmountCents: stripePrice.unit_amount || 0,
          currency: stripePrice.currency,
          isFlashSale,
        };
      } catch (error) {
        console.error(`Failed to fetch price ${ticket.stripePriceId}:`, error);
        throw new Error(`Invalid price ID: ${ticket.stripePriceId}`);
      }
    });

    const fetchedPrices = await Promise.all(pricePromises);

    // Validate all prices use the same currency
    const currencies = [...new Set(fetchedPrices.map((p) => p.currency))];
    if (currencies.length > 1) {
      return NextResponse.json(
        { error: 'All tickets must use the same currency' },
        { status: 400 }
      );
    }

    // Create line items for Stripe using the effective price IDs (flash sale or regular)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      fetchedPrices.map((price) => ({
        price: price.priceId,
        quantity: price.quantity,
      }));

    // Calculate total amount from Stripe-fetched prices (already in cents)
    let totalAmountInCents = 0;
    for (const price of fetchedPrices) {
      totalAmountInCents += price.unitAmountCents * price.quantity;
    }

    // Debug logging
    console.log('=== Checkout Debug Info ===');
    console.log('Fetched Prices:', fetchedPrices);
    console.log('Total Amount (USD):', totalAmountInCents / 100);
    console.log('Total Amount (cents):', totalAmountInCents);
    console.log('============================');

    // Get the origin for redirect URLs
    const origin =
      req.nextUrl.origin ||
      process.env.NEXT_PUBLIC_DOMAIN ||
      'http://localhost:3000';

    // Create checkout session with Stripe Connect
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      allow_promotion_codes: true,
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${body.eventId}?checkout=cancelled`,
      metadata: {
        eventId: body.eventId,
        eventTitle: body.eventTitle,
        eventDate: body.eventDate,
        eventVenue: body.eventVenue,
        ticketData: JSON.stringify(
          body.tickets.map((ticket) => ({
            t: ticket.tierId, // tierId
            n: ticket.tierName, // tierName
            q: ticket.quantity, // quantity
            p: ticket.price, // price
            s: ticket.stripePriceId, // stripePriceId
          }))
        ),
        flashSaleData: JSON.stringify(
          (
            await Promise.all(
              fetchedPrices.map(async (price, index) => {
                const ticket = body.tickets[index];

                // Only include flash sale data if there's actually a flash sale
                if (price.isFlashSale) {
                  // Get flash sale details
                  const ticketTier = await TicketTierService.getTicketTierById(
                    ticket.tierId
                  );
                  if (ticketTier) {
                    const flashSalePricing =
                      await FlashSaleService.getFlashSalePricing(
                        ticketTier._id.toString()
                      );
                    if (
                      flashSalePricing.hasFlashSale &&
                      flashSalePricing.flashSale
                    ) {
                      return {
                        t: ticket.tierId, // tierId
                        fs: flashSalePricing.flashSale._id.toString(), // flashSaleId
                        ft: flashSalePricing.flashSale.title.substring(0, 15), // flashSaleTitle (truncated to 15 chars)
                        op: flashSalePricing.originalPrice, // originalPrice
                        ap: price.unitAmountCents, // actualPricePaid
                      };
                    }
                  }
                }

                // Return null for non-flash sale items to filter them out
                return null;
              })
            )
          ).filter((item) => item !== null) // Remove null items
        ),
        order_type: 'event_tickets',
        total_amount: totalAmountInCents.toString(),
      },
      customer_email: body.customerEmail,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message:
            'Tickets will be sent to your email after payment confirmation.',
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    console.log('✅ Checkout session created:', {
      sessionId: session.id,
      totalAmountCents: totalAmountInCents,
      totalAmountUSD: totalAmountInCents / 100,
    });

    // Return successful response
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Payment processing error';

      return NextResponse.json({ error: message }, { status: statusCode });
    }

    // Handle other errors
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
