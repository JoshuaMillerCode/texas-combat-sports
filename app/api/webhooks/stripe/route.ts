import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TransactionService } from '@/lib/services/transaction.service';
import { MerchService } from '@/lib/services/merch.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Payment successful for session:', session.id);

        // Determine order type from metadata
        const orderType = session.metadata?.order_type || 'unknown';

        if (orderType === 'merchandise') {
          // Handle merchandise order - now process based on line items with price IDs
          console.log('Processing merchandise order:', {
            sessionId: session.id,
            customerEmail: session.customer_details?.email,
            amount: session.amount_total,
            itemCount: session.metadata?.item_count,
          });

          // Retrieve the session with line items to get price IDs
          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            {
              expand: ['line_items', 'line_items.data.price.product'],
            }
          );

          // Process each line item based on price ID
          if (sessionWithLineItems.line_items?.data) {
            for (const lineItem of sessionWithLineItems.line_items.data) {
              const priceId = lineItem.price?.id;
              const quantity = lineItem.quantity;
              const productId = lineItem.price?.product;

              console.log('Processing line item:', {
                priceId,
                quantity,
                productId,
                amount: lineItem.amount_total,
              });

              // Here you would typically:
              // 1. Map price_id to your internal product data
              // 2. Update inventory based on price_id
              // 3. Create order record with price_id reference
              // 4. Generate shipping labels
            }
          }

          // Parse variant information from metadata if available
          if (session.metadata?.variants) {
            try {
              const variants = JSON.parse(session.metadata.variants);
              console.log('Order variants:', variants);
              // Process variant information for fulfillment
            } catch (error) {
              console.error('Error parsing variants metadata:', error);
            }
          }

          // Here you would typically:
          // 1. Save order to database with price_id references
          // 2. Update inventory based on price_ids
          // 3. Send confirmation email
          // 4. Create shipping label
        } else if (orderType === 'event_tickets') {
          // Handle event ticket order
          console.log('Processing event ticket order:', {
            sessionId: session.id,
            eventId: session.metadata?.eventId,
            customerEmail: session.customer_details?.email,
            amount: session.amount_total,
          });

          // Here you would typically:
          // 1. Save ticket order to database
          // 2. Generate ticket PDFs
          // 3. Send tickets via email
          // 4. Update event capacity
        }

        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
