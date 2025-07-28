import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction.service';

// Add method to find transaction by ticket ID to the TransactionService
export async function POST(
  request: NextRequest,
  { params }: { params: { transactionId: string; ticketNumber: string } }
) {
  // This could be used for ticket valdation at the eventi
  try {
    const { transactionId, ticketNumber } = params;

    const isUsed = await TransactionService.isTicketUsed(ticketNumber);
    if (isUsed) {
      return NextResponse.json(
        { error: 'Ticket already used' },
        { status: 400 }
      );
    }

    // Find transaction and mark ticket as used
    const transaction = await TransactionService.getTransactionById(
      transactionId
    );

    if (!transaction) {
      return NextResponse.json(
        { error: 'Invalid transaction' },
        { status: 404 }
      );
    }

    // Mark ticket as used
    const updatedTransaction = await TransactionService.useTicket(
      transaction._id.toString(),
      ticketNumber
    );

    return NextResponse.json({
      success: true,
      message: 'Ticket used successfully',
      transaction: updatedTransaction?.ticketItems,
    });
  } catch (error) {
    console.error('Error using ticket:', error);
    return NextResponse.json(
      { error: 'Failed to use ticket' },
      { status: 500 }
    );
  }
}
