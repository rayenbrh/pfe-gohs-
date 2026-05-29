import mongoose, { Schema } from 'mongoose';

import type { ICounterDocument, ICounterModel } from '../types/models';

const counterSchema = new Schema<ICounterDocument>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
);

const Counter = mongoose.model<ICounterDocument, ICounterModel>('Counter', counterSchema);

export default Counter;
