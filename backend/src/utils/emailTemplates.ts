import { formatCurrency, formatDate } from './formatters';

const BRAND = '#7c3aed';
const BG = '#0f0f14';
const CARD = '#1a1a24';
const TEXT = '#e2e8f0';
const MUTED = '#94a3b8';

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:${CARD};border-radius:12px;overflow:hidden;border:1px solid #2d2d3d;">
        <tr><td style="background:linear-gradient(135deg,${BRAND},#4f46e5);padding:24px 32px;">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#fff;letter-spacing:2px;">INova RIDE</p>
          <p style="margin:4px 0 0;font-size:12px;color:#ddd6fe;">Premium Car Rental — Tunisie</p>
        </td></tr>
        <tr><td style="padding:32px;color:${TEXT};">
          <h1 style="margin:0 0 16px;font-size:20px;color:#fff;">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#12121a;border-top:1px solid #2d2d3d;">
          <p style="margin:0;font-size:12px;color:${MUTED};text-align:center;">
            Inova Ride · Tunis, Tunisia · support@inovaride.com · +216 70 000 000
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:${MUTED};font-size:14px;width:140px;">${label}</td>
    <td style="padding:8px 0;color:${TEXT};font-size:14px;font-weight:bold;">${value}</td>
  </tr>`;
}

export interface ReservationEmailData {
  reservationNumber: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  pickupLocation: string;
  returnLocation: string;
}

export interface ClientEmailData {
  firstName: string;
  lastName: string;
  email?: string;
}

export interface InvoiceEmailData {
  invoiceNumber: string;
  totalAmount: number;
  pdfUrl?: string;
}

export function reservationConfirmationEmail(
  reservation: ReservationEmailData,
  client: ClientEmailData,
): { subject: string; html: string; text: string } {
  const subject = `Confirmation de réservation - Inova Ride #${reservation.reservationNumber}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  const body = `
    <p style="color:${MUTED};font-size:14px;line-height:1.6;">Bonjour <strong style="color:#fff;">${clientName}</strong>,</p>
    <p style="color:${MUTED};font-size:14px;line-height:1.6;">Votre réservation a été enregistrée avec succès.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#12121a;border-radius:8px;padding:16px;">
      ${row('Référence', reservation.reservationNumber)}
      ${row('Véhicule', reservation.vehicleName)}
      ${row('Début', formatDate(reservation.startDate))}
      ${row('Fin', formatDate(reservation.endDate))}
      ${row('Prise en charge', reservation.pickupLocation)}
      ${row('Restitution', reservation.returnLocation)}
      ${row('Total', formatCurrency(reservation.totalPrice))}
    </table>
    <p style="text-align:center;margin:28px 0;">
      <a href="${process.env.FRONTEND_URL ?? 'http://localhost:3000'}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:14px;">Votre véhicule vous attend</a>
    </p>`;

  const text = `Confirmation de réservation Inova Ride #${reservation.reservationNumber}
Bonjour ${clientName},

Véhicule: ${reservation.vehicleName}
Du ${formatDate(reservation.startDate)} au ${formatDate(reservation.endDate)}
Total: ${formatCurrency(reservation.totalPrice)}

Votre véhicule vous attend — Inova Ride`;

  return { subject, html: layout('Confirmation de réservation', body), text };
}

export function paymentConfirmationEmail(
  reservation: ReservationEmailData,
  invoice: InvoiceEmailData,
  client: ClientEmailData,
): { subject: string; html: string; text: string } {
  const subject = `Paiement confirmé - Inova Ride #${invoice.invoiceNumber}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  const downloadLink = invoice.pdfUrl
    ? `<p style="text-align:center;margin:20px 0;"><a href="${invoice.pdfUrl}" style="color:${BRAND};">Télécharger votre facture PDF</a></p>`
    : '';

  const body = `
    <p style="color:${MUTED};font-size:14px;">Bonjour <strong style="color:#fff;">${clientName}</strong>,</p>
    <p style="color:${MUTED};font-size:14px;">Votre paiement a été confirmé. Merci pour votre confiance !</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#12121a;border-radius:8px;padding:16px;">
      ${row('Réservation', reservation.reservationNumber)}
      ${row('Facture', invoice.invoiceNumber)}
      ${row('Montant payé', formatCurrency(invoice.totalAmount))}
      ${row('Véhicule', reservation.vehicleName)}
    </table>
    ${downloadLink}`;

  const text = `Paiement confirmé - Inova Ride #${invoice.invoiceNumber}
Bonjour ${clientName},

Réservation: ${reservation.reservationNumber}
Montant: ${formatCurrency(invoice.totalAmount)}
${invoice.pdfUrl ? `Facture: ${invoice.pdfUrl}` : ''}`;

  return { subject, html: layout('Paiement confirmé', body), text };
}

export function cancellationEmail(
  reservation: Pick<ReservationEmailData, 'reservationNumber' | 'vehicleName' | 'totalPrice'>,
  client: ClientEmailData,
  reason?: string,
): { subject: string; html: string; text: string } {
  const subject = 'Annulation de réservation - Inova Ride';
  const clientName = `${client.firstName} ${client.lastName}`;

  const body = `
    <p style="color:${MUTED};font-size:14px;">Bonjour <strong style="color:#fff;">${clientName}</strong>,</p>
    <p style="color:${MUTED};font-size:14px;">Votre réservation <strong style="color:#fff;">#${reservation.reservationNumber}</strong> a été annulée.</p>
    ${reason ? `<p style="color:${MUTED};font-size:14px;">Motif : ${reason}</p>` : ''}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#12121a;border-radius:8px;padding:16px;">
      ${row('Véhicule', reservation.vehicleName)}
      ${row('Montant', formatCurrency(reservation.totalPrice))}
    </table>
    <p style="color:${MUTED};font-size:13px;">Si un paiement avait été effectué, un remboursement sera traité sous 5 à 10 jours ouvrables.</p>`;

  const text = `Annulation de réservation Inova Ride
Bonjour ${clientName},

Réservation #${reservation.reservationNumber} annulée.
${reason ? `Motif: ${reason}` : ''}
Remboursement sous 5-10 jours si applicable.`;

  return { subject, html: layout('Réservation annulée', body), text };
}

export function invoiceEmail(
  invoice: InvoiceEmailData,
  client: ClientEmailData,
): { subject: string; html: string; text: string } {
  const subject = `Facture ${invoice.invoiceNumber} — Inova Ride`;
  const clientName = `${client.firstName} ${client.lastName}`;

  const body = `
    <p style="color:${MUTED};font-size:14px;">Bonjour <strong style="color:#fff;">${clientName}</strong>,</p>
    <p style="color:${MUTED};font-size:14px;">Veuillez trouver ci-joint votre facture.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#12121a;border-radius:8px;padding:16px;">
      ${row('N° Facture', invoice.invoiceNumber)}
      ${row('Montant', formatCurrency(invoice.totalAmount))}
    </table>`;

  const text = `Facture ${invoice.invoiceNumber} — Inova Ride
Bonjour ${clientName},
Montant: ${formatCurrency(invoice.totalAmount)}`;

  return { subject, html: layout('Votre facture', body), text };
}

export function paymentFailureEmail(
  reservation: Pick<ReservationEmailData, 'reservationNumber' | 'totalPrice'>,
  client: ClientEmailData,
): { subject: string; html: string; text: string } {
  const subject = 'Échec du paiement - Inova Ride';
  const clientName = `${client.firstName} ${client.lastName}`;

  const body = `
    <p style="color:${MUTED};font-size:14px;">Bonjour <strong style="color:#fff;">${clientName}</strong>,</p>
    <p style="color:${MUTED};font-size:14px;">Le paiement pour la réservation <strong style="color:#fff;">#${reservation.reservationNumber}</strong> n'a pas abouti ou a expiré.</p>
    <p style="color:${MUTED};font-size:14px;">Montant : ${formatCurrency(reservation.totalPrice)}</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/booking" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;">Réessayer le paiement</a>
    </p>`;

  const text = `Échec du paiement - Inova Ride
Bonjour ${clientName},
Réservation #${reservation.reservationNumber} — paiement non confirmé.
Réessayez sur notre site.`;

  return { subject, html: layout('Paiement non confirmé', body), text };
}
