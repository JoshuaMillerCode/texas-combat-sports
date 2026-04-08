import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerMagicToken extends Document {
  email: string;
  tokenHash: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const CustomerMagicTokenSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes expired docs (background job, ~60s delay)
// The service also checks expiresAt explicitly — do not rely on this alone
CustomerMagicTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// For rate-limit count queries
CustomerMagicTokenSchema.index({ email: 1, createdAt: 1 });

// For token verification queries
CustomerMagicTokenSchema.index({ tokenHash: 1, isUsed: 1, expiresAt: 1 });

const CustomerMagicToken =
  mongoose.models.CustomerMagicToken ||
  mongoose.model<ICustomerMagicToken>('CustomerMagicToken', CustomerMagicTokenSchema);

export default CustomerMagicToken;
