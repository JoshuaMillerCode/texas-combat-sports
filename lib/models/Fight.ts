import mongoose, { Schema, Document } from 'mongoose';

export interface IFight extends Document {
  _id: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  fighter1: mongoose.Types.ObjectId;
  fighter2: mongoose.Types.ObjectId;
  title: string;
  rounds: number;
  isMainEvent: boolean;
  result?: {
    winner?: mongoose.Types.ObjectId;
    method?: 'KO' | 'TKO' | 'Submission' | 'Decision' | 'Draw' | 'No Contest';
    round?: number;
    time?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FightSchema: Schema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    fighter1: {
      type: Schema.Types.ObjectId,
      ref: 'Fighter',
      required: true,
    },
    fighter2: {
      type: Schema.Types.ObjectId,
      ref: 'Fighter',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    rounds: {
      type: Number,
      required: true,
    },
    isMainEvent: {
      type: Boolean,
      default: false,
    },
    result: {
      winner: {
        type: Schema.Types.ObjectId,
        ref: 'Fighter',
      },
      method: {
        type: String,
        enum: ['KO', 'TKO', 'Submission', 'Decision', 'Draw', 'No Contest'],
      },
      round: {
        type: Number,
      },
      time: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
FightSchema.index({ event: 1 });
FightSchema.index({ fighter1: 1, fighter2: 1 });
FightSchema.index({ isMainEvent: 1 });

const Fight =
  mongoose.models.Fight || mongoose.model<IFight>('Fight', FightSchema);

export default Fight;
