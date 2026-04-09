import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction.service';
import { GoogleWalletService, buildWalletPassData } from '@/lib/services/wallet.service';
import { authenticateCustomer } from '@/lib/middleware/customerAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const customer = authenticateCustomer(request);
    if (!customer) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!GoogleWalletService.isConfigured()) {
      return NextResponse.json(
        { error: 'Google Wallet is not yet configured on this server.' },
        { status: 503 }
      );
    }

    const transaction = await TransactionService.findTransactionByOrderId(params.orderId);
    if (!transaction) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (transaction.customerDetails.email !== customer.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const passData = buildWalletPassData(transaction);
    const saveUrl = await GoogleWalletService.generatePassUrl(passData);

    return NextResponse.json({ url: saveUrl });
  } catch (error) {
    console.error('Google Wallet generation error:', error);
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 });
  }
}
