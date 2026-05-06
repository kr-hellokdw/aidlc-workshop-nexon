export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  sseUrl: import.meta.env.VITE_SSE_URL || '',
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === 'true',
} as const;
