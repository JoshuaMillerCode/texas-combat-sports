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

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      body.tickets.map((ticket) => ({
        price: ticket.stripePriceId,
        quantity: ticket.quantity,
      }));

    // Get the origin for redirect URLs
    const origin =
      req.nextUrl.origin ||
      process.env.NEXT_PUBLIC_DOMAIN ||
      'http://localhost:3000';

    // Create checkout session
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
