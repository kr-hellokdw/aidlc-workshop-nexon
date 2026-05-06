import { apiClient } from '@/common/api/apiClient';
import { ApiResponse, OrderStatus } from '@/common/types';
import { TableDashboardItem } from '../types';

interface BackendTableItem {
  tableId: number;
  tableNumber: number;
  hasActiveSession: boolean;
  totalAmount: number;
  orders: {
    orderId: number;
    orderNumber: number | string;
    status: string;
    totalAmount: number;
    orderedAt: string;
  }[];
}

function mapBackendToFrontend(item: BackendTableItem): TableDashboardItem {
  return {
    tableId: item.tableId,
    tableNumber: item.tableNumber,
    sessionStatus: item.hasActiveSession ? 'ACTIVE' : 'EMPTY',
    hasActiveSession: item.hasActiveSession,
    totalAmount: item.totalAmount || 0,
    orders: (item.orders || []).map((o) => ({
      orderId: o.orderId,
      orderNumber: String(o.orderNumber),
      items: [],
      totalAmount: o.totalAmount,
      status: o.status as OrderStatus,
      createdAt: o.orderedAt || '',
    })),
  };
}

export const dashboardApi = {
  getDashboard: async (): Promise<TableDashboardItem[]> => {
    const { data } = await apiClient.get<ApiResponse<{ tables: BackendTableItem[] }>>(
      '/api/admin/tables/dashboard',
    );
    return data.data.tables.map(mapBackendToFrontend);
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<void> => {
    await apiClient.put(`/api/admin/orders/${orderId}/status`, { status });
  },

  deleteOrder: async (orderId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/orders/${orderId}`);
  },

  completeSession: async (tableId: number): Promise<void> => {
    await apiClient.post(`/api/admin/tables/${tableId}/complete-session`);
  },
};
