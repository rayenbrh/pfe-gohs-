import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from 'pdf-lib';

import type { IInvoice, IReservation } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

const TERMS_FR = `1. Le locataire s'engage à restituer le véhicule dans l'état où il l'a reçu.
2. Toute dégradation ou dommage sera facturé au locataire.
3. Le véhicule ne doit pas être utilisé à des fins illégales.
4. Le locataire doit posséder un permis de conduire valide.
5. En cas de retard de restitution, des frais supplémentaires s'appliqueront.
6. Le dépôt de garantie sera restitué après inspection du véhicule.
7. Le carburant doit être restitué au même niveau qu'au départ.
8. L'assurance incluse couvre la responsabilité civile conformément à la loi tunisienne.
9. Le locataire est responsable des contraventions et infractions durant la location.
10. Inova Ride se réserve le droit de résilier le contrat en cas de violation des conditions.`;

type PopulatedReservation = IReservation & {
  reservationNumber: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    category: string;
  };
  client: {
    firstName: string;
    lastName: string;
    idType: string;
    idNumber: string;
    phone: string;
    address?: string;
  };
  agent?: { name: string };
};

type PopulatedInvoice = IInvoice & {
  invoiceNumber: string;
  client: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    address?: string;
  };
  reservation?: { reservationNumber: string };
};

function drawLine(page: PDFPage, y: number, width = 495) {
  page.drawLine({
    start: { x: 50, y },
    end: { x: 50 + width, y },
    thickness: 0.5,
    color: rgb(0.75, 0.75, 0.75),
  });
}

function drawSectionTitle(page: PDFPage, font: PDFFont, title: string, y: number): number {
  page.drawText(title, { x: 50, y, size: 11, font, color: rgb(0.2, 0.1, 0.4) });
  drawLine(page, y - 6);
  return y - 22;
}

function drawRow(page: PDFPage, font: PDFFont, label: string, value: string, y: number): number {
  page.drawText(`${label}:`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(value, { x: 200, y, size: 10, font });
  return y - 16;
}

export async function generateContractPDF(reservation: PopulatedReservation): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  let y = height - 50;

  page.drawText('INova RIDE', { x: 50, y, size: 24, font: bold, color: rgb(0.45, 0.2, 0.85) });
  page.drawText('Premium Car Rental', { x: 50, y: y - 18, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
  y -= 50;

  page.drawText('CONTRAT DE LOCATION / RENTAL AGREEMENT', {
    x: 50,
    y,
    size: 14,
    font: bold,
  });
  y -= 28;

  const contractDate = formatDate(new Date());
  y = drawRow(page, font, 'N° Contrat', reservation.reservationNumber.replace('RES', 'CTR'), y);
  y = drawRow(page, font, 'Référence réservation', reservation.reservationNumber, y);
  y = drawRow(page, font, 'Date', contractDate, y);
  y -= 10;

  y = drawSectionTitle(page, bold, 'VÉHICULE / VEHICLE', y);
  y = drawRow(
    page,
    font,
    'Véhicule',
    `${reservation.vehicle.brand} ${reservation.vehicle.model} (${reservation.vehicle.year})`,
    y,
  );
  y = drawRow(page, font, 'Immatriculation', reservation.vehicle.licensePlate, y);
  y = drawRow(page, font, 'Catégorie', reservation.vehicle.category, y);
  y -= 10;

  y = drawSectionTitle(page, bold, 'LOCATAIRE / CLIENT', y);
  y = drawRow(
    page,
    font,
    'Nom',
    `${reservation.client.firstName} ${reservation.client.lastName}`,
    y,
  );
  y = drawRow(page, font, 'Pièce d\'identité', `${reservation.client.idType.toUpperCase()} — ${reservation.client.idNumber}`, y);
  y = drawRow(page, font, 'Téléphone', reservation.client.phone, y);
  if (reservation.client.address) {
    y = drawRow(page, font, 'Adresse', reservation.client.address, y);
  }
  y -= 10;

  y = drawSectionTitle(page, bold, 'CONDITIONS DE LOCATION / RENTAL TERMS', y);
  y = drawRow(page, font, 'Date début', formatDate(reservation.startDate), y);
  y = drawRow(page, font, 'Date fin', formatDate(reservation.endDate), y);
  y = drawRow(page, font, 'Prise en charge', reservation.pickupLocation, y);
  y = drawRow(page, font, 'Restitution', reservation.returnLocation, y);
  y = drawRow(page, font, 'Durée', `${reservation.totalDays} jour(s)`, y);
  y = drawRow(page, font, 'Tarif journalier', formatCurrency(reservation.pricePerDay), y);
  y -= 10;

  y = drawSectionTitle(page, bold, 'RÉCAPITULATIF FINANCIER / FINANCIAL SUMMARY', y);
  y = drawRow(page, font, 'Tarif / jour', formatCurrency(reservation.pricePerDay), y);
  y = drawRow(page, font, 'Nombre de jours', String(reservation.totalDays), y);
  y = drawRow(page, font, 'Montant total', formatCurrency(reservation.totalPrice), y);
  if (reservation.depositAmount) {
    y = drawRow(page, font, 'Dépôt de garantie', formatCurrency(reservation.depositAmount), y);
  }
  y -= 10;

  y = drawSectionTitle(page, bold, 'CONDITIONS GÉNÉRALES / TERMS & CONDITIONS', y);
  const termLines = TERMS_FR.split('\n');
  for (const line of termLines) {
    if (y < 120) break;
    page.drawText(line, { x: 50, y, size: 8, font });
    y -= 12;
  }

  y = 100;
  page.drawText('Signature Client:', { x: 50, y, size: 10, font: bold });
  page.drawLine({ start: { x: 50, y: y - 30 }, end: { x: 250, y: y - 30 }, thickness: 0.5 });
  page.drawText('Signature Agent:', { x: 300, y, size: 10, font: bold });
  page.drawLine({ start: { x: 300, y: y - 30 }, end: { x: 500, y: y - 30 }, thickness: 0.5 });
  if (reservation.agent?.name) {
    page.drawText(reservation.agent.name, { x: 300, y: y - 45, size: 9, font });
  }

  page.drawText('Inova Ride | Tunis, Tunisia | www.inovaride.com', {
    x: 50,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return Buffer.from(await doc.save());
}

export async function generateInvoicePDF(invoice: PopulatedInvoice): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;

  page.drawText('INova RIDE', { x: 50, y, size: 22, font: bold, color: rgb(0.45, 0.2, 0.85) });
  y -= 30;
  page.drawText('FACTURE / INVOICE', { x: 50, y, size: 16, font: bold });
  y -= 24;

  y = drawRow(page, font, 'N° Facture', invoice.invoiceNumber, y);
  y = drawRow(page, font, 'Date d\'émission', formatDate(invoice.issuedAt), y);
  if (invoice.reservation?.reservationNumber) {
    y = drawRow(page, font, 'Réservation', invoice.reservation.reservationNumber, y);
  }

  const statusColors: Record<string, ReturnType<typeof rgb>> = {
    draft: rgb(0.6, 0.6, 0.6),
    sent: rgb(0.2, 0.4, 0.9),
    paid: rgb(0.1, 0.6, 0.3),
    void: rgb(0.8, 0.2, 0.2),
  };
  page.drawText(`[ ${invoice.status.toUpperCase()} ]`, {
    x: 450,
    y: 760,
    size: 10,
    font: bold,
    color: statusColors[invoice.status] ?? rgb(0, 0, 0),
  });

  y -= 10;
  y = drawSectionTitle(page, bold, 'FACTURÉ À / BILL TO', y);
  y = drawRow(
    page,
    font,
    'Client',
    `${invoice.client.firstName} ${invoice.client.lastName}`,
    y,
  );
  y = drawRow(page, font, 'Téléphone', invoice.client.phone, y);
  if (invoice.client.address) y = drawRow(page, font, 'Adresse', invoice.client.address, y);
  y -= 10;

  y = drawSectionTitle(page, bold, 'DÉTAIL / LINE ITEMS', y);
  page.drawText('Description', { x: 50, y, size: 9, font: bold });
  page.drawText('Qté', { x: 320, y, size: 9, font: bold });
  page.drawText('P.U.', { x: 370, y, size: 9, font: bold });
  page.drawText('Total', { x: 460, y, size: 9, font: bold });
  y -= 14;
  drawLine(page, y);

  for (const item of invoice.lineItems) {
    y -= 16;
    page.drawText(item.description.slice(0, 45), { x: 50, y, size: 9, font });
    page.drawText(String(item.quantity), { x: 320, y, size: 9, font });
    page.drawText(formatCurrency(item.unitPrice), { x: 370, y, size: 9, font });
    page.drawText(formatCurrency(item.total), { x: 460, y, size: 9, font });
  }

  y -= 30;
  drawLine(page, y);
  y -= 20;
  page.drawText(`Sous-total: ${formatCurrency(invoice.subtotal)}`, { x: 350, y, size: 10, font });
  y -= 16;
  page.drawText(
    `TVA (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}`,
    { x: 350, y, size: 10, font },
  );
  y -= 16;
  if (invoice.discountAmount > 0) {
    page.drawText(`Remise: -${formatCurrency(invoice.discountAmount)}`, { x: 350, y, size: 10, font });
    y -= 16;
  }
  page.drawText(`TOTAL: ${formatCurrency(invoice.totalAmount)}`, {
    x: 350,
    y,
    size: 12,
    font: bold,
    color: rgb(0.2, 0.1, 0.4),
  });

  page.drawText('Inova Ride | Tunis, Tunisia | www.inovaride.com', {
    x: 50,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return Buffer.from(await doc.save());
}

/** @deprecated Use generateContractPDF */
export class PdfService {
  static generateContract = generateContractPDF;
  static generateInvoice = generateInvoicePDF;
}
