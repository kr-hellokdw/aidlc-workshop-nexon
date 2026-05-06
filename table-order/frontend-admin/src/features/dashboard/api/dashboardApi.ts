import { apiClient } from '@/common/api/apiClient';
import { ApiResponse, OrderStatus } from '@/common/types';
import { TableDashboardItem } from '../types';

export const dashboardApi = {
  getDashboard: async (): Promise<TableDashboardItem[]> => {
    const { data } = await apiClient.get<ApiResponse<{ tables: TableDashboardItem[] }>>(
      '/api/admin/dashboard',
    );
    return data.data.tables;
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
