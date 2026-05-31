import mongoose, { Schema } from 'mongoose';

import { getTenantConnection } from '../config/tenantDB';
import type { ICounterDocument, ICounterModel } from '../types/models';

const counterSchema = new Schema<ICounterDocument>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
);

export function getCounterModel(conn?: mongoose.Connection): ICounterModel {
  const c = conn ?? getTenantConnection();
  if (c.models.Counter) return c.models.Counter as ICounterModel;
  return c.model<ICounterDocument, ICounterModel>('Counter', counterSchema);
}

const Counter = mongoose.model<ICounterDocument, ICounterModel>('Counter', counterSchema);
export default Counter;
