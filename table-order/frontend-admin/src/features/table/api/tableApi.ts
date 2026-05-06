import { apiClient } from '@/common/api/apiClient';
import { ApiResponse } from '@/common/types';
import { TableInfo, TableCreateRequest, TableUpdateRequest, OrderHistorySession } from '../types';

interface BackendTableResponse {
  id: number;
  tableNumber: number;
  storeId: number;
}

function mapTable(t: BackendTableResponse): TableInfo {
  return {
    tableId: t.id,
    tableNumber: t.tableNumber,
    sessionStatus: 'EMPTY',
    createdAt: '',
  };
}

export const tableApi = {
  getTables: async (): Promise<TableInfo[]> => {
    const { data } = await apiClient.get<ApiResponse<BackendTableResponse[]>>('/api/admin/tables');
    return data.data.map(mapTable);
  },

  createTable: async (request: TableCreateRequest): Promise<TableInfo> => {
    const { data } = await apiClient.post<ApiResponse<BackendTableResponse>>('/api/admin/tables', request);
    return mapTable(data.data);
  },

  updateTable: async (tableId: number, request: TableUpdateRequest): Promise<TableInfo> => {
    const { data } = await apiClient.put<ApiResponse<BackendTableResponse>>(
      `/api/admin/tables/${tableId}`,
      request,
    );
    return mapTable(data.data);
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
