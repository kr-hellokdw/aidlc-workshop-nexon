import { apiClient } from '@/common/api/apiClient';
import { LoginRequest, LoginResponse } from '../types';
import { ApiResponse } from '@/common/types';

export const authApi = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      role: string;
      storeId: number;
    }>>(
      '/api/auth/admin/login',
      {
        storeId: Number(request.storeId),
        username: request.username,
        password: request.password,
      },
    );
    return {
      token: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      storeInfo: {
        storeId: data.data.storeId,
        storeName: `매장 ${data.data.storeId}`,
        username: request.username,
      },
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<{ token: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      '/api/auth/refresh',
      { refreshToken },
    );
    return { token: data.data.accessToken };
  },
};
