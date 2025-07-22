import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketTier extends Document {
  _id: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  tierId: string; // The string ID used in the frontend (e.g., "general", "premium")
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  stripePriceId: string;
  maxQuantity: number;
  availableQuantity: number;
  isActive: boolean;
  sortOrder: number; // For displaying tiers in specific order
  createdAt: Date;
  updatedAt: Date;
}

const TicketTierSchema: Schema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    tierId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    features: [
      {
        type: String,
      },
    ],
    stripePriceId: {
      type: String,
      required: true,
    },
    maxQuantity: {
      type: Number,
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique ticket tiers per event
TicketTierSchema.index({ event: 1, tierId: 1 }, { unique: true });
TicketTierSchema.index({ event: 1, isActive: 1 });
TicketTierSchema.index({ event: 1, sortOrder: 1 });

// Virtual to get sold quantity from transactions
TicketTierSchema.virtual('soldQuantity', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'ticketTier',
  count: true,
  match: { status: 'confirmed', type: 'ticket' },
});

export default mongoose.models.TicketTier ||
  mongoose.model<ITicketTier>('TicketTier', TicketTierSchema);
