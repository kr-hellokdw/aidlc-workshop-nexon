import { http, HttpResponse } from 'msw';
import { mockDashboardData } from '../data';

export const dashboardHandlers = [
  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: { tables: mockDashboardData },
      timestamp: new Date().toISOString(),
    });
  }),

  http.put('/api/admin/orders/:orderId/status', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete('/api/admin/orders/:orderId', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post('/api/admin/tables/:tableId/complete-session', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),
];
