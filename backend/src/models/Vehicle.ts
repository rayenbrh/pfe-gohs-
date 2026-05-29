import mongoose, { Schema } from 'mongoose';

import type { IVehicleDocument, IVehicleModel } from '../types/models';
import { schemaOptionsFor } from '../utils/schemaOptions';

const vehicleSchema = new Schema<IVehicleDocument>(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1990, max: 2035 },
    licensePlate: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: {
      type: String,
      enum: ['economy', 'luxury', 'utility', 'suv', 'van'],
      required: true,
      index: true,
    },
    color: { type: String, required: true, trim: true },
    seats: { type: Number, required: true, min: 2, max: 12 },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'hybrid'],
      required: true,
    },
    pricePerDay: { type: Number, required: true, min: 0, index: true },
    images: { type: [String], default: [] },
    description: { type: String, trim: true },
    features: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    mileage: { type: Number, default: 0, min: 0 },
    nextMaintenanceDate: { type: Date },
    maintenanceIntervalKm: { type: Number, default: 10000, min: 0 },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptionsFor<IVehicleDocument>(),
);

vehicleSchema.index({ brand: 'text', model: 'text', description: 'text' });

vehicleSchema.virtual('displayName').get(function (this: IVehicleDocument) {
  return `${this.brand} ${this.model} ${this.year}`;
});

vehicleSchema.methods.isMaintenanceDue = function (this: IVehicleDocument): boolean {
  if (!this.nextMaintenanceDate) return false;
  const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return this.nextMaintenanceDate.getTime() <= sevenDaysFromNow;
};

const Vehicle = mongoose.model<IVehicleDocument, IVehicleModel>('Vehicle', vehicleSchema);

export default Vehicle;
