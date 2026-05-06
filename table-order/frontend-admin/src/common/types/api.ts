export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}
