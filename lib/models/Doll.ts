import mongoose, { Schema, Document } from 'mongoose';

export interface IDoll extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  image: string;
  bio: string;
  instagram: string;
  createdAt: Date;
  updatedAt: Date;
}

const DollSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    instagram: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
DollSchema.index({ name: 1 });

const Doll =
  mongoose.models.Doll || mongoose.model<IDoll>('Doll', DollSchema);

export default Doll;
