import type { Query } from 'mongoose';

import { AppError } from './AppError';

const RESERVED_QUERY_FIELDS = ['page', 'limit', 'sort', 'fields'];

function assertSafeQueryKeys(queryObj: Record<string, unknown>): void {
  for (const key of Object.keys(queryObj)) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new AppError('Invalid query parameter', 400, 'INVALID_QUERY');
    }
  }
}

export interface PaginationMeta {
  skip: number;
  limit: number;
  totalCountPromise: Promise<number>;
}

export class APIFeatures<T> {
  query: Query<T[], T>;
  private queryString: Record<string, string | undefined>;
  paginationResult?: PaginationMeta;

  constructor(query: Query<T[], T>, queryString: Record<string, string | undefined>) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const queryObj = { ...this.queryString };
    RESERVED_QUERY_FIELDS.forEach((field) => delete queryObj[field]);

    assertSafeQueryKeys(queryObj as Record<string, unknown>);

    const parsed = JSON.parse(
      JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt|ne|in)\b/g, (m: string) => `$${m}`),
    );

    this.query = this.query.find(parsed);
    return this;
  }

  sort(): this {
    const sortBy = this.queryString.sort;
    if (sortBy) {
      this.query = this.query.sort(sortBy.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields(): this {
    const fields = this.queryString.fields;
    if (fields) {
      this.query = this.query.select(fields.split(',').join(' '));
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate(): this {
    const page = Math.max(1, parseInt(String(this.queryString.page ?? '1'), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(this.queryString.limit ?? '20'), 10) || 20),
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.paginationResult = {
      skip,
      limit,
      totalCountPromise: this.query.model.countDocuments(this.query.getFilter()),
    };

    return this;
  }
}

/** @deprecated Use APIFeatures class — kept for existing controllers */
export const ApiFeatures = APIFeatures;

export async function paginateQuery<T>(
  query: Query<T[], T>,
  page = 1,
  limit = 20,
): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    query.clone().skip(skip).limit(safeLimit).exec(),
    query.model.countDocuments(query.getFilter()),
  ]);

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}
