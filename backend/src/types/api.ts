import type { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export type ApiResponse<T> = Response<ApiSuccessResponse<T> | ApiErrorResponse>;

export interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  [key: string]: string | undefined;
}
