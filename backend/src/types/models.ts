import type { Document, Model, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'agent';

export type VehicleCategory = 'economy' | 'luxury' | 'utility' | 'suv' | 'van';
export type FuelType = 'diesel' | 'petrol' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';

export type ClientIdType = 'cin' | 'passport' | 'driving_license';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled';

export type ReservationPaymentStatus = 'unpaid' | 'partial' | 'paid';
export type ReservationPaymentMethod = 'cash' | 'card' | 'online';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void';

export type MaintenanceLogType =
  | 'scheduled'
  | 'repair'
  | 'inspection'
  | 'tire_change'
  | 'oil_change';

export type SequentialIdPrefix = 'RES' | 'CTR' | 'INV';

// ─── Plain interfaces (API / shared types) ───────────────────────────────────

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  category: VehicleCategory;
  color: string;
  seats: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  pricePerDay: number;
  images: string[];
  description?: string;
  features?: string[];
  isAvailable: boolean;
  isActive: boolean;
  mileage: number;
  nextMaintenanceDate?: Date;
  maintenanceIntervalKm: number;
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  displayName?: string;
}

export interface IClient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  nationality: string;
  idType: ClientIdType;
  idNumber: string;
  idDocumentUrl?: string;
  driverLicenseUrl?: string;
  address?: string;
  dateOfBirth?: Date;
  notes?: string;
  isBlacklisted: boolean;
  isActive: boolean;
  totalRentals: number;
  createdAt: Date;
  updatedAt: Date;
  fullName?: string;
}

export interface IReservation {
  _id: string;
  reservationNumber: string;
  /** @deprecated Legacy DB field */
  reference?: string;
  vehicle: string;
  client: string;
  agent?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  depositAmount?: number;
  status: ReservationStatus;
  pickupLocation: string;
  returnLocation: string;
  paymentStatus: ReservationPaymentStatus;
  paymentMethod: ReservationPaymentMethod;
  konnectPaymentRef?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  actualReturnDate?: Date;
  extraCharges: number;
  notes?: string;
  refundRequired?: boolean;
  cancelledBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IContract {
  _id: string;
  contractNumber: string;
  reservation: string;
  pdfUrl: string;
  generatedAt: Date;
  terms?: string;
  clientSignatureUrl?: string;
  signedAt?: Date;
  isVoid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  /** @deprecated Legacy DB field */
  reference?: string;
  reservation: string;
  client: string;
  lineItems: IInvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  pdfUrl?: string;
  issuedAt: Date;
  dueDate?: Date;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaintenancePart {
  name: string;
  cost: number;
}

export interface IMaintenanceLog {
  _id: string;
  vehicle: string;
  type: MaintenanceLogType;
  description: string;
  cost: number;
  mileageAtService?: number;
  performedAt: Date;
  performedBy: string;
  parts?: IMaintenancePart[];
  nextScheduledDate?: Date;
  nextScheduledMileage?: number;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICounter {
  _id: string;
  seq: number;
}

// ─── Mongoose document types ────────────────────────────────────────────────

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

export interface IUserDocument
  extends Omit<IUser, '_id' | 'password'>,
    Document {
  _id: Types.ObjectId;
  password: string;
  refreshToken?: string;
  passwordChangedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type IUserModel = Model<IUserDocument, Record<string, never>, IUserMethods> &
  IUserStatics;

export interface IVehicleMethods {
  isMaintenanceDue(): boolean;
}

export interface IVehicleDocument
  extends Omit<IVehicle, '_id' | 'displayName' | 'addedBy' | 'model'>,
    Omit<Document, 'model'> {
  _id: Types.ObjectId;
  model: string;
  addedBy?: Types.ObjectId;
  displayName: string;
  isMaintenanceDue(): boolean;
}

export type IVehicleModel = Model<IVehicleDocument, Record<string, never>, IVehicleMethods>;

export interface IClientDocument
  extends Omit<IClient, '_id' | 'fullName'>,
    Document {
  _id: Types.ObjectId;
  fullName: string;
}

export type IClientModel = Model<IClientDocument>;

export interface IReservationStatics {
  checkAvailability(
    vehicleId: Types.ObjectId | string,
    startDate: Date,
    endDate: Date,
    excludeId?: Types.ObjectId | string,
  ): Promise<boolean>;
}

export interface IReservationDocument
  extends Omit<IReservation, '_id' | 'vehicle' | 'client' | 'agent' | 'cancelledBy'>,
    Document {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
  client: Types.ObjectId;
  agent?: Types.ObjectId;
  cancelledBy?: Types.ObjectId;
}

export type IReservationModel = Model<IReservationDocument> & IReservationStatics;

export interface IContractDocument
  extends Omit<IContract, '_id' | 'reservation'>,
    Document {
  _id: Types.ObjectId;
  reservation: Types.ObjectId;
}

export type IContractModel = Model<IContractDocument>;

export interface IInvoiceDocument
  extends Omit<IInvoice, '_id' | 'reservation' | 'client'>,
    Document {
  _id: Types.ObjectId;
  reservation: Types.ObjectId;
  client: Types.ObjectId;
}

export type IInvoiceModel = Model<IInvoiceDocument>;

export interface IMaintenanceLogDocument
  extends Omit<IMaintenanceLog, '_id' | 'vehicle'>,
    Document {
  _id: Types.ObjectId;
  vehicle: Types.ObjectId;
}

export type IMaintenanceLogModel = Model<IMaintenanceLogDocument>;

export interface ICounterDocument extends Omit<Document, '_id'>, ICounter {}

export type ICounterModel = Model<ICounterDocument>;
