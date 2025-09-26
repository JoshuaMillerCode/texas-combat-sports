import mongoose, { Schema, Document } from 'mongoose';

export interface IFighter extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  nickname: string;
  record: string;
  age: number;
  height: string;
  reach: string;
  weight: string;
  hometown: string;
  image?: string;
  stats: {
    knockouts: number;
    submissions: number;
    decisions: number;
    winStreak: number;
  };
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FighterSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    record: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    reach: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    hometown: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    featured: {
      type: Boolean,
      required: true,
      default: false,
    },
    stats: {
      knockouts: {
        type: Number,
        required: true,
        default: 0,
      },
      submissions: {
        type: Number,
        required: true,
        default: 0,
      },
      decisions: {
        type: Number,
        required: true,
        default: 0,
      },
      winStreak: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    achievements: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
FighterSchema.index({ name: 1 });
FighterSchema.index({ nickname: 1 });

const Fighter =
  mongoose.models.Fighter || mongoose.model<IFighter>('Fighter', FighterSchema);

export default Fighter;
