import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('tableAuth');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const stored = localStorage.getItem('tableAuth');
      if (stored) {
        const { storeId, tableNumber, password } = JSON.parse(stored);
        try {
          const res = await axios.post('/api/auth/table/login', {
            storeId,
            tableNumber,
            password,
          });
          const newToken = res.data.data.accessToken;
          const auth = JSON.parse(stored);
          auth.token = newToken;
          localStorage.setItem('tableAuth', JSON.stringify(auth));
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch {
          localStorage.removeItem('tableAuth');
          window.location.href = '/setup';
        }
      } else {
        window.location.href = '/setup';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
