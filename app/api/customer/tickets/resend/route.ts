import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/middleware/customerAuth';
import { TransactionService } from '@/lib/services/transaction.service';
import { EventService } from '@/lib/services/event.service';
import { TicketGenerator } from '@/lib/utils/ticket-generator';
import { EmailService } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  const customer = authenticateCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const transaction = await TransactionService.findTransactionByOrderId(orderId);

    if (!transaction) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ownership check
    if (transaction.customerDetails.email !== customer.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const eventId = (transaction.event?._id ?? transaction.event)?.toString() ?? '';
    const event = await EventService.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const tickets = await TicketGenerator.generateMultipleTickets(transaction, event, {
      includeQRCode: true,
    });

    const sent = await EmailService.sendTicketConfirmation({ transaction, event, tickets });

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend tickets error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
