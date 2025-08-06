import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;

  // Basic video information
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;

  // Live event support
  isLiveEvent: boolean;
  scheduledStartTime?: Date;
  liveStreamUrl?: string;

  // Event relationship
  associatedEvent?: mongoose.Types.ObjectId;

  // Video metadata
  duration?: number; // in seconds
  viewCount: number;
  isPublic: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    // Basic video information
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Live event support
    isLiveEvent: {
      type: Boolean,
      default: false,
    },
    scheduledStartTime: {
      type: Date,
    },
    liveStreamUrl: {
      type: String,
      trim: true,
    },

    // Event relationship
    associatedEvent: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },

    // Video metadata
    duration: {
      type: Number,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
VideoSchema.index({ isLiveEvent: 1 });
VideoSchema.index({ associatedEvent: 1 });
VideoSchema.index({ isPublic: 1 });
VideoSchema.index({ scheduledStartTime: 1 });
VideoSchema.index({ createdAt: -1 });

// Virtual for live status
VideoSchema.virtual('isCurrentlyLive').get(function (this: IVideo) {
  if (!this.isLiveEvent || !this.scheduledStartTime) {
    return false;
  }
  const now = new Date();
  return now >= this.scheduledStartTime;
});

// Static method to get live events
VideoSchema.statics.getLiveEvents = function () {
  return this.find({
    isLiveEvent: true,
    isPublic: true,
  }).populate('associatedEvent');
};

// Static method to get upcoming live events
VideoSchema.statics.getUpcomingLiveEvents = function () {
  const now = new Date();
  return this.find({
    isLiveEvent: true,
    scheduledStartTime: { $gt: now },
    isPublic: true,
  })
    .populate('associatedEvent')
    .sort({ scheduledStartTime: 1 });
};

// Instance method to increment view count
VideoSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

const Video =
  mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
