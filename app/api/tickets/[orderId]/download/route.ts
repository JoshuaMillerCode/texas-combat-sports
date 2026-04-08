import { NextRequest, NextResponse } from 'next/server';
import { TicketGenerator } from '@/lib/utils/ticket-generator';
import { TransactionService } from '@/lib/services/transaction.service';
import { EventService } from '@/lib/services/event.service';
import { PDFDocument } from 'pdf-lib';
import { authenticateCustomer } from '@/lib/middleware/customerAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // if (!OrderIDGenerator.isValidOrderID(orderId)) {
    //   return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    // }

    // Require customer session
    const customer = authenticateCustomer(request);
    if (!customer) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const transaction = await TransactionService.findTransactionByOrderId(orderId);

    if (!transaction) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Ownership check — customer can only download their own tickets
    if (transaction.customerDetails.email !== customer.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the associated event
    const eventId = (transaction.event?._id ?? transaction.event)?.toString() ?? '';
    const event = await EventService.getEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Generate the ticket PDFs
    const ticketPdfs = await TicketGenerator.generateMultipleTickets(
      transaction,
      event,
      { includeQRCode: true }
    );

    if (ticketPdfs.length === 0) {
      return NextResponse.json(
        { error: 'No tickets found for this transaction' },
        { status: 404 }
      );
    }

    // For single ticket, return it directly
    if (ticketPdfs.length === 1) {
      return new NextResponse(ticketPdfs[0], {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tickets-${orderId}.pdf"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    // For multiple tickets, combine them into a single PDF
    const combinedPdf = await PDFDocument.create();

    for (const pdfBytes of ticketPdfs) {
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => combinedPdf.addPage(page));
    }

    const combinedPdfBytes = await combinedPdf.save();

    return new NextResponse(combinedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tickets-${orderId}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error generating ticket download:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    );
  }
}
