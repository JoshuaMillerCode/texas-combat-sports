import dbConnect from '@/lib/dbConnect';
import Merch, { IMerch } from '@/lib/models/Merch';
import Transaction from '@/lib/models/Transaction';
import mongoose from 'mongoose';

export class MerchService {
  // Basic CRUD Operations
  static async createMerch(merchData: Partial<IMerch>): Promise<IMerch> {
    await dbConnect();
    const merch = new Merch(merchData);
    return await merch.save();
  }

  static async getMerchById(id: string): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findById(id);
  }

  static async getMerchByProductId(productId: string): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findOne({ productId, isActive: true });
  }

  static async getAllMerch(): Promise<IMerch[]> {
    await dbConnect();
    return await Merch.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  }

  static async updateMerch(
    id: string,
    updateData: Partial<IMerch>
  ): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteMerch(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Merch.findByIdAndDelete(id);
    return result !== null;
  }

  // Merch-specific operations
  static async getMerchByCategory(category: string): Promise<IMerch[]> {
    await dbConnect();
    return await Merch.find({ category, isActive: true }).sort({
      sortOrder: 1,
      name: 1,
    });
  }

  static async getFeaturedMerch(): Promise<IMerch[]> {
    await dbConnect();
    return await Merch.find({ isFeatured: true, isActive: true }).sort({
      sortOrder: 1,
    });
  }

  static async getNewMerch(): Promise<IMerch[]> {
    await dbConnect();
    return await Merch.find({ isNew: true, isActive: true }).sort({
      createdAt: -1,
    });
  }

  static async getMerchByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<IMerch[]> {
    await dbConnect();
    return await Merch.find({
      price: { $gte: minPrice, $lte: maxPrice },
      isActive: true,
    }).sort({ price: 1 });
  }

  static async searchMerch(query: string): Promise<IMerch[]> {
    await dbConnect();
    return await Merch.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ],
        },
      ],
    }).sort({ name: 1 });
  }

  static async updateInventory(
    id: string,
    inventoryUpdate: Partial<IMerch['inventory']>
  ): Promise<IMerch | null> {
    await dbConnect();

    return await Merch.findByIdAndUpdate(
      id,
      { $set: { inventory: inventoryUpdate } },
      { new: true }
    );
  }

  static async reserveInventory(
    productId: string,
    quantity: number
  ): Promise<IMerch | null> {
    await dbConnect();

    const merch = await Merch.findOne({ productId, isActive: true });
    if (!merch) throw new Error('Product not found');
    if (merch.inventory.available < quantity)
      throw new Error('Insufficient inventory');

    return await Merch.findByIdAndUpdate(
      merch._id,
      {
        $inc: {
          'inventory.available': -quantity,
          'inventory.reserved': quantity,
        },
      },
      { new: true }
    );
  }

  static async releaseReservedInventory(
    productId: string,
    quantity: number
  ): Promise<IMerch | null> {
    await dbConnect();

    const merch = await Merch.findOne({ productId });
    if (!merch) throw new Error('Product not found');

    const availableToRelease = Math.min(quantity, merch.inventory.reserved);

    return await Merch.findByIdAndUpdate(
      merch._id,
      {
        $inc: {
          'inventory.available': availableToRelease,
          'inventory.reserved': -availableToRelease,
        },
      },
      { new: true }
    );
  }

  static async confirmSale(
    productId: string,
    quantity: number
  ): Promise<IMerch | null> {
    await dbConnect();

    const merch = await Merch.findOne({ productId });
    if (!merch) throw new Error('Product not found');

    const confirmedQuantity = Math.min(quantity, merch.inventory.reserved);

    return await Merch.findByIdAndUpdate(
      merch._id,
      {
        $inc: {
          'inventory.reserved': -confirmedQuantity,
          'inventory.total': -confirmedQuantity,
        },
      },
      { new: true }
    );
  }

  static async getMerchSales(merchId: string) {
    await dbConnect();

    const [merch, salesData] = await Promise.all([
      Merch.findById(merchId),
      Transaction.aggregate([
        {
          $match: {
            merch: new mongoose.Types.ObjectId(merchId),
            type: 'merch',
            status: 'confirmed',
          },
        },
        {
          $group: {
            _id: null,
            totalSold: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalAmount' },
            avgPrice: { $avg: '$unitPrice' },
            orderCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const sales = salesData[0] || {
      totalSold: 0,
      totalRevenue: 0,
      avgPrice: 0,
      orderCount: 0,
    };

    return {
      merch,
      ...sales,
    };
  }

  static async getLowStockItems(threshold?: number): Promise<IMerch[]> {
    await dbConnect();

    if (threshold !== undefined) {
      return await Merch.find({
        'inventory.available': { $lte: threshold },
        isActive: true,
      }).sort({ 'inventory.available': 1 });
    }

    // Use each item's individual threshold
    const allMerch = await Merch.find({ isActive: true });
    return allMerch
      .filter(
        (item) => item.inventory.available <= item.inventory.lowStockThreshold
      )
      .sort((a, b) => a.inventory.available - b.inventory.available);
  }

  static async getTopSellingMerch(limit: number = 10): Promise<any[]> {
    await dbConnect();

    return await Transaction.aggregate([
      { $match: { type: 'merch', status: 'confirmed' } },
      {
        $group: {
          _id: '$merch',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'merches',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);
  }

  static async getCategorySales() {
    await dbConnect();

    return await Transaction.aggregate([
      { $match: { type: 'merch', status: 'confirmed' } },
      {
        $lookup: {
          from: 'merches',
          localField: 'merch',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          productCount: { $addToSet: '$merch' },
        },
      },
      {
        $project: {
          category: '$_id',
          totalSold: 1,
          totalRevenue: 1,
          productCount: { $size: '$productCount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
  }

  static async updateRating(
    merchId: string,
    newRating: number
  ): Promise<IMerch | null> {
    await dbConnect();

    if (newRating < 0 || newRating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    return await Merch.findByIdAndUpdate(
      merchId,
      { rating: newRating },
      { new: true }
    );
  }

  static async addTag(merchId: string, tag: string): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findByIdAndUpdate(
      merchId,
      { $addToSet: { tags: tag } },
      { new: true }
    );
  }

  static async removeTag(merchId: string, tag: string): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findByIdAndUpdate(
      merchId,
      { $pull: { tags: tag } },
      { new: true }
    );
  }

  static async setFeaturedStatus(
    merchId: string,
    isFeatured: boolean
  ): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findByIdAndUpdate(
      merchId,
      { isFeatured },
      { new: true }
    );
  }

  static async setNewStatus(
    merchId: string,
    isNew: boolean
  ): Promise<IMerch | null> {
    await dbConnect();
    return await Merch.findByIdAndUpdate(merchId, { isNew }, { new: true });
  }

  static async bulkUpdatePrices(
    updates: Array<{ id: string; price: number }>
  ): Promise<boolean> {
    await dbConnect();

    const operations = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { price: update.price },
      },
    }));

    const result = await Merch.bulkWrite(operations);
    return result.modifiedCount === updates.length;
  }

  static async getInventoryReport() {
    await dbConnect();

    const [
      totalProducts,
      activeProducts,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
    ] = await Promise.all([
      Merch.countDocuments(),
      Merch.countDocuments({ isActive: true }),
      Merch.find({ isActive: true }).then(
        (items) =>
          items.filter(
            (item) =>
              item.inventory.available <= item.inventory.lowStockThreshold
          ).length
      ),
      Merch.countDocuments({ 'inventory.available': 0, isActive: true }),
      Merch.aggregate([
        { $match: { isActive: true } },
        {
          $project: {
            inventoryValue: { $multiply: ['$inventory.total', '$price'] },
          },
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$inventoryValue' },
          },
        },
      ]),
    ]);

    return {
      totalProducts,
      activeProducts,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue: totalInventoryValue[0]?.totalValue || 0,
    };
  }
}
