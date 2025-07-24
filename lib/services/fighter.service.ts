import dbConnect from '@/lib/dbConnect';
import { Fighter, Fight } from '@/lib/models';
import { IFighter } from '@/lib/models/Fighter';

export class FighterService {
  // Basic CRUD Operations
  static async createFighter(
    fighterData: Partial<IFighter>
  ): Promise<IFighter> {
    await dbConnect();
    const fighter = new Fighter(fighterData);
    return await fighter.save();
  }

  static async getFighterById(id: string): Promise<IFighter | null> {
    await dbConnect();
    return await Fighter.findById(id);
  }

  static async getAllFighters(): Promise<IFighter[]> {
    await dbConnect();
    return await Fighter.find({}).sort({ name: 1 });
  }

  static async updateFighter(
    id: string,
    updateData: Partial<IFighter>
  ): Promise<IFighter | null> {
    await dbConnect();
    return await Fighter.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteFighter(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Fighter.findByIdAndDelete(id);
    return result !== null;
  }

  // Fighter-specific operations
  static async getFighterByName(name: string): Promise<IFighter | null> {
    await dbConnect();
    return await Fighter.findOne({ name: { $regex: name, $options: 'i' } });
  }

  static async getFighterByNickname(
    nickname: string
  ): Promise<IFighter | null> {
    await dbConnect();
    return await Fighter.findOne({
      nickname: { $regex: nickname, $options: 'i' },
    });
  }

  static async getFightersByHometown(hometown: string): Promise<IFighter[]> {
    await dbConnect();
    return await Fighter.find({
      hometown: { $regex: hometown, $options: 'i' },
    }).sort({ name: 1 });
  }

  static async getFightersByWeightClass(weightRange: {
    min: number;
    max: number;
  }): Promise<IFighter[]> {
    await dbConnect();
    // Extract numeric weight from weight string (e.g., "205 lbs" -> 205)
    return await Fighter.find({}).then((fighters) =>
      fighters.filter((fighter) => {
        const weight = parseInt(fighter.weight.match(/\d+/)?.[0] || '0');
        return weight >= weightRange.min && weight <= weightRange.max;
      })
    );
  }

  static async getFighterStats(fighterId: string) {
    await dbConnect();

    const fighter = await Fighter.findById(fighterId);
    if (!fighter) throw new Error('Fighter not found');

    const fights = await Fight.find({
      $or: [{ fighter1: fighterId }, { fighter2: fighterId }],
    }).populate('fighter1 fighter2');

    const wins = fights.filter(
      (fight) => fight.result?.winner?.toString() === fighterId
    ).length;

    const losses = fights.filter(
      (fight) =>
        fight.result?.winner && fight.result.winner.toString() !== fighterId
    ).length;

    const draws = fights.filter(
      (fight) => fight.result?.method === 'Draw'
    ).length;

    const noContests = fights.filter(
      (fight) => fight.result?.method === 'No Contest'
    ).length;

    const koWins = fights.filter(
      (fight) =>
        fight.result?.winner?.toString() === fighterId &&
        (fight.result?.method === 'KO' || fight.result?.method === 'TKO')
    ).length;

    const submissionWins = fights.filter(
      (fight) =>
        fight.result?.winner?.toString() === fighterId &&
        fight.result?.method === 'Submission'
    ).length;

    const decisionWins = fights.filter(
      (fight) =>
        fight.result?.winner?.toString() === fighterId &&
        fight.result?.method === 'Decision'
    ).length;

    return {
      fighter,
      record: {
        wins,
        losses,
        draws,
        noContests,
      },
      finishStats: {
        koWins,
        submissionWins,
        decisionWins,
      },
      totalFights: fights.length,
      fights,
    };
  }

  static async getFighterFights(fighterId: string) {
    await dbConnect();
    return await Fight.find({
      $or: [{ fighter1: fighterId }, { fighter2: fighterId }],
    })
      .populate('fighter1 fighter2')
      .populate('event')
      .sort({ 'event.date': -1 });
  }

  static async getFighterUpcomingFights(fighterId: string) {
    await dbConnect();
    const now = new Date();

    const fights = await Fight.find({
      $or: [{ fighter1: fighterId }, { fighter2: fighterId }],
    })
      .populate('fighter1 fighter2')
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

  static async updateFighterRecord(
    fighterId: string,
    recordUpdate: { wins?: number; losses?: number; draws?: number }
  ) {
    await dbConnect();

    const fighter = await Fighter.findById(fighterId);
    if (!fighter) throw new Error('Fighter not found');

    // Parse current record (e.g., "15-2-0" -> [15, 2, 0])
    const [currentWins, currentLosses, currentDraws] = fighter.record
      .split('-')
      .map(Number);

    const newWins = recordUpdate.wins ?? currentWins;
    const newLosses = recordUpdate.losses ?? currentLosses;
    const newDraws = recordUpdate.draws ?? currentDraws;

    const newRecord = `${newWins}-${newLosses}-${newDraws}`;

    return await Fighter.findByIdAndUpdate(
      fighterId,
      { record: newRecord },
      { new: true }
    );
  }

  static async updateFighterStats(
    fighterId: string,
    statsUpdate: Partial<IFighter['stats']>
  ) {
    await dbConnect();

    return await Fighter.findByIdAndUpdate(
      fighterId,
      { $set: { stats: statsUpdate } },
      { new: true }
    );
  }

  static async addAchievement(
    fighterId: string,
    achievement: string
  ): Promise<IFighter | null> {
    await dbConnect();
    return await Fighter.findByIdAndUpdate(
      fighterId,
      { $addToSet: { achievements: achievement } },
      { new: true }
    );
  }

  static async removeAchievement(
    fighterId: string,
    achievement: string
  ): Promise<IFighter | null> {
    await dbConnect();
    return await Fighter.findByIdAndUpdate(
      fighterId,
      { $pull: { achievements: achievement } },
      { new: true }
    );
  }

  static async searchFighters(query: string): Promise<IFighter[]> {
    await dbConnect();
    return await Fighter.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { nickname: { $regex: query, $options: 'i' } },
        { hometown: { $regex: query, $options: 'i' } },
      ],
    }).sort({ name: 1 });
  }

  static async getFightersByWinStreak(
    minStreak: number = 3
  ): Promise<IFighter[]> {
    await dbConnect();
    return await Fighter.find({
      'stats.winStreak': { $gte: minStreak },
    }).sort({ 'stats.winStreak': -1 });
  }

  static async getTopFightersByKnockouts(
    limit: number = 10
  ): Promise<IFighter[]> {
    await dbConnect();
    return await Fighter.find({}).sort({ 'stats.knockouts': -1 }).limit(limit);
  }

  static async getFighterRankings(weightClass?: string): Promise<IFighter[]> {
    await dbConnect();
    let query = Fighter.find({});

    if (weightClass) {
      // This would need more sophisticated weight class matching
      query = query.where('weight').regex(new RegExp(weightClass, 'i'));
    }

    return await query
      .sort({
        'stats.winStreak': -1,
        'stats.knockouts': -1,
        'stats.submissions': -1,
      })
      .limit(20);
  }
}
