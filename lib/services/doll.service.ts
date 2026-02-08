import dbConnect from '@/lib/dbConnect';
import { Doll } from '@/lib/models';
import { IDoll } from '@/lib/models/Doll';

export class DollService {
  // Basic CRUD Operations
  static async createDoll(dollData: Partial<IDoll>): Promise<IDoll> {
    await dbConnect();
    const doll = new Doll(dollData);
    return await doll.save();
  }

  static async getDollById(id: string): Promise<IDoll | null> {
    await dbConnect();
    return await Doll.findById(id);
  }

  static async getAllDolls(): Promise<IDoll[]> {
    await dbConnect();
    return await Doll.find({}).sort({ name: 1 });
  }

  static async updateDoll(
    id: string,
    updateData: Partial<IDoll>
  ): Promise<IDoll | null> {
    await dbConnect();
    return await Doll.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteDoll(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Doll.findByIdAndDelete(id);
    return result !== null;
  }

  // Doll-specific operations
  static async getDollByName(name: string): Promise<IDoll | null> {
    await dbConnect();
    return await Doll.findOne({ name: { $regex: name, $options: 'i' } });
  }

  static async searchDolls(query: string): Promise<IDoll[]> {
    await dbConnect();
    return await Doll.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { instagram: { $regex: query, $options: 'i' } },
      ],
    }).sort({ name: 1 });
  }
}
