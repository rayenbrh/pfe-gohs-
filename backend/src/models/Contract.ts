import mongoose, { Schema } from 'mongoose';

import { getTenantConnection } from '../config/tenantDB';
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

export function getContractModel(conn?: mongoose.Connection): IContractModel {
  const c = conn ?? getTenantConnection();
  if (c.models.Contract) return c.models.Contract as IContractModel;
  return c.model<IContractDocument, IContractModel>('Contract', contractSchema);
}

const Contract = mongoose.model<IContractDocument, IContractModel>('Contract', contractSchema);
export default Contract;
