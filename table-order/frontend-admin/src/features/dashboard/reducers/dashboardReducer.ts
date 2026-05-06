import { DashboardState, DashboardAction } from '../types';
import { OrderStatus } from '@/common/types';

export const initialDashboardState: DashboardState = {
  tables: [],
  loading: false,
  error: null,
  sseConnected: false,
};

export const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };

    case 'LOAD_SUCCESS':
      return { ...state, tables: action.payload, loading: false, error: null };

    case 'LOAD_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'NEW_ORDER': {
      const { tableId, order } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.tableId === tableId
            ? {
                ...t,
                orders: [...t.orders, order],
                totalAmount: t.totalAmount + order.totalAmount,
                sessionStatus: 'ACTIVE' as const,
                isHighlighted: true,
              }
            : t,
        ),
      };
    }

    case 'ORDER_STATUS_CHANGED': {
      const { tableId, orderId, newStatus } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.tableId === tableId
            ? {
                ...t,
                orders: t.orders.map((o) =>
                  o.orderId === orderId ? { ...o, status: newStatus as OrderStatus } : o,
                ),
              }
            : t,
        ),
      };
    }

    case 'ORDER_DELETED': {
      const { tableId, orderId, newTableTotal } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.tableId === tableId
            ? {
                ...t,
                orders: t.orders.filter((o) => o.orderId !== orderId),
                totalAmount: newTableTotal,
              }
            : t,
        ),
      };
    }

    case 'SESSION_COMPLETED': {
      const { tableId } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.tableId === tableId
            ? { ...t, sessionStatus: 'EMPTY' as const, orders: [], totalAmount: 0 }
            : t,
        ),
      };
    }

    case 'CLEAR_HIGHLIGHT': {
      const { tableId } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.tableId === tableId ? { ...t, isHighlighted: false } : t,
        ),
      };
    }

    case 'SSE_CONNECTED':
      return { ...state, sseConnected: true };

    case 'SSE_DISCONNECTED':
      return { ...state, sseConnected: false };

    case 'OPTIMISTIC_STATUS_CHANGE': {
      const { orderId, newStatus } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) => ({
          ...t,
          orders: t.orders.map((o) =>
            o.orderId === orderId ? { ...o, status: newStatus as OrderStatus } : o,
          ),
        })),
      };
    }

    case 'ROLLBACK':
      return { ...state, tables: action.payload };

    default:
      return state;
  }
};
