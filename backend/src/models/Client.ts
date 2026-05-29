import mongoose, { Schema } from 'mongoose';

import type { IClientDocument, IClientModel } from '../types/models';
import { schemaOptionsFor } from '../utils/schemaOptions';

const clientSchema = new Schema<IClientDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    nationality: { type: String, required: true, trim: true },
    idType: {
      type: String,
      enum: ['cin', 'passport', 'driving_license'],
      required: true,
    },
    idNumber: { type: String, required: true, trim: true, index: true },
    idDocumentUrl: { type: String },
    driverLicenseUrl: { type: String },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    notes: { type: String },
    isBlacklisted: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    totalRentals: { type: Number, default: 0, min: 0 },
  },
  schemaOptionsFor<IClientDocument>(),
);

clientSchema.virtual('fullName').get(function (this: IClientDocument) {
  return `${this.firstName} ${this.lastName}`;
});

const Client = mongoose.model<IClientDocument, IClientModel>('Client', clientSchema);

export default Client;
