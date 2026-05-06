import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/api/auth/admin/login', async ({ request }) => {
    const body = (await request.json()) as { storeId: string; username: string; password: string };

    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          storeInfo: {
            storeId: Number(body.storeId) || 1,
            storeName: '테스트 매장',
            username: body.username,
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: { code: 'AUTH_FAILED', message: '아이디 또는 비밀번호가 올바르지 않습니다' },
        timestamp: new Date().toISOString(),
      },
      { status: 401 },
    );
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true, data: null, timestamp: new Date().toISOString() });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: { token: 'mock-refreshed-token' },
      timestamp: new Date().toISOString(),
    });
  }),
];
