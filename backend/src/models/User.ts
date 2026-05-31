import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

import { getTenantConnection } from '../config/tenantDB';
import type { IUserDocument, IUserModel } from '../types/models';
import { schemaOptionsFor } from '../utils/schemaOptions';

export const userSchema = new Schema<IUserDocument>(
  {
    // ── Common fields ─────────────────────────────────────────────────────────
    name: { type: String, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'employee', 'client'],
      default: 'client',
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    avatar: { type: String },
    refreshToken: { type: String, select: false },
    passwordChangedAt: { type: Date, select: false },

    // ── Client-specific fields (populated when role === 'client') ─────────────
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    nationality: { type: String, trim: true },
    idType: { type: String, enum: ['cin', 'passport', 'driving_license'] },
    idNumber: { type: String, trim: true },
    idDocumentUrl: { type: String },
    driverLicenseUrl: { type: String },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    notes: { type: String },
    isBlacklisted: { type: Boolean, default: false },
    totalRentals: { type: Number, default: 0, min: 0 },
  },
  schemaOptionsFor<IUserDocument>((ret) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.passwordChangedAt;
  }),
);

userSchema.index({ role: 1 });
userSchema.index({ isBlacklisted: 1 });

userSchema.virtual('fullName').get(function (this: IUserDocument) {
  if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
  return this.name ?? '';
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

/**
 * Returns the User model bound to the current tenant connection.
 * Requires tenantMiddleware to have been applied on the request.
 */
export function getUserModel(conn?: mongoose.Connection): IUserModel {
  const c = conn ?? getTenantConnection();
  if (c.models.User) return c.models.User as IUserModel;
  return c.model<IUserDocument, IUserModel>('User', userSchema);
}

// Default export — legacy/seeding only, bound to the default mongoose connection
const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export default User;
