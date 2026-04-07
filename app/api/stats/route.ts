import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, requireAdmin, createAuthErrorResponse } from '@/lib/middleware/auth';
import { TransactionService } from '@/lib/services/transaction.service';
import { EventService } from '@/lib/services/event.service';
import dbConnect from '@/lib/dbConnect';
import { Transaction } from '@/lib/models';

async function getRevenueByEvent(startDate?: Date, endDate?: Date) {
  await dbConnect();

  const matchConditions: any = { status: 'confirmed' };
  if (startDate && endDate) {
    matchConditions.createdAt = { $gte: startDate, $lte: endDate };
  }

  return Transaction.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$event',
        revenue: { $sum: '$summary.totalAmount' },
        tickets: { $sum: '$summary.totalTickets' },
        orders: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'eventInfo',
      },
    },
    { $unwind: { path: '$eventInfo', preserveNullAndEmpty: false } },
    {
      $project: {
        eventTitle: '$eventInfo.title',
        eventDate: '$eventInfo.date',
        revenue: 1,
        tickets: 1,
        orders: 1,
      },
    },
    { $sort: { revenue: -1 } },
  ]);
}

export async function GET(req: NextRequest) {
  const authUser = authenticateToken(req);
  if (!authUser || !requireAdmin(authUser)) {
    return createAuthErrorResponse('Admin access required', 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const daysParam = searchParams.get('days');

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else if (daysParam && daysParam !== 'all') {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysParam));
    }

    const dailyDays = daysParam && daysParam !== 'all' ? parseInt(daysParam) : 30;

    const [overview, analytics, dailyRevenue, events, revenueByEvent] = await Promise.all([
      TransactionService.getRevenueStats(startDate, endDate),
      TransactionService.getTransactionAnalytics(),
      TransactionService.getDailyRevenue(Math.min(dailyDays, 90)),
      EventService.getAllEvents(),
      getRevenueByEvent(startDate, endDate),
    ]);

    const now = new Date();
    const upcomingEvents = (events as any[]).filter(
      (e) => !e.isPastEvent && e.isActive && new Date(e.date) >= now
    );
    const nextEvent =
      upcomingEvents.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0] || null;

    return NextResponse.json({
      overview,
      analytics,
      dailyRevenue,
      revenueByEvent,
      upcomingEventsCount: upcomingEvents.length,
      nextEvent: nextEvent
        ? { title: nextEvent.title, date: nextEvent.date }
        : null,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
