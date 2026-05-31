import mongoose, { Schema, Types } from 'mongoose';

import { getTenantConnection } from '../config/tenantDB';
import type { IReservationDocument, IReservationModel } from '../types/models';
import { generateSequentialId } from '../utils/generateId';
import { schemaOptionsFor } from '../utils/schemaOptions';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const reservationSchema = new Schema<IReservationDocument>(
  {
  reservationNumber: { type: String, unique: true },
    /** @deprecated Legacy field — kept for existing DB index compatibility */
    reference: { type: String, unique: true, sparse: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    agent: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    totalDays: { type: Number, min: 1 },
    pricePerDay: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, min: 0 },
    depositAmount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    pickupLocation: { type: String, required: true, trim: true },
    returnLocation: { type: String, required: true, trim: true },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },
    konnectPaymentRef: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    actualReturnDate: { type: Date },
    extraCharges: { type: Number, default: 0, min: 0 },
    notes: { type: String },
    refundRequired: { type: Boolean, default: false },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptionsFor<IReservationDocument>(),
);

reservationSchema.pre('save', async function (this: IReservationDocument, next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (this.isNew && this.endDate < today) {
    return next(new Error('End date must not be in the past'));
  }

  this.totalDays = Math.max(1, Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / MS_PER_DAY));
  this.totalPrice = this.totalDays * this.pricePerDay;

  if (this.isNew && !this.reservationNumber) {
    this.reservationNumber = await generateSequentialId('RES');
  }

  if (this.reservationNumber) {
    this.reference = this.reservationNumber;
  }

  next();
});

reservationSchema.statics.checkAvailability = async function (
  vehicleId: Types.ObjectId | string,
  startDate: Date,
  endDate: Date,
  excludeId?: Types.ObjectId | string,
): Promise<boolean> {
  const filter: Record<string, unknown> = {
    vehicle: vehicleId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const overlap = await this.findOne(filter).select('_id').lean();
  return !overlap;
};

export function getReservationModel(conn?: mongoose.Connection): IReservationModel {
  const c = conn ?? getTenantConnection();
  if (c.models.Reservation) return c.models.Reservation as IReservationModel;
  return c.model<IReservationDocument, IReservationModel>('Reservation', reservationSchema);
}

const Reservation = mongoose.model<IReservationDocument, IReservationModel>(
  'Reservation',
  reservationSchema,
);
export default Reservation;
