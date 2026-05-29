import { v4 as uuidv4 } from 'uuid';

import Counter from '../models/Counter';
import type { SequentialIdPrefix } from '../types/models';

/**
 * Atomically generates sequential IDs: RES-2026-0042, CTR-2026-0001, INV-2026-0010
 * Uses a Counter collection to avoid race conditions from count().
 */
export async function generateSequentialId(prefix: SequentialIdPrefix): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `${prefix}-${year}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const sequence = String(counter?.seq ?? 1).padStart(4, '0');
  return `${prefix}-${year}-${sequence}`;
}

/** @deprecated Use generateSequentialId */
export async function generateReferenceId(prefix: SequentialIdPrefix): Promise<string> {
  return generateSequentialId(prefix);
}

export function generateUuid(): string {
  return uuidv4();
}
