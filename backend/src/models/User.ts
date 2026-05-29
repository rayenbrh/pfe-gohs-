import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

import type { IUserDocument, IUserModel } from '../types/models';
import { schemaOptionsFor } from '../utils/schemaOptions';

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'agent'],
      default: 'agent',
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    avatar: { type: String },
    refreshToken: { type: String, select: false },
    passwordChangedAt: { type: Date, select: false },
  },
  schemaOptionsFor<IUserDocument>((ret) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.passwordChangedAt;
  }),
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

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

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
