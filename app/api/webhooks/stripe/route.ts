import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TransactionService } from '@/lib/services/transaction.service';
import { MerchService } from '@/lib/services/merch.service';
import { EmailService } from '@/lib/services/email.service';
import { TicketGenerator } from '@/lib/utils/ticket-generator';
import { EventService } from '@/lib/services/event.service';
import { OrderIDGenerator } from '@/lib/utils/order-id-generator';
import { TransferService } from '@/lib/services/transfer.service';
import { TicketTierService } from '@/lib/services/ticketTier.service';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    console.log('🔔 Webhook received - processing...');

    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Webhook signature verified, event type:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🎟️ Processing checkout.session.completed event');
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('📋 Session details:', {
          id: session.id,
          amount_total: session.amount_total,
          payment_intent: session.payment_intent,
          metadata: session.metadata,
        });

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

          // Check if transaction already exists to prevent duplicate key errors
          let transaction =
            await TransactionService.getTransactionByStripeSessionId(
              session.id
            );

          if (!transaction) {
            console.log('Creating new transaction for session:', session.id);

            const ticketItems = await TransactionService.formatTicketItems(
              session.metadata?.ticketData
            );

            const orderId = OrderIDGenerator.generateOrderID();

            transaction = await TransactionService.createTransaction({
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
                      line2:
                        session.customer_details.address.line2 || undefined,
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

            // Deduct ticket availability now that payment is confirmed
            // Only deduct if this is a new transaction (not already processed)
            if (ticketItems && ticketItems.length > 0) {
              console.log(
                'Deducting ticket availability for confirmed transaction:',
                transaction._id.toString()
              );
              for (const ticketItem of ticketItems) {
                try {
                  if (ticketItem.isPromoDeal) {
                    // For promo deals, we need to deduct from both tiers:
                    // 1. Deduct 1 from the promo tier (the purchase)
                    // 2. Deduct 3 from the GA tier (the actual tickets)

                    console.log(
                      'Promo deal detected - deducting from both tiers'
                    );

                    // First, deduct 1 from the promo tier
                    await TicketTierService.reserveTickets(
                      ticketItem.ticketTier.toString(),
                      1 // Always deduct 1 from promo tier
                    );
                    console.log(
                      `Deducted 1 ticket from promo tier ${ticketItem.ticketTier}`
                    );

                    // Then, find and deduct 3 from the General Admission tier
                    const gaTier = await TicketTierService.getTicketTierByName(
                      'General Admission'
                    );
                    if (gaTier) {
                      await TicketTierService.reserveTickets(
                        gaTier._id.toString(),
                        3 // Deduct 3 GA tickets
                      );
                      console.log(
                        `Deducted 3 tickets from GA tier ${gaTier._id}`
                      );
                    } else {
                      console.error(
                        'General Admission tier not found for promo deal'
                      );
                    }
                  } else {
                    // Regular ticket purchase - deduct normally
                    await TicketTierService.reserveTickets(
                      ticketItem.ticketTier.toString(),
                      ticketItem.quantity
                    );
                    console.log(
                      `Deducted ${ticketItem.quantity} tickets from tier ${ticketItem.ticketTier}`
                    );
                  }
                } catch (error) {
                  console.error(
                    `Failed to deduct tickets for tier ${ticketItem.ticketTier}:`,
                    error
                  );
                  // This is a critical error - the payment succeeded but we can't deduct tickets
                  // We should log this for manual intervention
                }
              }
            }

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
                    await EmailService.sendSimpleConfirmation(
                      transaction,
                      event
                    );
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
          } else {
            console.log(
              'Transaction already exists for session:',
              session.id,
              'skipping creation'
            );

            // Skip deduction for existing transactions to prevent double processing
            // The tickets should have already been deducted when the transaction was first created
            if (
              transaction &&
              transaction.ticketItems &&
              transaction.ticketItems.length > 0
            ) {
              console.log(
                'Skipping ticket deduction for existing transaction (already processed):',
                transaction._id.toString()
              );
            }
          }

          // Create service fee transfer (4%) to developer account
          // Only proceed if we have a transaction (either newly created or existing)
          if (transaction) {
            try {
              console.log('🔍 Checking transfer conditions:', {
                hasPaymentIntent: !!session.payment_intent,
                paymentIntent: session.payment_intent,
                hasAmountTotal: !!session.amount_total,
                amountTotal: session.amount_total,
                sessionId: session.id,
                transactionId: transaction._id.toString(),
              });

              if (session.amount_total) {
                // For checkout sessions, we might not have payment_intent immediately
                // Use session.id as a fallback identifier
                const identifier =
                  (session.payment_intent as string) || session.id;

                console.log('Creating service fee transfer for ticket order:', {
                  identifier,
                  totalAmount: session.amount_total,
                  transactionId: transaction._id.toString(),
                });

                const transferResult =
                  await TransferService.createServiceFeeTransfer(
                    identifier,
                    session.amount_total,
                    transaction._id.toString()
                  );

                if (transferResult.success) {
                  console.log(
                    'Service fee transfer created:',
                    transferResult.transferId
                  );
                } else {
                  console.error(
                    'Service fee transfer failed:',
                    transferResult.error
                  );
                }
              } else {
                console.warn(
                  '⚠️ No amount_total found in session, skipping transfer'
                );
              }
            } catch (error) {
              console.error('Error creating service fee transfer:', error);
              // Don't fail the webhook - transfer can be created manually if needed
            }
          } else {
            console.error('❌ No transaction found, cannot create transfer');
          }
        }

        break;

      case 'checkout.session.expired':
        console.log('🕐 Processing checkout.session.expired event');
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', expiredSession.id);
        // No action needed - tickets were not reserved during checkout
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;

      case 'payment_intent.succeeded':
        const succeededPaymentIntent = event.data
          .object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', succeededPaymentIntent.id);
        // Update transaction status if needed
        break;

      case 'payment_intent.canceled':
        const canceledPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment canceled:', canceledPaymentIntent.id);
        // No action needed - tickets were not reserved during checkout
        break;

      case 'charge.refunded':
        const refundedCharge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', {
          chargeId: refundedCharge.id,
          paymentIntentId: refundedCharge.payment_intent,
          refundAmount: refundedCharge.amount_refunded,
          isFullRefund: refundedCharge.refunded,
        });

        // Handle refund - update transaction status and potentially void tickets
        try {
          // Find the transaction by payment intent ID
          const paymentIntentId = refundedCharge.payment_intent as string;
          const transaction =
            await TransactionService.getTransactionByPaymentIntent(
              paymentIntentId
            );

          if (transaction) {
            console.log(
              'Found transaction for refund:',
              transaction._id.toString()
            );

            // Update transaction status
            await TransactionService.updateTransaction(
              transaction._id.toString(),
              {
                status: 'refunded',
              }
            );

            // Reverse the service fee transfer if it exists
            if (
              transaction.serviceAccountTransfer?.transferId &&
              transaction.serviceAccountTransfer.status === 'completed'
            ) {
              console.log('Reversing service fee transfer:', {
                transferId: transaction.serviceAccountTransfer.transferId,
                refundAmount: refundedCharge.amount_refunded,
              });

              const reversalResult =
                await TransferService.reverseServiceFeeTransfer(
                  transaction.serviceAccountTransfer.transferId,
                  transaction._id.toString(),
                  refundedCharge.amount_refunded
                );

              if (reversalResult.success) {
                console.log(
                  'Service fee transfer reversed:',
                  reversalResult.reversalId
                );
              } else {
                console.error(
                  'Service fee transfer reversal failed:',
                  reversalResult.error
                );
              }
            }

            // Restore ticket availability for refunded ticket transactions
            if (transaction.ticketItems && transaction.ticketItems.length > 0) {
              console.log(
                'Restoring ticket availability for refunded transaction:',
                transaction._id.toString()
              );
              for (const ticketItem of transaction.ticketItems) {
                try {
                  await TicketTierService.releaseReservedTickets(
                    ticketItem.ticketTier.toString(),
                    ticketItem.quantity
                  );
                  console.log(
                    `Restored ${ticketItem.quantity} tickets to tier ${ticketItem.ticketTier}`
                  );
                } catch (error) {
                  console.error(
                    `Failed to restore tickets for tier ${ticketItem.ticketTier}:`,
                    error
                  );
                  // Don't fail the entire webhook - log the error and continue
                }
              }
            }

            // TODO: Void tickets if this is a ticket transaction
            // This would involve updating ticket status to prevent usage
          } else {
            console.warn(
              'No transaction found for payment intent:',
              paymentIntentId
            );
          }
        } catch (error) {
          console.error('Error handling refund:', error);
          // Don't fail the webhook - log the error and continue
        }
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Charge disputed:', dispute.id);
        // Handle chargeback - flag transaction for review
        break;

      case 'charge.dispute.closed':
        const closedDispute = event.data.object as Stripe.Dispute;
        console.log('Dispute closed:', closedDispute.id);
        // Handle resolved dispute
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
