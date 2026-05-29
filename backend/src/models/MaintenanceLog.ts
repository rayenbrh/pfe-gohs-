import mongoose, { Schema } from 'mongoose';

import Vehicle from './Vehicle';
import type { IMaintenanceLogDocument, IMaintenanceLogModel } from '../types/models';
import { schemaOptionsFor } from '../utils/schemaOptions';

const partSchema = new Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const maintenanceLogSchema = new Schema<IMaintenanceLogDocument>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    type: {
      type: String,
      enum: ['scheduled', 'repair', 'inspection', 'tire_change', 'oil_change'],
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    cost: { type: Number, default: 0, min: 0 },
    mileageAtService: { type: Number, min: 0 },
    performedAt: { type: Date, required: true, index: true },
    performedBy: { type: String, required: true, trim: true },
    parts: { type: [partSchema], default: [] },
    nextScheduledDate: { type: Date },
    nextScheduledMileage: { type: Number, min: 0 },
    receiptUrl: { type: String },
    notes: { type: String },
  },
  schemaOptionsFor<IMaintenanceLogDocument>(),
);

maintenanceLogSchema.post('save', async function (doc) {
  const update: Record<string, unknown> = {};
  if (doc.nextScheduledDate) update.nextMaintenanceDate = doc.nextScheduledDate;
  if (doc.mileageAtService != null) update.mileage = doc.mileageAtService;
  if (Object.keys(update).length > 0) {
    await Vehicle.findByIdAndUpdate(doc.vehicle, update);
  }
});

const MaintenanceLog = mongoose.model<IMaintenanceLogDocument, IMaintenanceLogModel>(
  'MaintenanceLog',
  maintenanceLogSchema,
);

export default MaintenanceLog;
