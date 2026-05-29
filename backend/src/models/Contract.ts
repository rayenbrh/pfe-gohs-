import mongoose, { Schema } from 'mongoose';

import type { IContractDocument, IContractModel } from '../types/models';
import { generateSequentialId } from '../utils/generateId';
import { schemaOptionsFor } from '../utils/schemaOptions';

const contractSchema = new Schema<IContractDocument>(
  {
    contractNumber: { type: String, unique: true },
    reservation: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
      unique: true,
    },
    pdfUrl: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    terms: { type: String },
    clientSignatureUrl: { type: String },
    signedAt: { type: Date },
    isVoid: { type: Boolean, default: false },
  },
  schemaOptionsFor<IContractDocument>(),
);

contractSchema.pre('save', async function (this: IContractDocument, next) {
  if (this.isNew && !this.contractNumber) {
    this.contractNumber = await generateSequentialId('CTR');
  }
  next();
});

const Contract = mongoose.model<IContractDocument, IContractModel>('Contract', contractSchema);

export default Contract;
