// Global Type Definitions
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
}
