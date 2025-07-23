import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  subtitle: string;
  date: Date;
  location: string;
  address: string;
  venue: string;
  city: string;
  capacity: string;
  ticketPrice: string;
  posterImage?: string;
  heroVideo?: string;
  description: string;
  mainEventFight?: mongoose.Types.ObjectId;
  fights: mongoose.Types.ObjectId[];
  ticketTiers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    capacity: {
      type: String,
      required: true,
    },
    ticketPrice: {
      type: String,
      required: true,
    },
    posterImage: {
      type: String,
    },
    heroVideo: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    mainEventFight: {
      type: Schema.Types.ObjectId,
      ref: 'Fight',
    },
    fights: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Fight',
      },
    ],
    ticketTiers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TicketTier',
      },
    ],
    isLive: {
      type: Boolean,
      default: false,
    },
    youtubeId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
EventSchema.index({ date: 1 });
EventSchema.index({ slug: 1 });

export default mongoose.models.Event ||
  mongoose.model<IEvent>('Event', EventSchema);
