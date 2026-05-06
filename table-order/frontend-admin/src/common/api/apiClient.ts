import axios from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: 토큰 자동 첨부
apiClient.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

// Response 인터셉터: 401 시 토큰 갱신
let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인/리프레시 요청 자체가 실패한 경우는 그냥 에러 전파
    if (originalRequest.url?.includes('/api/auth/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${config.apiUrl}/api/auth/refresh`, {
          refreshToken,
        });

        const newToken = data.data.accessToken || data.data.token;
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('storeInfo');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient };
