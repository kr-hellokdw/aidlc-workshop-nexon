import { apiClient } from '@/common/api/apiClient';
import { LoginRequest, LoginResponse } from '../types';
import { ApiResponse } from '@/common/types';

export const authApi = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/admin/login',
      request,
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<{ token: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ token: string }>>(
      '/api/auth/refresh',
      { refreshToken },
    );
    return data.data;
  },
};
