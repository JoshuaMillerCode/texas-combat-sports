import dbConnect from '@/lib/dbConnect';
import Transaction, { ITransaction } from '@/lib/models/Transaction';
import TicketTier from '@/lib/models/TicketTier';
import Merch from '@/lib/models/Merch';
import Event from '@/lib/models/Event';
import mongoose from 'mongoose';

export class TransactionService {
  // Basic CRUD Operations
  static async createTransaction(
    transactionData: Partial<ITransaction>
  ): Promise<ITransaction> {
    await dbConnect();
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  static async getTransactionById(id: string): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findById(id)
      .populate('ticketTier')
      .populate('merch')
      .populate('event');
  }

  static async getTransactionByStripeSessionId(
    sessionId: string
  ): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findOne({ stripeSessionId: sessionId })
      .populate('ticketTier')
      .populate('merch')
      .populate('event');
  }

  static async getAllTransactions(): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({})
      .populate('ticketTier')
      .populate('merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async updateTransaction(
    id: string,
    updateData: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findByIdAndUpdate(id, updateData, { new: true })
      .populate('ticketTier')
      .populate('merch')
      .populate('event');
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Transaction.findByIdAndDelete(id);
    return result !== null;
  }

  // Transaction-specific operations
  static async getTransactionsByEmail(email: string): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({ 'customerDetails.email': email })
      .populate('ticketTier')
      .populate('merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByType(
    type: 'ticket' | 'merch'
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({ type })
      .populate('ticketTier')
      .populate('merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByStatus(
    status: string
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({ status })
      .populate('ticketTier')
      .populate('merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({
      purchaseDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('ticketTier')
      .populate('merch')
      .populate('event')
      .sort({ purchaseDate: -1 });
  }

  static async getTransactionsByEvent(
    eventId: string
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({ event: eventId, type: 'ticket' })
      .populate('ticketTier')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async confirmTransaction(
    stripeSessionId: string
  ): Promise<ITransaction | null> {
    await dbConnect();

    const transaction = await Transaction.findOneAndUpdate(
      { stripeSessionId },
      { status: 'confirmed' },
      { new: true }
    ).populate('ticketTier merch event');

    // Update inventory for confirmed transactions
    if (transaction) {
      if (transaction.type === 'ticket' && transaction.ticketTier) {
        // No need to update ticket tier inventory as it's handled during reservation
      } else if (transaction.type === 'merch' && transaction.merch) {
        // Confirm the sale in merch inventory
        await Merch.findByIdAndUpdate(transaction.merch._id, {
          $inc: {
            'inventory.reserved': -transaction.quantity,
            'inventory.total': -transaction.quantity,
          },
        });
      }
    }

    return transaction;
  }

  static async cancelTransaction(
    transactionId: string
  ): Promise<ITransaction | null> {
    await dbConnect();

    const transaction = await Transaction.findById(transactionId).populate(
      'ticketTier merch'
    );

    if (!transaction) throw new Error('Transaction not found');

    // Release reserved inventory
    if (transaction.type === 'ticket' && transaction.ticketTier) {
      await TicketTier.findByIdAndUpdate(transaction.ticketTier._id, {
        $inc: { availableQuantity: transaction.quantity },
      });
    } else if (transaction.type === 'merch' && transaction.merch) {
      await Merch.findByIdAndUpdate(transaction.merch._id, {
        $inc: {
          'inventory.available': transaction.quantity,
          'inventory.reserved': -transaction.quantity,
        },
      });
    }

    return await Transaction.findByIdAndUpdate(
      transactionId,
      { status: 'cancelled' },
      { new: true }
    );
  }

  static async refundTransaction(
    transactionId: string
  ): Promise<ITransaction | null> {
    await dbConnect();

    const transaction = await Transaction.findById(transactionId).populate(
      'ticketTier merch'
    );

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'confirmed')
      throw new Error('Can only refund confirmed transactions');

    // Handle inventory restoration for refunds
    if (transaction.type === 'ticket' && transaction.ticketTier) {
      await TicketTier.findByIdAndUpdate(transaction.ticketTier._id, {
        $inc: { availableQuantity: transaction.quantity },
      });
    } else if (transaction.type === 'merch' && transaction.merch) {
      await Merch.findByIdAndUpdate(transaction.merch._id, {
        $inc: {
          'inventory.available': transaction.quantity,
          'inventory.total': transaction.quantity,
        },
      });
    }

    return await Transaction.findByIdAndUpdate(
      transactionId,
      { status: 'refunded' },
      { new: true }
    );
  }

  static async useTicket(
    transactionId: string,
    ticketNumber: string
  ): Promise<ITransaction | null> {
    await dbConnect();

    return await Transaction.findOneAndUpdate(
      {
        _id: transactionId,
        type: 'ticket',
        'tickets.ticketNumber': ticketNumber,
        'tickets.isUsed': false,
      },
      {
        $set: {
          'tickets.$.isUsed': true,
          'tickets.$.usedAt': new Date(),
        },
      },
      { new: true }
    );
  }

  static async updateShippingStatus(
    transactionId: string,
    shippingUpdate: {
      status?: 'pending' | 'processing' | 'shipped' | 'delivered';
      trackingNumber?: string;
      shippedAt?: Date;
      deliveredAt?: Date;
    }
  ): Promise<ITransaction | null> {
    await dbConnect();

    const updateFields: any = {};
    Object.keys(shippingUpdate).forEach((key) => {
      updateFields[`shipping.${key}`] =
        shippingUpdate[key as keyof typeof shippingUpdate];
    });

    return await Transaction.findOneAndUpdate(
      { _id: transactionId, type: 'merch' },
      { $set: updateFields },
      { new: true }
    );
  }

  static async getRevenueStats(startDate?: Date, endDate?: Date) {
    await dbConnect();

    const matchConditions: any = { status: 'confirmed' };
    if (startDate && endDate) {
      matchConditions.purchaseDate = { $gte: startDate, $lte: endDate };
    }

    const [ticketRevenue, merchRevenue, totalStats] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...matchConditions, type: 'ticket' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalTransactions: { $sum: 1 },
            totalTickets: { $sum: '$quantity' },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { ...matchConditions, type: 'merch' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalTransactions: { $sum: 1 },
            totalItems: { $sum: '$quantity' },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgTransactionValue: { $avg: '$totalAmount' },
            totalTransactions: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      tickets: ticketRevenue[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        totalTickets: 0,
      },
      merch: merchRevenue[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        totalItems: 0,
      },
      total: totalStats[0] || {
        totalRevenue: 0,
        avgTransactionValue: 0,
        totalTransactions: 0,
      },
    };
  }

  static async getDailyRevenue(days: number = 30) {
    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Transaction.aggregate([
      {
        $match: {
          status: 'confirmed',
          purchaseDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' },
            },
            type: '$type',
          },
          revenue: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          ticketRevenue: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'ticket'] }, '$revenue', 0] },
          },
          merchRevenue: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'merch'] }, '$revenue', 0] },
          },
          totalRevenue: { $sum: '$revenue' },
          totalTransactions: { $sum: '$transactions' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  static async getCustomerStats(email: string) {
    await dbConnect();

    const [customerTransactions, stats] = await Promise.all([
      Transaction.find({ 'customerDetails.email': email })
        .populate('ticketTier merch event')
        .sort({ createdAt: -1 }),
      Transaction.aggregate([
        { $match: { 'customerDetails.email': email, status: 'confirmed' } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$totalAmount' },
            totalTransactions: { $sum: 1 },
            avgTransactionValue: { $avg: '$totalAmount' },
            firstPurchase: { $min: '$purchaseDate' },
            lastPurchase: { $max: '$purchaseDate' },
          },
        },
      ]),
    ]);

    return {
      transactions: customerTransactions,
      stats: stats[0] || {
        totalSpent: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        firstPurchase: null,
        lastPurchase: null,
      },
    };
  }

  static async searchTransactions(query: string): Promise<ITransaction[]> {
    await dbConnect();

    return await Transaction.find({
      $or: [
        { 'customerDetails.email': { $regex: query, $options: 'i' } },
        { 'customerDetails.name': { $regex: query, $options: 'i' } },
        { stripeSessionId: { $regex: query, $options: 'i' } },
        { 'metadata.itemName': { $regex: query, $options: 'i' } },
      ],
    })
      .populate('ticketTier merch event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionAnalytics() {
    await dbConnect();

    const [statusBreakdown, typeBreakdown, monthlyTrends] = await Promise.all([
      Transaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$purchaseDate' },
              month: { $month: '$purchaseDate' },
            },
            transactions: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    return {
      statusBreakdown,
      typeBreakdown,
      monthlyTrends,
    };
  }
}
