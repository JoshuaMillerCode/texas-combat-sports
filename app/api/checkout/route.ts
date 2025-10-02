import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { CheckoutSessionData } from '@/types/stripe';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system configuration error' },
        { status: 500 }
      );
    }

    // Validate organizer account configuration
    if (!process.env.ORGANIZER_STRIPE_ACCOUNT_ID) {
      console.error('ORGANIZER_STRIPE_ACCOUNT_ID is not configured');
      return NextResponse.json(
        { error: 'Organizer account configuration error' },
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

    // Fetch actual prices from Stripe API to ensure accuracy
    const pricePromises = body.tickets.map(async (ticket) => {
      try {
        const stripePrice = await stripe.prices.retrieve(ticket.stripePriceId);
        return {
          priceId: ticket.stripePriceId,
          quantity: ticket.quantity,
          unitAmountCents: stripePrice.unit_amount || 0,
          currency: stripePrice.currency,
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

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      body.tickets.map((ticket) => ({
        price: ticket.stripePriceId,
        quantity: ticket.quantity,
      }));

    // Calculate total amount from Stripe-fetched prices (already in cents)
    let totalAmountInCents = 0;
    for (const price of fetchedPrices) {
      totalAmountInCents += price.unitAmountCents * price.quantity;
    }

    // Calculate 4% application fee (ensure it's an integer in cents)
    const applicationFeeAmount = Math.round(totalAmountInCents * 0.04);

    // Calculate the amount that will be transferred to organizer
    const transferAmountCents = totalAmountInCents - applicationFeeAmount;

    // Debug logging
    console.log('=== Checkout Debug Info ===');
    console.log('Fetched Prices:', fetchedPrices);
    console.log('Total Amount (USD):', totalAmountInCents / 100);
    console.log('Total Amount (cents):', totalAmountInCents);
    console.log('Application Fee (4% in cents):', applicationFeeAmount);
    console.log('Application Fee (USD):', applicationFeeAmount / 100);
    console.log('Organizer receives (cents):', transferAmountCents);
    console.log('Organizer receives (USD):', transferAmountCents / 100);
    console.log(
      'Organizer Account ID:',
      process.env.ORGANIZER_STRIPE_ACCOUNT_ID
    );
    console.log('============================');

    // Validate Connect account ID format (should start with 'acct_')
    if (!process.env.ORGANIZER_STRIPE_ACCOUNT_ID.startsWith('acct_')) {
      console.error(
        'Invalid ORGANIZER_STRIPE_ACCOUNT_ID format:',
        process.env.ORGANIZER_STRIPE_ACCOUNT_ID
      );
      return NextResponse.json(
        { error: 'Invalid organizer account configuration' },
        { status: 500 }
      );
    }

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
        ticketData: JSON.stringify(body.tickets),
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
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        on_behalf_of: process.env.ORGANIZER_STRIPE_ACCOUNT_ID,
        transfer_data: {
          destination: process.env.ORGANIZER_STRIPE_ACCOUNT_ID,
        },
      },
    });

    console.log('✅ Checkout session created with application fee:', {
      sessionId: session.id,
      totalAmountCents: totalAmountInCents,
      totalAmountUSD: totalAmountInCents / 100,
      applicationFeeAmount,
      applicationFeeUSD: applicationFeeAmount / 100,
      transferAmountCents,
      transferAmountUSD: transferAmountCents / 100,
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
