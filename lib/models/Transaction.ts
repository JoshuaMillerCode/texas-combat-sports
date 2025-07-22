import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'ticket' | 'merch';

  // References based on type
  ticketTier?: mongoose.Types.ObjectId; // Only for ticket transactions
  merch?: mongoose.Types.ObjectId; // Only for merch transactions
  event?: mongoose.Types.ObjectId; // Only for ticket transactions

  // Stripe information
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  stripePriceId: string;

  // Customer information
  customerDetails: {
    email: string;
    name: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };

  // Transaction details
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;

  // Transaction status
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  purchaseDate: Date;

  // For tickets - individual ticket tracking
  tickets?: Array<{
    ticketNumber: string;
    isUsed: boolean;
    usedAt?: Date;
  }>;

  // For merch - shipping information
  shipping?: {
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    name: string;
    trackingNumber?: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    shippedAt?: Date;
    deliveredAt?: Date;
  };

  // Metadata for transaction details
  metadata: {
    itemName: string;
    itemDescription?: string;
    eventTitle?: string; // Only for tickets
    eventDate?: string; // Only for tickets
    eventVenue?: string; // Only for tickets
    category?: string; // Only for merch
  };

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['ticket', 'merch'],
      required: true,
    },

    // Conditional references based on type
    ticketTier: {
      type: Schema.Types.ObjectId,
      ref: 'TicketTier',
      required: function (this: ITransaction) {
        return this.type === 'ticket';
      },
    },
    merch: {
      type: Schema.Types.ObjectId,
      ref: 'Merch',
      required: function (this: ITransaction) {
        return this.type === 'merch';
      },
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: function (this: ITransaction) {
        return this.type === 'ticket';
      },
    },

    // Stripe information
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripePriceId: {
      type: String,
      required: true,
    },

    // Customer information
    customerDetails: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    },

    // Transaction details
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },

    // Transaction status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // For tickets only
    tickets: [
      {
        ticketNumber: {
          type: String,
          unique: true,
          sparse: true, // Allows null values while maintaining uniqueness
        },
        isUsed: {
          type: Boolean,
          default: false,
        },
        usedAt: {
          type: Date,
        },
      },
    ],

    // For merch only
    shipping: {
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
      name: String,
      trackingNumber: String,
      status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        default: 'pending',
      },
      shippedAt: Date,
      deliveredAt: Date,
    },

    // Metadata
    metadata: {
      itemName: {
        type: String,
        required: true,
      },
      itemDescription: String,
      eventTitle: String,
      eventDate: String,
      eventVenue: String,
      category: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ stripeSessionId: 1 });
TransactionSchema.index({ 'customerDetails.email': 1 });
TransactionSchema.index({ purchaseDate: 1 });
TransactionSchema.index({ event: 1 }); // For ticket queries
TransactionSchema.index({ ticketTier: 1 }); // For ticket tier analytics
TransactionSchema.index({ merch: 1 }); // For merch analytics

// Pre-save middleware to generate ticket numbers for ticket transactions
TransactionSchema.pre('save', async function (this: ITransaction, next) {
  if (
    this.type === 'ticket' &&
    this.isNew &&
    (!this.tickets || this.tickets.length === 0)
  ) {
    // Generate ticket numbers for new ticket transactions
    const ticketNumbers = [];
    for (let i = 0; i < this.quantity; i++) {
      const ticketNumber = `TCS-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
      ticketNumbers.push({
        ticketNumber,
        isUsed: false,
      });
    }
    this.tickets = ticketNumbers;
  }
  next();
});

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
