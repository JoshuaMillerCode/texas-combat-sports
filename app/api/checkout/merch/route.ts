import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

interface MerchandiseItem {
  id: string;
  stripePriceId: string; // Only need price ID and quantity now
  quantity: number;
  variant?: string; // Optional variant info for metadata
}

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
    let body: { items: MerchandiseItem[] };
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
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Validate item data
    for (const item of body.items) {
      if (!item.stripePriceId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            error:
              'Invalid item data: each item must have stripePriceId and valid quantity',
          },
          { status: 400 }
        );
      }

      // Validate price ID format (Stripe price IDs start with 'price_')
      if (!item.stripePriceId.startsWith('price_')) {
        return NextResponse.json(
          { error: 'Invalid Stripe price ID format' },
          { status: 400 }
        );
      }
    }

    // Create line items for Stripe using predefined price IDs
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      body.items.map((item) => ({
        price: item.stripePriceId, // Use predefined Stripe price ID
        quantity: item.quantity,
      }));

    // Get the origin for redirect URLs
    const origin =
      req.nextUrl.origin ||
      process.env.NEXT_PUBLIC_DOMAIN ||
      'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/checkout/success/merch?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?checkout=cancelled`,
      metadata: {
        order_type: 'merchandise',
        item_count: body.items.length.toString(),
        total_quantity: body.items
          .reduce((sum, item) => sum + item.quantity, 0)
          .toString(),
        // Store variant information in metadata for order processing
        variants: JSON.stringify(
          body.items.map((item) => ({
            id: item.id,
            variant: item.variant || 'Default',
          }))
        ),
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: 'Your merchandise will be shipped to the provided address.',
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
