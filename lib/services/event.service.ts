import dbConnect from '@/lib/dbConnect';
import { Event, TicketTier, Transaction } from '@/lib/models';
import { IEvent } from '@/lib/models/Event';
import mongoose from 'mongoose';

export class EventService {
  // Basic CRUD Operations
  static async createEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    await dbConnect();
    const event = new Event(eventData);
    return await event.save();
  }

  static async getEventById(id: string): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findById(id)
      .populate({
        path: 'fights',
        populate: {
          path: 'fighter1 fighter2',
          model: 'Fighter',
        },
      })
      .populate('ticketTiers')
      .populate({
        path: 'mainEventFight',
        populate: {
          path: 'fighter1 fighter2',
          model: 'Fighter',
        },
      });
  }

  static async getEventBySlug(slug: string): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findOne({ slug })
      .populate({
        path: 'fights',
        populate: {
          path: 'fighter1 fighter2',
          model: 'Fighter',
        },
      })
      .populate('ticketTiers')
      .populate({
        path: 'mainEventFight',
        populate: {
          path: 'fighter1 fighter2',
          model: 'Fighter',
        },
      });
  }

  static async getAllEvents(): Promise<IEvent[]> {
    await dbConnect();
    return await Event.find({})
      .populate('fights')
      .populate('ticketTiers')
      .populate({
        path: 'mainEventFight',
        populate: {
          path: 'fighter1 fighter2',
          model: 'Fighter',
        },
      })
      .sort({ date: 1 });
  }

  static async updateEvent(
    id: string,
    updateData: Partial<IEvent>
  ): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findByIdAndUpdate(id, updateData, { new: true })
      .populate('fights')
      .populate('ticketTiers');
  }

  static async deleteEvent(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Event.findByIdAndDelete(id);
    return result !== null;
  }

  // Event-specific operations
  static async getUpcomingEvents(): Promise<IEvent[]> {
    await dbConnect();
    const now = new Date();
    return await Event.find({ isActive: true })
      .populate('fights')
      .populate('ticketTiers')
      .sort({ date: 1 });
  }

  static async getPastEvents(): Promise<IEvent[]> {
    await dbConnect();
    const now = new Date();
    return await Event.find({ isPastEvent: true })
      .populate('fights')
      .populate('ticketTiers')
      .sort({ date: -1 });
  }

  static async getEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IEvent[]> {
    await dbConnect();
    return await Event.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('fights')
      .populate('ticketTiers')
      .sort({ date: 1 });
  }

  static async addFightToEvent(
    eventId: string,
    fightId: string
  ): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { fights: fightId } },
      { new: true }
    ).populate('fights');
  }

  static async removeFightFromEvent(
    eventId: string,
    fightId: string
  ): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findByIdAndUpdate(
      eventId,
      { $pull: { fights: fightId } },
      { new: true }
    ).populate('fights');
  }

  static async setMainEvent(
    eventId: string,
    fightId: string
  ): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findByIdAndUpdate(
      eventId,
      { mainEventFight: fightId },
      { new: true }
    ).populate('mainEventFight');
  }

  static async addTicketTierToEvent(
    eventId: string,
    ticketTierId: string
  ): Promise<IEvent | null> {
    await dbConnect();
    return await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { ticketTiers: ticketTierId } },
      { new: true }
    ).populate('ticketTiers');
  }

  static async getEventStats(eventId: string) {
    await dbConnect();

    const [event, ticketsSold, revenue] = await Promise.all([
      Event.findById(eventId).populate('ticketTiers'),
      Transaction.aggregate([
        {
          $match: {
            event: new mongoose.Types.ObjectId(eventId),
            type: 'ticket',
            status: 'confirmed',
          },
        },
        { $group: { _id: null, totalTickets: { $sum: '$quantity' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            event: new mongoose.Types.ObjectId(eventId),
            type: 'ticket',
            status: 'confirmed',
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      event,
      ticketsSold: ticketsSold[0]?.totalTickets || 0,
      revenue: revenue[0]?.totalRevenue || 0,
    };
  }

  static async getEventCapacity(
    eventId: string
  ): Promise<{ total: number; sold: number; available: number }> {
    await dbConnect();

    const event = await Event.findById(eventId).populate('ticketTiers');
    if (!event) throw new Error('Event not found');

    const ticketTiers = await TicketTier.find({ event: eventId });
    const totalCapacity = ticketTiers.reduce(
      (sum, tier) => sum + tier.maxQuantity,
      0
    );

    const soldTickets = await Transaction.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          type: 'ticket',
          status: 'confirmed',
        },
      },
      { $group: { _id: null, totalSold: { $sum: '$quantity' } } },
    ]);

    const sold = soldTickets[0]?.totalSold || 0;

    return {
      total: totalCapacity,
      sold,
      available: totalCapacity - sold,
    };
  }

  static async searchEvents(query: string): Promise<IEvent[]> {
    await dbConnect();
    return await Event.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { subtitle: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { venue: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('fights')
      .populate('ticketTiers')
      .sort({ date: 1 });
  }
}
