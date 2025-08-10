import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TransactionService } from '@/lib/services/transaction.service';
import { MerchService } from '@/lib/services/merch.service';
import { EmailService } from '@/lib/services/email.service';
import { TicketGenerator } from '@/lib/utils/ticket-generator';
import { EventService } from '@/lib/services/event.service';
import { OrderIDGenerator } from '@/lib/utils/order-id-generator';
import mongoose from 'mongoose';

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

          console.log('Session metadata:', session.metadata);

          const ticketItems = await TransactionService.formatTicketItems(
            session.metadata?.ticketData
          );

          const orderId = OrderIDGenerator.generateOrderID();

          const transaction = await TransactionService.createTransaction({
            type: orderType,
            event: session.metadata?.eventId
              ? new mongoose.Types.ObjectId(session.metadata.eventId)
              : undefined,
            orderId: orderId,
            stripeSessionId: session.id,
            stripePaymentIntentId:
              (session.payment_intent as string) || undefined,
            customerDetails: {
              email: session.customer_details?.email || '',
              name: session.customer_details?.name || '',
              phone: session.customer_details?.phone || undefined,
              address: session.customer_details?.address
                ? {
                    line1: session.customer_details.address.line1 || '',
                    line2: session.customer_details.address.line2 || undefined,
                    city: session.customer_details.address.city || '',
                    state: session.customer_details.address.state || '',
                    postal_code:
                      session.customer_details.address.postal_code || '',
                    country: session.customer_details.address.country || '',
                  }
                : undefined,
            },
            status: 'confirmed',
            purchaseDate: new Date(),
            summary: {
              totalItems:
                ticketItems?.reduce(
                  (sum: number, item: any) => sum + item.quantity,
                  0
                ) || 0,
              totalTickets:
                ticketItems?.reduce(
                  (sum: number, item: any) => sum + item.quantity,
                  0
                ) || 0,
              totalMerch: 0,
              subtotal: session.amount_subtotal || 0,
              taxes: session.total_details?.amount_tax || 0,
              fees: 0, // Stripe fees aren't directly available in session
              totalAmount: session.amount_total || 0,
              currency: (session.currency || 'usd').toUpperCase(),
            },
            metadata: {
              eventTitle: session.metadata?.eventTitle || '',
              eventDate: session.metadata?.eventDate || '',
              eventVenue: session.metadata?.eventVenue || '',
            },
            ticketItems: ticketItems,
          });

          // Generate and send tickets via email
          try {
            const event = await EventService.getEventById(
              session.metadata?.eventId || ''
            );
            if (event) {
              // Generate ticket PDFs
              const tickets = await TicketGenerator.generateMultipleTickets(
                transaction,
                event,
                { includeQRCode: true }
              );

              // Send email with tickets
              if (tickets.length > 0) {
                const emailSent = await EmailService.sendTicketConfirmation({
                  transaction,
                  event,
                  tickets,
                });

                if (emailSent) {
                  console.log('Ticket email sent successfully');
                } else {
                  console.error('Failed to send ticket email');
                  // Send fallback email without attachments
                  await EmailService.sendSimpleConfirmation(transaction, event);
                }
              }
            }
          } catch (error) {
            console.error('Error generating/sending tickets:', error);
            // Send fallback email
            try {
              const event = await EventService.getEventById(
                session.metadata?.eventId || ''
              );
              if (event) {
                await EmailService.sendSimpleConfirmation(transaction, event);
              }
            } catch (fallbackError) {
              console.error('Failed to send fallback email:', fallbackError);
            }
          }
        }

        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;

      case 'charge.updated':
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge updated:', charge.id);
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
