import dbConnect from '@/lib/dbConnect';
import { Transaction, TicketTier, Merch } from '@/lib/models';
import { ITransaction } from '@/lib/models/Transaction';
import { TicketTierService } from './ticketTier.service';
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
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event');
  }

  static async getTransactionByStripeSessionId(
    sessionId: string
  ): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findOne({ stripeSessionId: sessionId })
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event');
  }

  static async getTransactionByPaymentIntent(
    paymentIntentId: string
  ): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event');
  }

  static async getAllTransactions(): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({})
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async updateTransaction(
    id: string,
    updateData: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findByIdAndUpdate(id, updateData, { new: true })
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
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
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByType(
    type: 'ticket' | 'merch' | 'mixed'
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({ type })
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByStatus(
    status: string
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({ status })
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
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
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event')
      .sort({ purchaseDate: -1 });
  }

  static async getTransactionsByEvent(
    eventId: string
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({
      event: eventId,
      $or: [{ type: 'ticket' }, { type: 'mixed' }],
    })
      .populate('ticketItems.ticketTier')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByTicketTier(
    ticketTierId: string
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({
      'ticketItems.ticketTier': ticketTierId,
    })
      .populate('ticketItems.ticketTier')
      .populate('event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionsByMerch(
    merchId: string
  ): Promise<ITransaction[]> {
    await dbConnect();
    return await Transaction.find({
      'merchItems.merch': merchId,
    })
      .populate('merchItems.merch')
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
    ).populate('ticketItems.ticketTier merchItems.merch event');

    // Update inventory for confirmed transactions
    if (transaction) {
      // Handle ticket items - tickets were already deducted during checkout reservation
      // No need to deduct again here
      if (transaction.ticketItems && transaction.ticketItems.length > 0) {
        console.log(
          `Confirming transaction with ${transaction.ticketItems.length} ticket items`
        );
      }

      // Handle merch items - confirm the sale in inventory
      if (transaction.merchItems && transaction.merchItems.length > 0) {
        for (const merchItem of transaction.merchItems) {
          await Merch.findByIdAndUpdate(merchItem.merch, {
            $inc: {
              'inventory.reserved': -merchItem.quantity,
              'inventory.total': -merchItem.quantity,
            },
          });
        }
      }
    }

    return transaction;
  }

  static async cancelTransaction(
    transactionId: string
  ): Promise<ITransaction | null> {
    await dbConnect();

    const transaction = await Transaction.findById(transactionId).populate(
      'ticketItems.ticketTier merchItems.merch'
    );

    if (!transaction) throw new Error('Transaction not found');

    // Release reserved inventory
    // Handle ticket items
    if (transaction.ticketItems && transaction.ticketItems.length > 0) {
      for (const ticketItem of transaction.ticketItems) {
        try {
          await TicketTierService.releaseReservedTickets(
            ticketItem.ticketTier.toString(),
            ticketItem.quantity
          );
        } catch (error) {
          console.error(
            `Failed to restore tickets for tier ${ticketItem.ticketTier}:`,
            error
          );
          // Don't fail the entire transaction - log the error and continue
        }
      }
    }

    // Handle merch items
    if (transaction.merchItems && transaction.merchItems.length > 0) {
      for (const merchItem of transaction.merchItems) {
        await Merch.findByIdAndUpdate(merchItem.merch, {
          $inc: {
            'inventory.available': merchItem.quantity,
            'inventory.reserved': -merchItem.quantity,
          },
        });
      }
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
      'ticketItems.ticketTier merchItems.merch'
    );

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'confirmed')
      throw new Error('Can only refund confirmed transactions');

    // Handle inventory restoration for refunds
    // Handle ticket items
    if (transaction.ticketItems && transaction.ticketItems.length > 0) {
      for (const ticketItem of transaction.ticketItems) {
        try {
          await TicketTierService.releaseReservedTickets(
            ticketItem.ticketTier.toString(),
            ticketItem.quantity
          );
        } catch (error) {
          console.error(
            `Failed to restore tickets for tier ${ticketItem.ticketTier}:`,
            error
          );
          // Don't fail the entire transaction - log the error and continue
        }
      }
    }

    // Handle merch items
    if (transaction.merchItems && transaction.merchItems.length > 0) {
      for (const merchItem of transaction.merchItems) {
        await Merch.findByIdAndUpdate(merchItem.merch, {
          $inc: {
            'inventory.available': merchItem.quantity,
            'inventory.total': merchItem.quantity,
          },
        });
      }
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
        type: 'event_tickets',
        'ticketItems.tickets.ticketNumber': ticketNumber,
        'ticketItems.tickets.isUsed': false,
      },
      {
        $set: {
          'ticketItems.$[item].tickets.$[ticket].isUsed': true,
          'ticketItems.$[item].tickets.$[ticket].usedAt': new Date(),
        },
      },
      {
        arrayFilters: [
          { 'item.tickets.ticketNumber': ticketNumber },
          { 'ticket.ticketNumber': ticketNumber, 'ticket.isUsed': false },
        ],
        new: true,
      }
    );
  }

  static async getTicketByNumber(ticketNumber: string): Promise<{
    transaction: ITransaction;
    ticketItem: any;
    ticket: any;
  } | null> {
    await dbConnect();

    const transaction = await Transaction.findOne({
      'ticketItems.tickets.ticketNumber': ticketNumber,
    }).populate('ticketItems.ticketTier event');

    if (!transaction) return null;

    for (const ticketItem of transaction.ticketItems || []) {
      for (const ticket of ticketItem.tickets || []) {
        if (ticket.ticketNumber === ticketNumber) {
          return { transaction, ticketItem, ticket };
        }
      }
    }

    return null;
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
      {
        _id: transactionId,
        $or: [{ type: 'merch' }, { type: 'mixed' }],
      },
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

    const [ticketStats, merchStats, totalStats] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            ...matchConditions,
            $or: [{ type: 'ticket' }, { type: 'mixed' }],
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$summary.totalAmount' },
            totalTransactions: { $sum: 1 },
            totalTickets: { $sum: '$summary.totalTickets' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            ...matchConditions,
            $or: [{ type: 'merch' }, { type: 'mixed' }],
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$summary.totalAmount' },
            totalTransactions: { $sum: 1 },
            totalItems: { $sum: '$summary.totalMerch' },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$summary.totalAmount' },
            avgTransactionValue: { $avg: '$summary.totalAmount' },
            totalTransactions: { $sum: 1 },
            totalItems: { $sum: '$summary.totalItems' },
            totalTickets: { $sum: '$summary.totalTickets' },
            totalMerch: { $sum: '$summary.totalMerch' },
            totalTaxes: { $sum: '$summary.taxes' },
            totalFees: { $sum: '$summary.fees' },
          },
        },
      ]),
    ]);

    return {
      tickets: ticketStats[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        totalTickets: 0,
      },
      merch: merchStats[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        totalItems: 0,
      },
      total: totalStats[0] || {
        totalRevenue: 0,
        avgTransactionValue: 0,
        totalTransactions: 0,
        totalItems: 0,
        totalTickets: 0,
        totalMerch: 0,
        totalTaxes: 0,
        totalFees: 0,
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
          revenue: { $sum: '$summary.totalAmount' },
          transactions: { $sum: 1 },
          tickets: { $sum: '$summary.totalTickets' },
          merch: { $sum: '$summary.totalMerch' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          ticketRevenue: {
            $sum: {
              $cond: [
                { $in: ['$_id.type', ['ticket', 'mixed']] },
                '$revenue',
                0,
              ],
            },
          },
          merchRevenue: {
            $sum: {
              $cond: [
                { $in: ['$_id.type', ['merch', 'mixed']] },
                '$revenue',
                0,
              ],
            },
          },
          totalRevenue: { $sum: '$revenue' },
          totalTransactions: { $sum: '$transactions' },
          totalTickets: { $sum: '$tickets' },
          totalMerch: { $sum: '$merch' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  static async getCustomerStats(email: string) {
    await dbConnect();

    const [customerTransactions, stats] = await Promise.all([
      Transaction.find({ 'customerDetails.email': email })
        .populate('ticketItems.ticketTier merchItems.merch event')
        .sort({ createdAt: -1 }),
      Transaction.aggregate([
        { $match: { 'customerDetails.email': email, status: 'confirmed' } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$summary.totalAmount' },
            totalTransactions: { $sum: 1 },
            avgTransactionValue: { $avg: '$summary.totalAmount' },
            totalTickets: { $sum: '$summary.totalTickets' },
            totalMerch: { $sum: '$summary.totalMerch' },
            totalItems: { $sum: '$summary.totalItems' },
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
        totalTickets: 0,
        totalMerch: 0,
        totalItems: 0,
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
        { 'metadata.eventTitle': { $regex: query, $options: 'i' } },
        { 'metadata.eventVenue': { $regex: query, $options: 'i' } },
        { 'ticketItems.tierName': { $regex: query, $options: 'i' } },
        { 'merchItems.productName': { $regex: query, $options: 'i' } },
      ],
    })
      .populate('ticketItems.ticketTier merchItems.merch event')
      .sort({ createdAt: -1 });
  }

  static async getTransactionAnalytics() {
    await dbConnect();

    const [
      statusBreakdown,
      typeBreakdown,
      monthlyTrends,
      topTicketTiers,
      topMerch,
    ] = await Promise.all([
      Transaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            revenue: { $sum: '$summary.totalAmount' },
            avgValue: { $avg: '$summary.totalAmount' },
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
            revenue: { $sum: '$summary.totalAmount' },
            tickets: { $sum: '$summary.totalTickets' },
            merch: { $sum: '$summary.totalMerch' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      // Top selling ticket tiers (revenue calculated from tier price × quantity)
      Transaction.aggregate([
        { $unwind: '$ticketItems' },
        { $match: { status: 'confirmed' } },
        {
          $lookup: {
            from: 'tickettiers',
            localField: 'ticketItems.ticketTier',
            foreignField: '_id',
            as: 'tierInfo',
          },
        },
        { $unwind: '$tierInfo' },
        {
          $group: {
            _id: {
              tierId: '$ticketItems.ticketTier',
              tierName: '$ticketItems.tierName',
            },
            totalSold: { $sum: '$ticketItems.quantity' },
            revenue: {
              $sum: {
                $multiply: ['$ticketItems.quantity', '$tierInfo.price'],
              },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
      // Top selling merch (revenue calculated from merch price × quantity)
      Transaction.aggregate([
        { $unwind: '$merchItems' },
        { $match: { status: 'confirmed' } },
        {
          $lookup: {
            from: 'merches',
            localField: 'merchItems.merch',
            foreignField: '_id',
            as: 'merchInfo',
          },
        },
        { $unwind: '$merchInfo' },
        {
          $group: {
            _id: {
              merchId: '$merchItems.merch',
              productName: '$merchItems.productName',
            },
            totalSold: { $sum: '$merchItems.quantity' },
            revenue: {
              $sum: {
                $multiply: ['$merchItems.quantity', '$merchInfo.price'],
              },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      statusBreakdown,
      typeBreakdown,
      monthlyTrends,
      topTicketTiers,
      topMerch,
    };
  }

  // Helper method to create a transaction with multiple items
  static async createMultiItemTransaction(transactionData: {
    type: 'ticket' | 'merch' | 'mixed';
    stripeSessionId: string;
    customerDetails: any;
    ticketItems?: Array<{
      ticketTier: string;
      tierName: string;
      quantity: number;
    }>;
    merchItems?: Array<{
      merch: string;
      productName: string;
      productId: string;
      quantity: number;
      selectedVariants?: Array<{ name: string; value: string }>;
    }>;
    event?: string;
    metadata?: any;
    shipping?: any;
    summary: {
      totalItems: number;
      totalTickets: number;
      totalMerch: number;
      subtotal: number;
      taxes: number;
      fees: number;
      totalAmount: number;
      currency: string;
    };
  }): Promise<ITransaction> {
    await dbConnect();

    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  // Helper method to calculate transaction totals by fetching prices
  static async calculateTransactionTotals(
    ticketItems?: Array<{ ticketTier: string; quantity: number }>,
    merchItems?: Array<{ merch: string; quantity: number }>
  ): Promise<{
    subtotal: number;
    totalTickets: number;
    totalMerch: number;
    totalItems: number;
  }> {
    await dbConnect();

    let subtotal = 0;
    let totalTickets = 0;
    let totalMerch = 0;

    // Calculate ticket totals
    if (ticketItems && ticketItems.length > 0) {
      for (const item of ticketItems) {
        const tier = await TicketTier.findById(item.ticketTier);
        if (tier) {
          subtotal += item.quantity * tier.price;
          totalTickets += item.quantity;
        }
      }
    }

    // Calculate merch totals
    if (merchItems && merchItems.length > 0) {
      for (const item of merchItems) {
        const merch = await Merch.findById(item.merch);
        if (merch) {
          subtotal += item.quantity * merch.price;
          totalMerch += item.quantity;
        }
      }
    }

    return {
      subtotal,
      totalTickets,
      totalMerch,
      totalItems: totalTickets + totalMerch,
    };
  }

  static async formatTicketItems(ticketData: any, flashSaleData?: any) {
    const ticketItems = JSON.parse(ticketData);
    const flashSaleInfo = flashSaleData ? JSON.parse(flashSaleData) : [];

    const formattedTicketItems = ticketItems.map((item: any) => {
      // Handle both old and new field name formats for backward compatibility
      const tierId = item.tierId || item.t; // Support both formats
      const tierName = item.tierName || item.n;
      const quantity = item.quantity || item.q;
      const price = item.price || item.p;
      const stripePriceId = item.stripePriceId || item.s;

      // Find flash sale info for this ticket tier
      // Note: flashSaleInfo now only contains items with flash sales
      const flashSale = flashSaleInfo.find(
        (fs: any) => fs.t === tierId // 't' is the shortened field name for tierId
      );

      // Handle promo deal: 3 tickets for price of 2 ($110)
      // Check if this is a promo deal tier (you can customize this condition)
      const isPromoDeal =
        tierName?.toLowerCase().includes('promo') ||
        tierName?.toLowerCase().includes('deal') ||
        price === 10000; // $100 in cents

      if (isPromoDeal) {
        // For promo deal, customer gets 3 GA tickets per promo deal purchased
        // If they buy 2 promo deals, they get 6 tickets total (2 × 3)
        return {
          ticketTier: new mongoose.Types.ObjectId(tierId),
          tierName: 'General Admission', // Override to GA for the actual tickets
          price: price, // Keep original price ($110)
          quantity: 3 * quantity, // Customer gets 3 tickets per promo deal purchased
          isPromoDeal: true, // Flag to track this was a promo purchase
          originalTierName: tierName, // Keep original tier name for reference
        };
      }

      // Regular ticket item with potential flash sale information
      const baseItem = {
        ticketTier: new mongoose.Types.ObjectId(tierId),
        tierName: tierName,
        price: price,
        quantity: quantity,
      };

      // Add flash sale information if applicable
      // Since flashSaleInfo now only contains flash sale items, if we find a match, it's a flash sale
      if (flashSale) {
        return {
          ...baseItem,
          price: flashSale.ap || price, // 'ap' is actualPricePaid
          isFlashSale: true,
          flashSaleId: flashSale.fs, // 'fs' is flashSaleId
          flashSaleTitle: flashSale.ft, // 'ft' is flashSaleTitle
          originalPrice: flashSale.op, // 'op' is originalPrice
        };
      }

      return baseItem;
    });
    return formattedTicketItems;
  }

  // Find transaction by ticket ID (Stripe session ID or payment intent ID)
  static async findTransactionByOrderId(
    orderId: string
  ): Promise<ITransaction | null> {
    await dbConnect();
    return await Transaction.findOne({
      orderId: orderId,
    })
      .populate('ticketItems.ticketTier')
      .populate('event');
  }

  // Mark a specific ticket as used
  static async markTicketAsUsed(
    ticketId: string
  ): Promise<ITransaction | null> {
    await dbConnect();

    // Find the transaction first
    const transaction = await Transaction.findOne({
      $or: [{ stripeSessionId: ticketId }, { stripePaymentIntentId: ticketId }],
    });

    if (!transaction) {
      return null;
    }

    // Mark all tickets in the transaction as used
    const updateData: any = {};
    if (transaction.ticketItems) {
      transaction.ticketItems.forEach((item: any, itemIndex: number) => {
        if (item.tickets) {
          item.tickets.forEach((ticket: any, ticketIndex: number) => {
            updateData[
              `ticketItems.${itemIndex}.tickets.${ticketIndex}.isUsed`
            ] = true;
            updateData[
              `ticketItems.${itemIndex}.tickets.${ticketIndex}.usedAt`
            ] = new Date();
          });
        }
      });
    }

    return await Transaction.findByIdAndUpdate(
      transaction._id,
      { $set: updateData },
      { new: true }
    )
      .populate('ticketItems.ticketTier')
      .populate('merchItems.merch')
      .populate('event');
  }

  // Check if a ticket is used
  static async isTicketUsed(ticketNumber: string): Promise<boolean> {
    await dbConnect();
    const transaction = await Transaction.findOne({
      'ticketItems.tickets.ticketNumber': ticketNumber,
    });
    if (!transaction) return false;

    // Find the specific ticket within the nested structure
    for (const ticketItem of transaction.ticketItems || []) {
      for (const ticket of ticketItem.tickets || []) {
        if (ticket.ticketNumber === ticketNumber) {
          return ticket.isUsed;
        }
      }
    }

    return false;
  }
}
