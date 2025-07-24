import dbConnect from '@/lib/dbConnect';
import { TicketTier, Transaction, Event } from '@/lib/models';
import { ITicketTier } from '@/lib/models/TicketTier';
import mongoose from 'mongoose';

export class TicketTierService {
  // Basic CRUD Operations
  static async createTicketTier(
    tierData: Partial<ITicketTier>
  ): Promise<ITicketTier> {
    await dbConnect();
    const tier = new TicketTier(tierData);
    const savedTier = await tier.save();

    // Add tier to event
    if (tierData.event) {
      await Event.findByIdAndUpdate(tierData.event, {
        $addToSet: { ticketTiers: savedTier._id },
      });
    }

    return savedTier;
  }

  static async getTicketTierById(id: string): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findById(id).populate('event');
  }

  static async getAllTicketTiers(): Promise<ITicketTier[]> {
    await dbConnect();
    return await TicketTier.find({})
      .populate('event')
      .sort({ 'event.date': 1, sortOrder: 1 });
  }

  static async updateTicketTier(
    id: string,
    updateData: Partial<ITicketTier>
  ): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('event');
  }

  static async deleteTicketTier(id: string): Promise<boolean> {
    await dbConnect();

    const tier = await TicketTier.findById(id);
    if (!tier) return false;

    // Remove tier from event
    await Event.findByIdAndUpdate(tier.event, { $pull: { ticketTiers: id } });

    const result = await TicketTier.findByIdAndDelete(id);
    return result !== null;
  }

  // TicketTier-specific operations
  static async getTicketTiersByEvent(eventId: string): Promise<ITicketTier[]> {
    await dbConnect();
    return await TicketTier.find({ event: eventId, isActive: true }).sort({
      sortOrder: 1,
      price: 1,
    });
  }

  static async getTicketTierByEventAndTierId(
    eventId: string,
    tierId: string
  ): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findOne({ event: eventId, tierId, isActive: true });
  }

  static async updateAvailableQuantity(
    tierObjectId: string,
    quantityChange: number
  ): Promise<ITicketTier | null> {
    await dbConnect();

    const tier = await TicketTier.findById(tierObjectId);
    if (!tier) throw new Error('Ticket tier not found');

    const newAvailable = tier.availableQuantity + quantityChange;
    if (newAvailable < 0) throw new Error('Insufficient tickets available');
    if (newAvailable > tier.maxQuantity)
      throw new Error('Cannot exceed maximum quantity');

    return await TicketTier.findByIdAndUpdate(
      tierObjectId,
      { availableQuantity: newAvailable },
      { new: true }
    );
  }

  static async reserveTickets(
    tierObjectId: string,
    quantity: number
  ): Promise<ITicketTier | null> {
    await dbConnect();

    const tier = await TicketTier.findById(tierObjectId);
    if (!tier) throw new Error('Ticket tier not found');
    if (tier.availableQuantity < quantity)
      throw new Error('Insufficient tickets available');

    return await TicketTier.findByIdAndUpdate(
      tierObjectId,
      {
        $inc: { availableQuantity: -quantity },
      },
      { new: true }
    );
  }

  static async releaseReservedTickets(
    tierObjectId: string,
    quantity: number
  ): Promise<ITicketTier | null> {
    await dbConnect();

    const tier = await TicketTier.findById(tierObjectId);
    if (!tier) throw new Error('Ticket tier not found');

    const newAvailable = Math.min(
      tier.availableQuantity + quantity,
      tier.maxQuantity
    );

    return await TicketTier.findByIdAndUpdate(
      tierObjectId,
      { availableQuantity: newAvailable },
      { new: true }
    );
  }

  static async getTicketTierSales(tierObjectId: string) {
    await dbConnect();

    const [tier, salesData] = await Promise.all([
      TicketTier.findById(tierObjectId).populate('event'),
      Transaction.aggregate([
        {
          $match: {
            ticketTier: new mongoose.Types.ObjectId(tierObjectId),
            type: 'ticket',
            status: 'confirmed',
          },
        },
        {
          $group: {
            _id: null,
            totalSold: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalAmount' },
            avgPrice: { $avg: '$unitPrice' },
          },
        },
      ]),
    ]);

    const sales = salesData[0] || {
      totalSold: 0,
      totalRevenue: 0,
      avgPrice: 0,
    };

    return {
      tier,
      ...sales,
      soldPercentage: tier ? (sales.totalSold / tier.maxQuantity) * 100 : 0,
    };
  }

  static async getEventTicketSummary(eventId: string) {
    await dbConnect();

    const tiers = await TicketTier.find({
      event: eventId,
      isActive: true,
    }).sort({ sortOrder: 1 });

    const summary = await Promise.all(
      tiers.map(async (tier) => {
        const salesData = await Transaction.aggregate([
          {
            $match: {
              ticketTier: tier._id,
              type: 'ticket',
              status: 'confirmed',
            },
          },
          {
            $group: {
              _id: null,
              sold: { $sum: '$quantity' },
              revenue: { $sum: '$totalAmount' },
            },
          },
        ]);

        const sales = salesData[0] || { sold: 0, revenue: 0 };

        return {
          tier: tier.toObject(),
          sold: sales.sold,
          available: tier.availableQuantity,
          revenue: sales.revenue,
          soldPercentage: (sales.sold / tier.maxQuantity) * 100,
        };
      })
    );

    const totals = summary.reduce(
      (acc, curr) => ({
        totalCapacity: acc.totalCapacity + curr.tier.maxQuantity,
        totalSold: acc.totalSold + curr.sold,
        totalRevenue: acc.totalRevenue + curr.revenue,
      }),
      { totalCapacity: 0, totalSold: 0, totalRevenue: 0 }
    );

    return {
      tiers: summary,
      totals: {
        ...totals,
        totalAvailable: totals.totalCapacity - totals.totalSold,
        overallSoldPercentage: (totals.totalSold / totals.totalCapacity) * 100,
      },
    };
  }

  static async activateTicketTier(id: string): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }

  static async deactivateTicketTier(id: string): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  static async updateTicketTierPricing(
    id: string,
    newPrice: number
  ): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findByIdAndUpdate(
      id,
      { price: newPrice },
      { new: true }
    );
  }

  static async addFeatureToTier(
    id: string,
    feature: string
  ): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findByIdAndUpdate(
      id,
      { $addToSet: { features: feature } },
      { new: true }
    );
  }

  static async removeFeatureFromTier(
    id: string,
    feature: string
  ): Promise<ITicketTier | null> {
    await dbConnect();
    return await TicketTier.findByIdAndUpdate(
      id,
      { $pull: { features: feature } },
      { new: true }
    );
  }

  static async getPopularTicketTiers(limit: number = 5): Promise<any[]> {
    await dbConnect();

    return await Transaction.aggregate([
      { $match: { type: 'ticket', status: 'confirmed' } },
      {
        $group: {
          _id: '$ticketTier',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'tickettiers',
          localField: '_id',
          foreignField: '_id',
          as: 'tier',
        },
      },
      { $unwind: '$tier' },
      {
        $lookup: {
          from: 'events',
          localField: 'tier.event',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
    ]);
  }

  static async bulkUpdateAvailability(
    updates: Array<{ id: string; availableQuantity: number }>
  ): Promise<boolean> {
    await dbConnect();

    const operations = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { availableQuantity: update.availableQuantity },
      },
    }));

    const result = await TicketTier.bulkWrite(operations);
    return result.modifiedCount === updates.length;
  }
}
