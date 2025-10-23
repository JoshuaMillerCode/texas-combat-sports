import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashSale extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  targetTicketTypes: string[]; // Array of ticket tier IDs
  stripePriceId: string; // The sale Stripe Price ID
  originalStripePriceId: string; // The original Stripe Price ID for reference
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlashSaleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IFlashSale, value: Date) {
          return value > this.startAt;
        },
        message: 'End date must be after start date',
      },
    },
    targetTicketTypes: [
      {
        type: String,
        required: true,
      },
    ],
    stripePriceId: {
      type: String,
      required: true,
    },
    originalStripePriceId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
FlashSaleSchema.index({ startAt: 1, endAt: 1 });
FlashSaleSchema.index({ targetTicketTypes: 1 });
FlashSaleSchema.index({ isActive: 1 });

// Compound index for finding active sales for specific ticket types
FlashSaleSchema.index({
  targetTicketTypes: 1,
  isActive: 1,
  startAt: 1,
  endAt: 1,
});

const FlashSale =
  mongoose.models.FlashSale ||
  mongoose.model<IFlashSale>('FlashSale', FlashSaleSchema);

export default FlashSale;
