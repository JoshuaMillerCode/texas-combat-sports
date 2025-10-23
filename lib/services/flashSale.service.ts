import dbConnect from '@/lib/dbConnect';
import { FlashSale, TicketTier } from '@/lib/models';
import { IFlashSale } from '@/lib/models/FlashSale';
import { ITicketTier } from '@/lib/models/TicketTier';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export class FlashSaleService {
  // Basic CRUD Operations
  static async createFlashSale(
    saleData: Partial<IFlashSale>
  ): Promise<IFlashSale> {
    await dbConnect();

    // Validate no overlapping flash sales for the same ticket types
    if (saleData.targetTicketTypes && saleData.targetTicketTypes.length > 0) {
      const overlapping = await this.findOverlappingFlashSales(
        saleData.targetTicketTypes,
        saleData.startAt!,
        saleData.endAt!
      );

      if (overlapping.length > 0) {
        throw new Error(
          `Flash sale overlaps with existing sale: ${overlapping[0].title}`
        );
      }
    }

    // Validate Stripe Price IDs
    if (saleData.stripePriceId) {
      await this.validateStripePriceId(saleData.stripePriceId);
    }
    if (saleData.originalStripePriceId) {
      await this.validateStripePriceId(saleData.originalStripePriceId);
    }

    const sale = new FlashSale(saleData);
    return await sale.save();
  }

  static async getFlashSaleById(id: string): Promise<IFlashSale | null> {
    await dbConnect();
    return await FlashSale.findById(id);
  }

  static async getAllFlashSales(): Promise<IFlashSale[]> {
    await dbConnect();
    return await FlashSale.find({}).sort({ startAt: -1 });
  }

  static async updateFlashSale(
    id: string,
    updateData: Partial<IFlashSale>
  ): Promise<IFlashSale | null> {
    await dbConnect();

    // If updating time range or target ticket types, check for overlaps
    if (
      updateData.targetTicketTypes ||
      updateData.startAt ||
      updateData.endAt
    ) {
      const currentSale = await FlashSale.findById(id);
      if (!currentSale) throw new Error('Flash sale not found');

      const targetTickets =
        updateData.targetTicketTypes || currentSale.targetTicketTypes;
      const startAt = updateData.startAt || currentSale.startAt;
      const endAt = updateData.endAt || currentSale.endAt;

      const overlapping = await this.findOverlappingFlashSales(
        targetTickets,
        startAt,
        endAt,
        id // Exclude current sale from overlap check
      );

      if (overlapping.length > 0) {
        throw new Error(
          `Flash sale would overlap with: ${overlapping[0].title}`
        );
      }
    }

    // Validate Stripe Price IDs if being updated
    if (updateData.stripePriceId) {
      await this.validateStripePriceId(updateData.stripePriceId);
    }
    if (updateData.originalStripePriceId) {
      await this.validateStripePriceId(updateData.originalStripePriceId);
    }

    return await FlashSale.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  static async deleteFlashSale(id: string): Promise<boolean> {
    await dbConnect();
    const result = await FlashSale.findByIdAndDelete(id);
    return result !== null;
  }

  static async activateFlashSale(id: string): Promise<IFlashSale | null> {
    await dbConnect();
    return await FlashSale.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }

  static async deactivateFlashSale(id: string): Promise<IFlashSale | null> {
    await dbConnect();
    return await FlashSale.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  // Flash Sale-specific operations

  /**
   * Get all currently active flash sales (within time range and marked as active)
   */
  static async getActiveFlashSales(): Promise<IFlashSale[]> {
    await dbConnect();
    const now = new Date();

    return await FlashSale.find({
      isActive: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).sort({ startAt: -1 });
  }

  /**
   * Get active flash sale for a specific ticket tier ID
   */
  static async getActiveFlashSaleForTicketTier(
    ticketTierId: string
  ): Promise<IFlashSale | null> {
    await dbConnect();
    const now = new Date();

    return await FlashSale.findOne({
      isActive: true,
      targetTicketTypes: ticketTierId,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).sort({ startAt: -1 });
  }

  /**
   * Get flash sale pricing information for a ticket tier
   * Returns the sale price and original price from Stripe
   */
  static async getFlashSalePricing(ticketTierId: string): Promise<{
    hasFlashSale: boolean;
    flashSale?: IFlashSale;
    originalPrice?: number;
    salePrice?: number;
    currency?: string;
  }> {
    const flashSale = await this.getActiveFlashSaleForTicketTier(ticketTierId);

    if (!flashSale) {
      return { hasFlashSale: false };
    }

    try {
      // Fetch prices from Stripe
      const [originalPriceData, salePriceData] = await Promise.all([
        stripe.prices.retrieve(flashSale.originalStripePriceId),
        stripe.prices.retrieve(flashSale.stripePriceId),
      ]);

      return {
        hasFlashSale: true,
        flashSale,
        originalPrice: originalPriceData.unit_amount!, // Return in cents for formatAmountForDisplay
        salePrice: salePriceData.unit_amount!, // Return in cents for formatAmountForDisplay
        currency: salePriceData.currency,
      };
    } catch (error) {
      console.error('Error fetching flash sale pricing from Stripe:', error);
      return { hasFlashSale: false };
    }
  }

  /**
   * Get the correct Stripe Price ID to use for a ticket tier
   * Returns flash sale price if active, otherwise returns the original price
   */
  static async getEffectiveStripePriceId(ticketTier: ITicketTier): Promise<{
    stripePriceId: string;
    isFlashSale: boolean;
    flashSale?: IFlashSale;
  }> {
    const flashSale = await this.getActiveFlashSaleForTicketTier(
      ticketTier._id.toString()
    );

    if (flashSale) {
      return {
        stripePriceId: flashSale.stripePriceId,
        isFlashSale: true,
        flashSale,
      };
    }

    return {
      stripePriceId: ticketTier.stripePriceId,
      isFlashSale: false,
    };
  }

  /**
   * Find overlapping flash sales for given ticket types and time range
   */
  private static async findOverlappingFlashSales(
    ticketTypeIds: string[],
    startAt: Date,
    endAt: Date,
    excludeId?: string
  ): Promise<IFlashSale[]> {
    await dbConnect();

    const query: any = {
      isActive: true,
      targetTicketTypes: { $in: ticketTypeIds },
      $or: [
        // New sale starts during existing sale
        { startAt: { $lte: startAt }, endAt: { $gte: startAt } },
        // New sale ends during existing sale
        { startAt: { $lte: endAt }, endAt: { $gte: endAt } },
        // New sale completely contains existing sale
        { startAt: { $gte: startAt }, endAt: { $lte: endAt } },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await FlashSale.find(query);
  }

  /**
   * Validate that a Stripe Price ID exists
   */
  private static async validateStripePriceId(priceId: string): Promise<void> {
    try {
      await stripe.prices.retrieve(priceId);
    } catch (error) {
      throw new Error(`Invalid Stripe Price ID: ${priceId}`);
    }
  }

  /**
   * Get upcoming flash sales (scheduled but not yet started)
   */
  static async getUpcomingFlashSales(): Promise<IFlashSale[]> {
    await dbConnect();
    const now = new Date();

    return await FlashSale.find({
      isActive: true,
      startAt: { $gt: now },
    }).sort({ startAt: 1 });
  }

  /**
   * Get past flash sales (ended)
   */
  static async getPastFlashSales(): Promise<IFlashSale[]> {
    await dbConnect();
    const now = new Date();

    return await FlashSale.find({
      endAt: { $lt: now },
    }).sort({ endAt: -1 });
  }

  /**
   * Get flash sales by ticket tier ID (all statuses)
   */
  static async getFlashSalesByTicketTier(
    ticketTierId: string
  ): Promise<IFlashSale[]> {
    await dbConnect();

    return await FlashSale.find({
      targetTicketTypes: ticketTierId,
    }).sort({ startAt: -1 });
  }

  /**
   * Bulk deactivate expired flash sales
   * Useful for a cron job or scheduled task
   */
  static async deactivateExpiredFlashSales(): Promise<number> {
    await dbConnect();
    const now = new Date();

    const result = await FlashSale.updateMany(
      {
        isActive: true,
        endAt: { $lt: now },
      },
      {
        isActive: false,
      }
    );

    return result.modifiedCount;
  }
}
