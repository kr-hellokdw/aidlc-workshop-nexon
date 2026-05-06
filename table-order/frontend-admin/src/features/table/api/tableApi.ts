import { apiClient } from '@/common/api/apiClient';
import { ApiResponse } from '@/common/types';
import { TableInfo, TableCreateRequest, TableUpdateRequest, OrderHistorySession } from '../types';

export const tableApi = {
  getTables: async (): Promise<TableInfo[]> => {
    const { data } = await apiClient.get<ApiResponse<TableInfo[]>>('/api/admin/tables');
    return data.data;
  },

  createTable: async (request: TableCreateRequest): Promise<TableInfo> => {
    const { data } = await apiClient.post<ApiResponse<TableInfo>>('/api/admin/tables', request);
    return data.data;
  },

  updateTable: async (tableId: number, request: TableUpdateRequest): Promise<TableInfo> => {
    const { data } = await apiClient.put<ApiResponse<TableInfo>>(
      `/api/admin/tables/${tableId}`,
      request,
    );
    return data.data;
  },

  deleteTable: async (tableId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/tables/${tableId}`);
  },

  completeSession: async (tableId: number): Promise<void> => {
    await apiClient.post(`/api/admin/tables/${tableId}/complete-session`);
  },

  getOrderHistory: async (tableId: number, from: string, to: string): Promise<OrderHistorySession[]> => {
    const { data } = await apiClient.get<ApiResponse<OrderHistorySession[]>>(
      `/api/admin/tables/${tableId}/history`,
      { params: { from, to } },
    );
    return data.data;
  },
};
