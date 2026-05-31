import { getInvoiceModel } from '../models/Invoice';
import { getReservationModel } from '../models/Reservation';
import { getVehicleModel } from '../models/Vehicle';
import { EmailService } from './email.service';
import { generateInvoicePDF } from './pdf.service';
import type { IInvoiceDocument, IReservationDocument } from '../types/models';
import { APIFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/AppError';
import { uploadPdfBuffer } from '../utils/pdfUpload';

export async function createDraftInvoiceForReservation(
  reservation: IReservationDocument,
): Promise<IInvoiceDocument> {
  const Invoice = getInvoiceModel();
  const Vehicle = getVehicleModel();

  const existing = await Invoice.findOne({ reservation: reservation._id });
  if (existing) return existing;

  const vehicle = await Vehicle.findById(reservation.vehicle).select('brand model');
  const vehicleLabel = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle rental';

  return Invoice.create({
    reservation: reservation._id,
    client: reservation.client,
    lineItems: [
      {
        description: `${vehicleLabel} — ${reservation.totalDays} day(s) @ ${reservation.pricePerDay}/day`,
        quantity: reservation.totalDays,
        unitPrice: reservation.pricePerDay,
        total: reservation.totalPrice,
      },
    ],
    status: 'draft',
  });
}

export async function updateInvoiceWithExtraCharges(
  reservationId: string,
  extraCharges: number,
): Promise<IInvoiceDocument | null> {
  const Invoice = getInvoiceModel();
  const invoice = await Invoice.findOne({ reservation: reservationId });
  if (!invoice) return null;

  const hasExtraLine = invoice.lineItems.some((item) =>
    item.description.toLowerCase().includes('extra charges'),
  );

  if (!hasExtraLine && extraCharges > 0) {
    invoice.lineItems.push({
      description: 'Extra charges (late return, damage, etc.)',
      quantity: 1,
      unitPrice: extraCharges,
      total: extraCharges,
    });
  } else if (hasExtraLine && extraCharges > 0) {
    invoice.lineItems = invoice.lineItems.map((item) =>
      item.description.toLowerCase().includes('extra charges')
        ? { ...item, unitPrice: extraCharges, total: extraCharges }
        : item,
    );
  }

  await invoice.save();
  return invoice;
}

export async function createCompletionInvoiceIfMissing(
  reservation: IReservationDocument,
): Promise<IInvoiceDocument> {
  return createDraftInvoiceForReservation(reservation);
}

/** @deprecated Use createDraftInvoiceForReservation */
export async function createInvoiceForReservation(reservationId: string) {
  const Reservation = getReservationModel();
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) return null;
  return createDraftInvoiceForReservation(reservation);
}

export async function listInvoices(query: Record<string, string | undefined>) {
  const Invoice = getInvoiceModel();
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.client) filter.client = query.client;
  if (query.dateFrom || query.dateTo) {
    filter.issuedAt = {};
    if (query.dateFrom) (filter.issuedAt as Record<string, Date>).$gte = new Date(query.dateFrom);
    if (query.dateTo) (filter.issuedAt as Record<string, Date>).$lte = new Date(query.dateTo);
  }

  const features = new APIFeatures(
    Invoice.find(filter)
      .populate('reservation', 'reservationNumber status')
      .populate('client', 'firstName lastName fullName'),
    query,
  )
    .sort()
    .limitFields()
    .paginate();

  const invoices = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;

  return {
    invoices,
    results: invoices.length,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: Math.floor(skip / limit) + 1,
  };
}

export async function getInvoiceById(id: string) {
  const Invoice = getInvoiceModel();
  const invoice = await Invoice.findById(id).populate('client').populate('reservation');
  if (!invoice) throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
  return invoice;
}

export async function createManualInvoice(data: {
  reservation: string;
  taxRate?: number;
  discountAmount?: number;
  dueDate?: Date;
  notes?: string;
}) {
  const Reservation = getReservationModel();
  const Invoice = getInvoiceModel();
  const Vehicle = getVehicleModel();

  const reservation = await Reservation.findById(data.reservation);
  if (!reservation) throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');

  const existing = await Invoice.findOne({ reservation: reservation._id });
  if (existing) return existing;

  const vehicle = await Vehicle.findById(reservation.vehicle).select('brand model');
  const vehicleLabel = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'véhicule';

  return Invoice.create({
    reservation: reservation._id,
    client: reservation.client,
    lineItems: [
      {
        description: `Location véhicule — ${vehicleLabel} (${reservation.totalDays} jours)`,
        quantity: reservation.totalDays,
        unitPrice: reservation.pricePerDay,
        total: reservation.totalPrice,
      },
    ],
    taxRate: data.taxRate ?? 0,
    discountAmount: data.discountAmount ?? 0,
    dueDate: data.dueDate,
    notes: data.notes,
    status: 'draft',
  });
}

export async function ensureInvoicePdf(invoiceId: string): Promise<{ invoice: IInvoiceDocument; buffer: Buffer }> {
  const Invoice = getInvoiceModel();
  const invoice = await Invoice.findById(invoiceId)
    .populate('client', 'firstName lastName email phone address')
    .populate('reservation', 'reservationNumber');

  if (!invoice) throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');

  const buffer = await generateInvoicePDF(
    invoice.toObject() as unknown as Parameters<typeof generateInvoicePDF>[0],
  );

  if (!invoice.pdfUrl) {
    const pdfUrl = await uploadPdfBuffer(buffer, 'invoices', `${invoice.invoiceNumber}.pdf`);
    invoice.pdfUrl = pdfUrl;
    await invoice.save();
  }

  return { invoice, buffer };
}

export async function updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid' | 'void') {
  const Invoice = getInvoiceModel();
  const invoice = await Invoice.findById(id)
    .populate('client', 'firstName lastName email phone address')
    .populate('reservation', 'reservationNumber');

  if (!invoice) throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');

  invoice.status = status;
  if (status === 'paid') invoice.paidAt = new Date();

  await invoice.save();

  if (status === 'sent') {
    const { buffer } = await ensureInvoicePdf(id);
    const client = invoice.client as unknown as { email?: string; firstName: string; lastName: string };
    if (client.email) {
      await EmailService.sendInvoiceWithPdf(client.email, {
        clientName: `${client.firstName} ${client.lastName}`,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.totalAmount,
        pdfBuffer: buffer,
      });
    }
  }

  return invoice;
}
