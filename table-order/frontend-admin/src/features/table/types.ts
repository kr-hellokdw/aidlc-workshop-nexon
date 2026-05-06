import { OrderSummary } from '@/common/types';

export interface TableInfo {
  tableId: number;
  tableNumber: number;
  sessionStatus: 'ACTIVE' | 'EMPTY';
  createdAt: string;
}

export interface TableCreateRequest {
  tableNumber: number;
  password: string;
}

export interface TableUpdateRequest {
  tableNumber?: number;
  password?: string;
}

export interface OrderHistorySession {
  sessionId: number;
  startedAt: string;
  completedAt: string;
  orders: OrderSummary[];
  sessionTotal: number;
}
