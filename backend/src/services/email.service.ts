import { formatDate } from '../utils/formatters';
import { sendEmail } from '../utils/sendEmail';
import {
  cancellationEmail,
  invoiceEmail,
  paymentConfirmationEmail,
  reservationConfirmationEmail,
} from '../utils/emailTemplates';

export class EmailService {
  static async sendWelcome(to: string, name: string) {
    await sendEmail({
      to,
      subject: 'Welcome to Inova Ride',
      text: `Hello ${name}, welcome to Inova Ride.`,
      html: `<p>Hello ${name},</p><p>Welcome to Inova Ride. Your account has been created successfully.</p>`,
    });
  }

  static async sendReservationConfirmation(
    to: string,
    params: {
      clientName: string;
      reference: string;
      vehicleName: string;
      startDate: Date;
      endDate: Date;
      pickupLocation?: string;
      returnLocation?: string;
      totalPrice?: number;
    },
  ) {
    const [firstName, ...rest] = params.clientName.split(' ');
    const tpl = reservationConfirmationEmail(
      {
        reservationNumber: params.reference,
        vehicleName: params.vehicleName,
        startDate: params.startDate,
        endDate: params.endDate,
        totalPrice: params.totalPrice ?? 0,
        pickupLocation: params.pickupLocation ?? '—',
        returnLocation: params.returnLocation ?? '—',
      },
      { firstName, lastName: rest.join(' ') || firstName },
    );
    await sendEmail({ to, ...tpl });
  }

  static async sendMaintenanceAlert(
    to: string | string[],
    params: {
      vehicleName: string;
      licensePlate?: string;
      dueDate: Date;
      daysRemaining: number;
      mileage?: number;
      category?: string;
    },
  ) {
    const daysLabel =
      params.daysRemaining <= 0
        ? 'due now or overdue'
        : `${params.daysRemaining} day(s) remaining`;

    await sendEmail({
      to,
      subject: `⚠️ Maintenance due soon — ${params.vehicleName}`,
      text: [
        `Vehicle: ${params.vehicleName}`,
        params.licensePlate ? `Plate: ${params.licensePlate}` : '',
        params.category ? `Category: ${params.category}` : '',
        `Maintenance due: ${formatDate(params.dueDate)} (${daysLabel})`,
        params.mileage != null ? `Current mileage: ${params.mileage} km` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <p><strong>Maintenance due soon</strong></p>
        <p><strong>${params.vehicleName}</strong>${params.licensePlate ? ` — ${params.licensePlate}` : ''}</p>
        ${params.category ? `<p>Category: ${params.category}</p>` : ''}
        <p>Due date: <strong>${formatDate(params.dueDate)}</strong> (${daysLabel})</p>
        ${params.mileage != null ? `<p>Current mileage: ${params.mileage} km</p>` : ''}
      `,
    });
  }

  static async sendReservationPickupReminder(
    to: string,
    params: {
      clientName: string;
      reservationNumber: string;
      vehicleName: string;
      startDate: Date;
      pickupLocation?: string;
    },
  ) {
    await sendEmail({
      to,
      subject: `Your vehicle pickup is tomorrow — ${params.reservationNumber}`,
      text: [
        `Hello ${params.clientName},`,
        'Your vehicle pickup is tomorrow.',
        `Reservation: ${params.reservationNumber}`,
        `Vehicle: ${params.vehicleName}`,
        `Pickup date: ${formatDate(params.startDate)}`,
        params.pickupLocation ? `Location: ${params.pickupLocation}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <p>Hello ${params.clientName},</p>
        <p><strong>Your vehicle pickup is tomorrow.</strong></p>
        <p>Reservation: <strong>${params.reservationNumber}</strong></p>
        <p>Vehicle: <strong>${params.vehicleName}</strong></p>
        <p>Pickup: <strong>${formatDate(params.startDate)}</strong></p>
        ${params.pickupLocation ? `<p>Location: ${params.pickupLocation}</p>` : ''}
      `,
    });
  }

  static async sendInvoiceWithPdf(
    to: string,
    params: { clientName: string; invoiceNumber: string; total: number; pdfBuffer: Buffer },
  ) {
    const [firstName, ...rest] = params.clientName.split(' ');
    const tpl = invoiceEmail(
      { invoiceNumber: params.invoiceNumber, totalAmount: params.total },
      { firstName, lastName: rest.join(' ') || firstName },
    );
    await sendEmail({
      to,
      ...tpl,
      attachments: [
        {
          filename: `${params.invoiceNumber}.pdf`,
          content: params.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  static async sendReservationCancellation(
    to: string,
    params: { clientName: string; reference: string; reason?: string; vehicleName?: string; totalPrice?: number },
  ) {
    const [firstName, ...rest] = params.clientName.split(' ');
    const tpl = cancellationEmail(
      {
        reservationNumber: params.reference,
        vehicleName: params.vehicleName ?? '—',
        totalPrice: params.totalPrice ?? 0,
      },
      { firstName, lastName: rest.join(' ') || firstName },
      params.reason,
    );
    await sendEmail({ to, ...tpl });
  }

  static async sendReservationCompletion(
    to: string,
    params: { clientName: string; reference: string; vehicleName: string; total: number },
  ) {
    await sendEmail({
      to,
      subject: `Rental completed — ${params.reference}`,
      text: `Hello ${params.clientName}, your rental of ${params.vehicleName} is complete. Total: ${params.total.toFixed(2)} TND`,
      html: `
        <p>Hello ${params.clientName},</p>
        <p>Your rental of <strong>${params.vehicleName}</strong> (${params.reference}) is now complete.</p>
        <p>Total amount: <strong>${params.total.toFixed(2)} TND</strong></p>
      `,
    });
  }

  static async sendPaymentConfirmation(
    to: string,
    params: {
      client: { firstName: string; lastName: string };
      reservation: {
        reservationNumber: string;
        vehicleName: string;
        startDate: Date;
        endDate: Date;
        totalPrice: number;
        pickupLocation: string;
        returnLocation: string;
      };
      invoice: { invoiceNumber: string; totalAmount: number; pdfUrl?: string };
    },
  ) {
    const tpl = paymentConfirmationEmail(params.reservation, params.invoice, params.client);
    await sendEmail({ to, ...tpl });
  }
}
