import mongoose, { Schema, Document } from 'mongoose';

export interface IMerch extends Document {
  _id: mongoose.Types.ObjectId;
  productId: string; // The string ID used in the frontend (e.g., "tcs-hoodie-black")
  name: string;
  description?: string;
  price: number;
  currency: string;
  stripePriceId: string;
  images: string[]; // Support multiple images
  category: string;
  rating?: number;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  inventory: {
    total: number;
    available: number;
    reserved: number;
    lowStockThreshold: number;
  };
  variants?: Array<{
    name: string; // e.g., "Size", "Color"
    options: string[]; // e.g., ["S", "M", "L", "XL"]
    required: boolean;
  }>;
  specifications?: Array<{
    name: string; // e.g., "Material", "Care Instructions"
    value: string;
  }>;
  tags: string[]; // For search and filtering
  weight?: number; // For shipping calculations
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MerchSchema: Schema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    stripePriceId: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inventory: {
      total: {
        type: Number,
        required: true,
        default: 0,
      },
      available: {
        type: Number,
        required: true,
        default: 0,
      },
      reserved: {
        type: Number,
        required: true,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
    },
    variants: [
      {
        name: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],
    specifications: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    weight: {
      type: Number, // in grams
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['in', 'cm'],
        default: 'in',
      },
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

// Indexes for efficient queries
MerchSchema.index({ category: 1 });
MerchSchema.index({ isActive: 1 });
MerchSchema.index({ isNew: 1 });
MerchSchema.index({ isFeatured: 1 });
MerchSchema.index({ price: 1 });
MerchSchema.index({ tags: 1 });
MerchSchema.index({ category: 1, sortOrder: 1 });

// Virtual to check if item is in low stock
MerchSchema.virtual('isLowStock').get(function (this: IMerch) {
  return this.inventory.available <= this.inventory.lowStockThreshold;
});

// Virtual to get sold quantity from transactions
MerchSchema.virtual('soldQuantity', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'merch',
  count: true,
  match: { status: 'confirmed', type: 'merch' },
});

export default mongoose.models.Merch ||
  mongoose.model<IMerch>('Merch', MerchSchema);
