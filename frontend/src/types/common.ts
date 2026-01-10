export type UUID = string;

export interface BaseResponse<T> {
  data: T;
  message?: string;
  total?: number;
  page?: number;
  size?: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}
