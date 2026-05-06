import { http, HttpResponse } from 'msw';
import { mockCategories, mockMenus, mockOrders, createMockOrder } from './data';

export const handlers = [
  // 테이블 로그인
  http.post('/api/auth/table/login', async ({ request }) => {
    const body = await request.json() as { storeId: number; tableNumber: number; password: string };
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-jwt-token-12345',
        tableId: 1,
        tableNumber: body.tableNumber,
        storeId: body.storeId,
        sessionId: 100,
      },
      error: null,
    });
  }),

  // 카테고리 목록
  http.get('/api/stores/:storeId/categories', () => {
    return HttpResponse.json({
      success: true,
      data: mockCategories,
      error: null,
    });
  }),

  // 메뉴 목록
  http.get('/api/stores/:storeId/menus', () => {
    return HttpResponse.json({
      success: true,
      data: mockMenus,
      error: null,
    });
  }),

  // 주문 생성
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json() as { items: { menuId: number; quantity: number }[] };
    const order = createMockOrder(body.items);
    return HttpResponse.json({
      success: true,
      data: { orderNumber: order.orderNumber, orderId: order.id, totalAmount: order.totalAmount },
      error: null,
    });
  }),

  // 현재 세션 주문 조회
  http.get('/api/orders/current', () => {
    return HttpResponse.json({
      success: true,
      data: mockOrders,
      error: null,
    });
  }),
];
