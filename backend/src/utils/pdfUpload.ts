import { Readable } from 'stream';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { AppError } from './AppError';

export async function uploadPdfBuffer(
  buffer: Buffer,
  folder: 'contracts' | 'invoices',
  filename: string,
): Promise<string> {
  if (isCloudinaryConfigured()) {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'raw',
          public_id: filename.replace(/\.pdf$/i, ''),
          format: 'pdf',
        },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error ?? new Error('PDF upload failed'));
          else resolve(uploadResult as { secure_url: string });
        },
      );
      Readable.from(buffer).pipe(stream);
    });
    return result.secure_url;
  }

  const dir = join(process.cwd(), 'uploads', folder);
  await mkdir(dir, { recursive: true });
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  await writeFile(join(dir, safeName), buffer);
  return `/uploads/${folder}/${safeName}`;
}

export async function readStoredPdf(pdfUrl: string): Promise<Buffer | null> {
  if (pdfUrl.startsWith('/uploads/')) {
    const { readFile } = await import('fs/promises');
    const filePath = join(process.cwd(), pdfUrl.replace(/^\//, ''));
    try {
      return await readFile(filePath);
    } catch {
      return null;
    }
  }
  if (pdfUrl.startsWith('http')) {
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new AppError('Failed to fetch PDF', 502, 'PDF_FETCH_FAILED');
    return Buffer.from(await res.arrayBuffer());
  }
  return null;
}
