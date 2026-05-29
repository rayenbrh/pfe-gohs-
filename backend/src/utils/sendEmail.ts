import { sendEmail as sendViaTransporter } from '../config/email';
import logger from '../config/logger';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const info = await sendViaTransporter({
      to: options.to,
      subject: options.subject,
      text: options.text ?? stripHtml(options.html ?? ''),
      html: options.html,
      attachments: options.attachments,
    });

    const messageId =
      typeof info === 'object' && info !== null && 'messageId' in info
        ? String((info as { messageId: string }).messageId)
        : undefined;

    logger.info(`Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`, {
      messageId,
    });

    return { success: true, messageId };
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
    return { success: false };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
