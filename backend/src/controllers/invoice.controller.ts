import type { Request, Response } from 'express';

import * as invoiceService from '../services/invoice.service';
import { catchAsync } from '../utils/catchAsync';
import { readStoredPdf } from '../utils/pdfUpload';

export const getInvoices = catchAsync(async (req: Request, res: Response) => {
  const result = await invoiceService.listInvoices(req.query as Record<string, string | undefined>);

  res.status(200).json({
    status: 'success',
    results: result.results,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: { invoices: result.invoices },
  });
});

export const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { invoice },
  });
});

export const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.createManualInvoice(req.body);

  res.status(201).json({
    status: 'success',
    data: { invoice },
  });
});

export const updateInvoiceStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body as { status: 'draft' | 'sent' | 'paid' | 'void' };
  const invoice = await invoiceService.updateInvoiceStatus(req.params.id, status);

  res.status(200).json({
    status: 'success',
    data: { invoice },
  });
});

export const generateInvoicePdf = catchAsync(async (req: Request, res: Response) => {
  const { invoice } = await invoiceService.ensureInvoicePdf(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { pdfUrl: invoice.pdfUrl },
  });
});

export const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);

  if (invoice.pdfUrl?.startsWith('http')) {
    res.redirect(302, invoice.pdfUrl);
    return;
  }

  let buffer: Buffer;
  if (invoice.pdfUrl) {
    const stored = await readStoredPdf(invoice.pdfUrl);
    buffer = stored ?? (await invoiceService.ensureInvoicePdf(req.params.id)).buffer;
  } else {
    buffer = (await invoiceService.ensureInvoicePdf(req.params.id)).buffer;
  }

  const filename = `${invoice.invoiceNumber}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});
