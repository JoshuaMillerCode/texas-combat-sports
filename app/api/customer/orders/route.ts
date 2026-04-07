import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/middleware/customerAuth';
import dbConnect from '@/lib/dbConnect';
import { Transaction } from '@/lib/models';

const SENSITIVE_FIELDS = {
  'customerDetails.address': 0,
  stripeSessionId: 0,
  stripePaymentIntentId: 0,
  serviceAccountTransfer: 0,
};

export async function GET(req: NextRequest) {
  const customer = authenticateCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    await dbConnect();

    const transactions = await Transaction.find(
      { 'customerDetails.email': customer.email },
      SENSITIVE_FIELDS
    )
      .populate('event', 'title date venue')
      .sort({ purchaseDate: -1 })
      .lean();

    const now = new Date();

    const upcoming = transactions.filter((t: any) => {
      const eventDate = t.event?.date ? new Date(t.event.date) : null;
      return t.status === 'confirmed' && eventDate && eventDate >= now;
    });

    const past = transactions.filter((t: any) => {
      const eventDate = t.event?.date ? new Date(t.event.date) : null;
      return !upcoming.includes(t) && (
        t.status !== 'confirmed' ||
        !eventDate ||
        eventDate < now
      );
    });

    return NextResponse.json({ upcoming, past, email: customer.email });
  } catch (error) {
    console.error('Customer orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
