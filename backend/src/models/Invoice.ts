import mongoose, { Schema } from 'mongoose';

import type { IInvoiceDocument, IInvoiceLineItem, IInvoiceModel } from '../types/models';
import { generateSequentialId } from '../utils/generateId';
import { schemaOptionsFor } from '../utils/schemaOptions';

const lineItemSchema = new Schema<IInvoiceLineItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoiceDocument>(
  {
    invoiceNumber: { type: String, unique: true },
    /** @deprecated Legacy field — kept for existing DB index compatibility */
    reference: { type: String, unique: true, sparse: true },
    reservation: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    lineItems: { type: [lineItemSchema], required: true, default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'void'],
      default: 'draft',
      index: true,
    },
    pdfUrl: { type: String },
    issuedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paidAt: { type: Date },
    paymentMethod: { type: String },
    notes: { type: String },
  },
  schemaOptionsFor<IInvoiceDocument>(),
);

invoiceSchema.pre('save', async function (this: IInvoiceDocument, next) {
  this.lineItems = this.lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));

  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);
  this.taxAmount = this.subtotal * (this.taxRate / 100);
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;

  if (this.isNew && !this.invoiceNumber) {
    this.invoiceNumber = await generateSequentialId('INV');
  }

  if (this.invoiceNumber) {
    this.reference = this.invoiceNumber;
  }

  next();
});

const Invoice = mongoose.model<IInvoiceDocument, IInvoiceModel>('Invoice', invoiceSchema);

export default Invoice;
