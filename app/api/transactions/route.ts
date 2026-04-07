import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, requireAdmin, createAuthErrorResponse } from '@/lib/middleware/auth';
import dbConnect from '@/lib/dbConnect';
import { Transaction } from '@/lib/models';

export async function GET(req: NextRequest) {
  const authUser = authenticateToken(req);
  if (!authUser || !requireAdmin(authUser)) {
    return createAuthErrorResponse('Admin access required', 403);
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const status    = searchParams.get('status');
    const eventId   = searchParams.get('eventId');
    const search    = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate   = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount'); // in dollars
    const maxAmount = searchParams.get('maxAmount'); // in dollars
    const page      = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit     = Math.min(100, parseInt(searchParams.get('limit') || '25', 10));

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (eventId && eventId !== 'all') {
      query.event = eventId;
    }
    if (startDate && endDate) {
      query.purchaseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (minAmount || maxAmount) {
      query['summary.totalAmount'] = {};
      if (minAmount) query['summary.totalAmount'].$gte = parseFloat(minAmount) * 100; // convert to cents
      if (maxAmount) query['summary.totalAmount'].$lte = parseFloat(maxAmount) * 100;
    }
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { orderId: regex },
        { 'customerDetails.name': regex },
        { 'customerDetails.email': regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('event', 'title date')
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
