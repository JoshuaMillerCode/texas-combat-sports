import mongoose, { Schema, Document } from 'mongoose';
import { OrderIDGenerator } from '../utils/order-id-generator';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'event_tickets' | 'merchandise' | 'mixed'; // Added 'mixed' for transactions with both tickets and merch

  // Event reference (for ticket transactions or mixed transactions with tickets)
  event?: mongoose.Types.ObjectId;
  orderId: string;

  // Items arrays - support multiple items per transaction
  ticketItems?: Array<{
    ticketTier: mongoose.Types.ObjectId;
    tierName: string; // Store name for easy access
    quantity: number;
    price: number;
    // Individual ticket tracking
    tickets: Array<{
      ticketNumber: string;
      isUsed: boolean;
      usedAt?: Date;
    }>;
  }>;

  merchItems?: Array<{
    merch: mongoose.Types.ObjectId;
    productName: string; // Store name for easy access
    productId: string; // Store product ID for reference
    quantity: number;
    // Variant information (size, color, etc.)
    selectedVariants?: Array<{
      name: string; // e.g., "Size", "Color"
      value: string; // e.g., "Large", "Red"
    }>;
  }>;

  // Stripe information
  stripeSessionId: string;
  stripePaymentIntentId?: string;

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

  // Transaction summary
  summary: {
    totalItems: number; // Total count of all items
    totalTickets: number; // Total ticket count
    totalMerch: number; // Total merch count
    subtotal: number; // Sum of all item subtotals
    taxes: number; // Tax amount in cents
    fees: number; // Processing fees in cents
    totalAmount: number; // Final total amount in cents
    currency: string;
  };

  // Transaction status
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  purchaseDate: Date;

  // For merch - shipping information (only if transaction contains merch)
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

  // Enhanced metadata
  metadata: {
    eventTitle?: string; // For ticket transactions
    eventDate?: string; // For ticket transactions
    eventVenue?: string; // For ticket transactions
    orderNotes?: string; // Customer notes
    source?: 'web' | 'mobile' | 'admin' | 'pos'; // Where the order came from
  };

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['event_tickets', 'merchandise', 'mixed'],
      required: true,
    },

    // Event reference
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: function (this: ITransaction) {
        return this.type === 'event_tickets' || this.type === 'mixed';
      },
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Ticket items array
    ticketItems: [
      {
        ticketTier: {
          type: Schema.Types.ObjectId,
          ref: 'TicketTier',
          required: true,
        },
        tierName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        tickets: [
          {
            ticketNumber: {
              type: String,
              unique: true,
              sparse: true,
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
      },
    ],

    // Merch items array
    merchItems: [
      {
        merch: {
          type: Schema.Types.ObjectId,
          ref: 'Merch',
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        productId: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        selectedVariants: [
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
      },
    ],

    // Stripe information
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripePaymentIntentId: {
      type: String,
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

    // Transaction summary
    summary: {
      totalItems: {
        type: Number,
        required: true,
      },
      totalTickets: {
        type: Number,
        default: 0,
      },
      totalMerch: {
        type: Number,
        default: 0,
      },
      subtotal: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      fees: {
        type: Number,
        default: 0,
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

    // For merch - shipping information
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

    // Enhanced metadata
    metadata: {
      eventTitle: String,
      eventDate: String,
      eventVenue: String,
      orderNotes: String,
      source: {
        type: String,
        enum: ['web', 'mobile', 'admin', 'pos'],
        default: 'web',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
// stripeSessionId already has unique: true which creates an index
TransactionSchema.index({ 'customerDetails.email': 1 });
TransactionSchema.index({ purchaseDate: 1 });
TransactionSchema.index({ event: 1 }); // For ticket queries
TransactionSchema.index({ 'ticketItems.ticketTier': 1 }); // For ticket tier analytics
TransactionSchema.index({ 'merchItems.merch': 1 }); // For merch analytics
TransactionSchema.index({ 'summary.totalAmount': 1 }); // For revenue analytics
TransactionSchema.index({ 'metadata.source': 1 }); // For source tracking

// Pre-save middleware to generate ticket numbers and calculate totals
TransactionSchema.pre('save', async function (this: ITransaction, next) {
  // Generate ticket numbers for new ticket transactions
  if (
    (this.type === 'event_tickets' || this.type === 'mixed') &&
    this.isNew &&
    this.ticketItems &&
    this.ticketItems.length > 0
  ) {
    for (const ticketItem of this.ticketItems) {
      if (!ticketItem.tickets || ticketItem.tickets.length === 0) {
        const ticketNumbers = [];
        for (let i = 0; i < ticketItem.quantity; i++) {
          const ticketNumber = OrderIDGenerator.generateTicketNumber();
          ticketNumbers.push({
            ticketNumber,
            isUsed: false,
          });
        }
        ticketItem.tickets = ticketNumbers;
      }
    }
  }

  // Calculate transaction summary counts (prices will be calculated dynamically)
  if (this.isNew || this.isModified(['ticketItems', 'merchItems'])) {
    let totalItems = 0;
    let totalTickets = 0;
    let totalMerch = 0;

    // Calculate ticket totals
    if (this.ticketItems) {
      for (const item of this.ticketItems) {
        totalTickets += item.quantity;
        totalItems += item.quantity;
      }
    }

    // Calculate merch totals
    if (this.merchItems) {
      for (const item of this.merchItems) {
        totalMerch += item.quantity;
        totalItems += item.quantity;
      }
    }

    // Update summary (prices will be set manually when creating transaction)
    if (!this.summary) {
      this.summary = {
        totalItems,
        totalTickets,
        totalMerch,
        subtotal: 0,
        taxes: 0,
        fees: 0,
        totalAmount: 0,
        currency: 'USD',
      };
    } else {
      this.summary.totalItems = totalItems;
      this.summary.totalTickets = totalTickets;
      this.summary.totalMerch = totalMerch;
    }
  }

  next();
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
