import dbConnect from '@/lib/dbConnect';
import Fight, { IFight } from '@/lib/models/Fight';
import Fighter from '@/lib/models/Fighter';
import Event from '@/lib/models/Event';
import mongoose from 'mongoose';

export class FightService {
  // Basic CRUD Operations
  static async createFight(fightData: Partial<IFight>): Promise<IFight> {
    await dbConnect();
    const fight = new Fight(fightData);
    return await fight.save();
  }

  static async getFightById(id: string): Promise<IFight | null> {
    await dbConnect();
    return await Fight.findById(id)
      .populate('fighter1')
      .populate('fighter2')
      .populate('event');
  }

  static async getAllFights(): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({})
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async updateFight(
    id: string,
    updateData: Partial<IFight>
  ): Promise<IFight | null> {
    await dbConnect();
    return await Fight.findByIdAndUpdate(id, updateData, { new: true })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event');
  }

  static async deleteFight(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Fight.findByIdAndDelete(id);
    return result !== null;
  }

  // Fight-specific operations
  static async getFightsByEvent(eventId: string): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({ event: eventId })
      .populate('fighter1')
      .populate('fighter2')
      .sort({ isMainEvent: -1 });
  }

  static async getFightsByFighter(fighterId: string): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({
      $or: [{ fighter1: fighterId }, { fighter2: fighterId }],
    })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getMainEvents(): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({ isMainEvent: true })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getUpcomingFights(): Promise<IFight[]> {
    await dbConnect();
    const now = new Date();

    const fights = await Fight.find({})
      .populate('fighter1')
      .populate('fighter2')
      .populate('event');

    return fights
      .filter(
        (fight) => fight.event && new Date((fight.event as any).date) >= now
      )
      .sort(
        (a, b) =>
          new Date((a.event as any).date).getTime() -
          new Date((b.event as any).date).getTime()
      );
  }

  static async getCompletedFights(): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({
      'result.winner': { $exists: true },
    })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async setFightResult(
    fightId: string,
    result: {
      winner?: string;
      method: 'KO' | 'TKO' | 'Submission' | 'Decision' | 'Draw' | 'No Contest';
      round?: number;
      time?: string;
    }
  ): Promise<IFight | null> {
    await dbConnect();

    const fight = await Fight.findByIdAndUpdate(
      fightId,
      { result },
      { new: true }
    ).populate('fighter1 fighter2 event');

    // Update fighter records if there's a winner
    if (
      result.winner &&
      result.method !== 'Draw' &&
      result.method !== 'No Contest'
    ) {
      const winner = await Fighter.findById(result.winner);
      const loser = await Fighter.findById(
        fight?.fighter1._id.toString() === result.winner
          ? fight?.fighter2._id
          : fight?.fighter1._id
      );

      if (winner && loser) {
        // Update winner's record and stats
        const [wins, losses, draws] = winner.record.split('-').map(Number);
        winner.record = `${wins + 1}-${losses}-${draws}`;
        winner.stats.winStreak += 1;

        if (result.method === 'KO' || result.method === 'TKO') {
          winner.stats.knockouts += 1;
        } else if (result.method === 'Submission') {
          winner.stats.submissions += 1;
        } else if (result.method === 'Decision') {
          winner.stats.decisions += 1;
        }

        await winner.save();

        // Update loser's record and reset win streak
        const [loserWins, loserLosses, loserDraws] = loser.record
          .split('-')
          .map(Number);
        loser.record = `${loserWins}-${loserLosses + 1}-${loserDraws}`;
        loser.stats.winStreak = 0;

        await loser.save();
      }
    }

    return fight;
  }

  static async createFightCard(
    eventId: string,
    fights: Partial<IFight>[]
  ): Promise<IFight[]> {
    await dbConnect();

    const createdFights = [];
    for (const fightData of fights) {
      const fight = new Fight({ ...fightData, event: eventId });
      const savedFight = await fight.save();
      createdFights.push(savedFight);
    }

    // Add fights to event
    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { fights: { $each: createdFights.map((f) => f._id) } },
    });

    return createdFights;
  }

  static async getFightHistory(
    fighter1Id: string,
    fighter2Id: string
  ): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({
      $or: [
        { fighter1: fighter1Id, fighter2: fighter2Id },
        { fighter1: fighter2Id, fighter2: fighter1Id },
      ],
    })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getFightsByMethod(method: string): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({ 'result.method': method })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getFightsByRounds(rounds: number): Promise<IFight[]> {
    await dbConnect();
    return await Fight.find({ rounds })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getFightStatistics() {
    await dbConnect();

    const [
      totalFights,
      completedFights,
      upcomingFights,
      methodStats,
      roundStats,
    ] = await Promise.all([
      Fight.countDocuments(),
      Fight.countDocuments({ 'result.winner': { $exists: true } }),
      Fight.countDocuments({ 'result.winner': { $exists: false } }),
      Fight.aggregate([
        { $match: { 'result.method': { $exists: true } } },
        { $group: { _id: '$result.method', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Fight.aggregate([
        { $match: { 'result.round': { $exists: true } } },
        { $group: { _id: '$result.round', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalFights,
      completedFights,
      upcomingFights,
      methodStats,
      roundStats,
    };
  }

  static async searchFights(query: string): Promise<IFight[]> {
    await dbConnect();

    // Search by fight title or fighter names
    const fighterIds = await Fighter.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { nickname: { $regex: query, $options: 'i' } },
      ],
    }).distinct('_id');

    return await Fight.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { fighter1: { $in: fighterIds } },
        { fighter2: { $in: fighterIds } },
      ],
    })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getFightOfTheNight(): Promise<IFight[]> {
    await dbConnect();
    // This could be based on various criteria like fight duration, method, etc.
    // For now, we'll return recent exciting fights (KO/TKO/Submission)
    return await Fight.find({
      'result.method': { $in: ['KO', 'TKO', 'Submission'] },
    })
      .populate('fighter1')
      .populate('fighter2')
      .populate('event')
      .sort({ 'event.date': -1 })
      .limit(10);
  }
}
