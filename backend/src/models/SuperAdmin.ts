import bcrypt from 'bcryptjs';
import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISuperAdmin {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISuperAdminDocument extends Omit<ISuperAdmin, 'password'>, Document {
  _id: mongoose.Types.ObjectId;
  password: string;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface ISuperAdminModel extends Model<ISuperAdminDocument> {
  findByEmail(email: string): Promise<ISuperAdminDocument | null>;
}

const superAdminSchema = new Schema<ISuperAdminDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    avatar: { type: String },
  },
  { timestamps: true },
);

superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

superAdminSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

superAdminSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

// Lives on the master connection
const SuperAdmin = mongoose.model<ISuperAdminDocument, ISuperAdminModel>(
  'SuperAdmin',
  superAdminSchema,
);
export default SuperAdmin;
