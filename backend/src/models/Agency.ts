import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IAgency {
  name: string;
  slug: string;
  dbName: string;
  address: string;
  phone: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgencyDocument extends IAgency, Document {
  _id: mongoose.Types.ObjectId;
}

export type IAgencyModel = Model<IAgencyDocument>;

const agencySchema = new Schema<IAgencyDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    dbName: { type: String, required: true, unique: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

agencySchema.index({ slug: 1 });

// Use master connection (default mongoose connection)
const Agency = mongoose.model<IAgencyDocument, IAgencyModel>('Agency', agencySchema);
export default Agency;
