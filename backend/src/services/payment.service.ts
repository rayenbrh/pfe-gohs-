import logger from '../config/logger';
import { getInvoiceModel } from '../models/Invoice';
import { getReservationModel } from '../models/Reservation';
import { APIFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/AppError';
import {
  paymentConfirmationEmail,
  paymentFailureEmail,
} from '../utils/emailTemplates';
import { sendEmail } from '../utils/sendEmail';

export interface KonnectPaymentInit {
  receiverWalletId: string;
  token: string;
  amount: number;
  type: string;
  description: string;
  acceptedPaymentMethods: string[];
  lifespan: number;
  checkoutForm: boolean;
  addPaymentFeesToAmount: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  orderId: string;
  webhook: string;
  silentWebhook: boolean;
  successUrl: string;
  failUrl: string;
  theme: string;
}

export type KonnectPaymentStatusValue =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'failed';

export interface KonnectPaymentStatus {
  paymentRef: string;
  status: KonnectPaymentStatusValue;
  amount?: number;
  raw?: unknown;
}

interface PopulatedReservationForPayment {
  _id: unknown;
  reservationNumber: string;
  totalPrice: number;
  depositAmount?: number;
  konnectPaymentRef?: string;
  client: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  vehicle: {
    brand: string;
    model: string;
  };
}

function getKonnectConfig() {
  const apiKey = process.env.KONNECT_API_KEY;
  const walletId = process.env.KONNECT_WALLET_ID;
  const baseUrl = process.env.KONNECT_API_URL ?? 'https://api.konnect.network';

  if (!apiKey || !walletId) {
    throw new AppError('Konnect payment is not configured', 503, 'KONNECT_NOT_CONFIGURED');
  }

  return { apiKey, walletId, baseUrl };
}

function getApiBaseUrl(): string {
  return process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:3000';
}

function normalizeStatus(raw: string): KonnectPaymentStatusValue {
  const s = raw.toLowerCase();
  if (s === 'completed' || s === 'success') return 'paid';
  if (['pending', 'paid', 'cancelled', 'expired', 'failed'].includes(s)) {
    return s as KonnectPaymentStatusValue;
  }
  return 'pending';
}

export async function initKonnectPayment(
  reservation: PopulatedReservationForPayment,
): Promise<{ payUrl: string; paymentRef: string }> {
  const { apiKey, walletId, baseUrl } = getKonnectConfig();
  const apiBase = getApiBaseUrl();
  const frontend = getFrontendUrl();

  const amountMillimes = Math.round(
    (reservation.totalPrice + (reservation.depositAmount ?? 0)) * 1000,
  );

  const payload: KonnectPaymentInit = {
    receiverWalletId: walletId,
    token: 'TND',
    amount: amountMillimes,
    type: 'immediate',
    description: `Inova Ride — ${reservation.reservationNumber} — ${reservation.vehicle.brand} ${reservation.vehicle.model}`,
    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
    lifespan: 30,
    checkoutForm: true,
    addPaymentFeesToAmount: false,
    firstName: reservation.client.firstName,
    lastName: reservation.client.lastName,
    phoneNumber: reservation.client.phone.replace(/\s/g, ''),
    email: reservation.client.email ?? `client+${reservation.reservationNumber}@inovaride.com`,
    orderId: reservation.reservationNumber,
    webhook: `${apiBase}/api/payments/webhook`,
    silentWebhook: true,
    successUrl: `${frontend}/payment/success?ref=PAYMENT_REF`,
    failUrl: `${frontend}/payment/cancel?ref=PAYMENT_REF`,
    theme: 'dark',
  };

  const response = await fetch(`${baseUrl}/api/v2/payments/init-payment`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.text();
    logger.error('Konnect init-payment failed', { status: response.status, body: errBody });
    throw new AppError('Failed to initiate Konnect payment', 502, 'KONNECT_INIT_FAILED');
  }

  const data = (await response.json()) as { payUrl?: string; paymentRef?: string };

  if (!data.payUrl || !data.paymentRef) {
    throw new AppError('Invalid response from Konnect', 502, 'KONNECT_INVALID_RESPONSE');
  }

  const payUrl = data.payUrl.replace(/PAYMENT_REF/g, data.paymentRef);

  const Reservation = getReservationModel();
  await Reservation.findByIdAndUpdate(reservation._id, {
    konnectPaymentRef: data.paymentRef,
    paymentMethod: 'online',
  });

  return { payUrl, paymentRef: data.paymentRef };
}

export async function verifyKonnectPayment(paymentRef: string): Promise<KonnectPaymentStatus> {
  const { apiKey, baseUrl } = getKonnectConfig();

  const response = await fetch(`${baseUrl}/api/v2/payments/${paymentRef}`, {
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    throw new AppError('Failed to verify payment with Konnect', 502, 'KONNECT_VERIFY_FAILED');
  }

  const data = (await response.json()) as {
    payment?: { status?: string; amount?: number; paymentRef?: string };
    status?: string;
    amount?: number;
  };

  const statusRaw = data.payment?.status ?? data.status ?? 'pending';
  const amount = data.payment?.amount ?? data.amount;

  return {
    paymentRef,
    status: normalizeStatus(statusRaw),
    amount,
    raw: data,
  };
}

export async function processKonnectWebhook(paymentRef: string): Promise<void> {
  const Reservation = getReservationModel();
  const Invoice = getInvoiceModel();

  const konnectStatus = await verifyKonnectPayment(paymentRef);

  const reservation = await Reservation.findOne({ konnectPaymentRef: paymentRef })
    .populate('client', 'firstName lastName email phone')
    .populate('vehicle', 'brand model');

  if (!reservation) {
    logger.warn('Webhook: no reservation for paymentRef', { paymentRef });
    return;
  }

  const client = reservation.client as unknown as {
    firstName: string;
    lastName: string;
    email?: string;
  };
  const vehicle = reservation.vehicle as unknown as { brand: string; model: string };
  const vehicleName = `${vehicle.brand} ${vehicle.model}`;

  if (konnectStatus.status === 'paid') {
    reservation.paymentStatus = 'paid';
    if (reservation.status === 'pending') {
      reservation.status = 'confirmed';
    }
    await reservation.save();

    const invoice = await Invoice.findOneAndUpdate(
      { reservation: reservation._id },
      { status: 'paid', paidAt: new Date(), paymentMethod: 'online' },
      { new: true },
    );

    if (client.email) {
      const tpl = paymentConfirmationEmail(
        {
          reservationNumber: reservation.reservationNumber,
          vehicleName,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          totalPrice: reservation.totalPrice,
          pickupLocation: reservation.pickupLocation,
          returnLocation: reservation.returnLocation,
        },
        {
          invoiceNumber: invoice?.invoiceNumber ?? 'N/A',
          totalAmount: invoice?.totalAmount ?? reservation.totalPrice,
          pdfUrl: invoice?.pdfUrl,
        },
        client,
      );
      await sendEmail({ to: client.email, ...tpl });
    }

    logger.info('Payment confirmed', {
      paymentRef,
      reservationId: reservation._id.toString(),
    });
    return;
  }

  if (konnectStatus.status === 'cancelled' || konnectStatus.status === 'expired') {
    reservation.status = 'cancelled';
    reservation.paymentStatus = 'unpaid';
    reservation.cancellationReason = `Payment ${konnectStatus.status}`;
    reservation.cancelledAt = new Date();
    await reservation.save();

    if (client.email) {
      const tpl = paymentFailureEmail(
        {
          reservationNumber: reservation.reservationNumber,
          totalPrice: reservation.totalPrice,
        },
        client,
      );
      await sendEmail({ to: client.email, ...tpl });
    }

    logger.info('Payment failed/cancelled', { paymentRef, status: konnectStatus.status });
  }
}

export async function listPaymentHistory(query: Record<string, string | undefined>) {
  const Reservation = getReservationModel();
  const filter: Record<string, unknown> = {
    konnectPaymentRef: { $exists: true, $ne: null },
  };

  if (query.status) {
    if (query.status === 'paid') filter.paymentStatus = 'paid';
    else if (query.status === 'unpaid') filter.paymentStatus = 'unpaid';
    else if (query.status === 'cancelled') filter.status = 'cancelled';
  }

  if (query.dateFrom || query.dateTo) {
    filter.updatedAt = {};
    if (query.dateFrom) {
      (filter.updatedAt as Record<string, Date>).$gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      (filter.updatedAt as Record<string, Date>).$lte = new Date(query.dateTo);
    }
  }

  const features = new APIFeatures(
    Reservation.find(filter)
      .select('reservationNumber konnectPaymentRef totalPrice paymentStatus status updatedAt client')
      .populate('client', 'firstName lastName email')
      .sort('-updatedAt'),
    query,
  ).paginate();

  const payments = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;

  return {
    payments: payments.map((r) => ({
      reservationId: r._id,
      reservationNumber: r.reservationNumber,
      paymentRef: r.konnectPaymentRef,
      amount: r.totalPrice,
      paymentStatus: r.paymentStatus,
      reservationStatus: r.status,
      updatedAt: r.updatedAt,
      client: r.client,
    })),
    results: payments.length,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: Math.floor(skip / limit) + 1,
  };
}

/** @deprecated Use initKonnectPayment */
export class PaymentService {
  static initKonnectPayment = initKonnectPayment;
  static verifyKonnectPayment = verifyKonnectPayment;
  static processKonnectWebhook = processKonnectWebhook;
}
