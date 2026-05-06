import { OrderSummary } from '@/common/types';

export interface TableDashboardItem {
  tableId: number;
  tableNumber: number;
  sessionStatus: 'ACTIVE' | 'EMPTY';
  hasActiveSession?: boolean;
  totalAmount: number;
  orders: OrderSummary[];
  isHighlighted?: boolean;
}

export interface DashboardState {
  tables: TableDashboardItem[];
  loading: boolean;
  error: string | null;
  sseConnected: boolean;
}

export type DashboardAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: TableDashboardItem[] }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'NEW_ORDER'; payload: { tableId: number; tableNumber: number; order: OrderSummary } }
  | { type: 'ORDER_STATUS_CHANGED'; payload: { tableId: number; orderId: number; newStatus: string } }
  | { type: 'ORDER_DELETED'; payload: { tableId: number; orderId: number; newTableTotal: number } }
  | { type: 'SESSION_COMPLETED'; payload: { tableId: number } }
  | { type: 'CLEAR_HIGHLIGHT'; payload: { tableId: number } }
  | { type: 'SSE_CONNECTED' }
  | { type: 'SSE_DISCONNECTED' }
  | { type: 'OPTIMISTIC_STATUS_CHANGE'; payload: { orderId: number; newStatus: string } }
  | { type: 'ROLLBACK'; payload: TableDashboardItem[] };
