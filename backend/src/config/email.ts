import nodemailer from 'nodemailer';

import logger from './logger';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP credentials not set — email features disabled');
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<{ messageId?: string }> {
  const fromName = process.env.EMAIL_FROM_NAME ?? 'Inova Ride';
  const fromEmail = process.env.EMAIL_FROM ?? 'noreply@inovaride.com';

  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType ?? 'application/pdf',
    })),
  });

  return { messageId: info.messageId };
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await getTransporter().verify();
    logger.info('SMTP connection verified');
    return true;
  } catch {
    logger.warn('SMTP verification failed');
    return false;
  }
}
