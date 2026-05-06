import { http, HttpResponse } from 'msw';
import { mockTables } from '../data';

let tables = [...mockTables];
let nextId = tables.length + 1;

export const tableHandlers = [
  http.get('/api/admin/tables', () => {
    return HttpResponse.json({
      success: true,
      data: tables,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post('/api/admin/tables', async ({ request }) => {
    const body = (await request.json()) as { tableNumber: number; password: string };
    const newTable = {
      tableId: nextId++,
      tableNumber: body.tableNumber,
      sessionStatus: 'EMPTY' as const,
      createdAt: new Date().toISOString(),
    };
    tables.push(newTable);
    return HttpResponse.json({
      success: true,
      data: newTable,
      timestamp: new Date().toISOString(),
    });
  }),

  http.put('/api/admin/tables/:tableId', async ({ params, request }) => {
    const tableId = Number(params.tableId);
    const body = (await request.json()) as { tableNumber?: number; password?: string };
    tables = tables.map((t) =>
      t.tableId === tableId ? { ...t, ...body } : t,
    );
    const updated = tables.find((t) => t.tableId === tableId);
    return HttpResponse.json({
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete('/api/admin/tables/:tableId', ({ params }) => {
    const tableId = Number(params.tableId);
    tables = tables.filter((t) => t.tableId !== tableId);
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  http.get('/api/admin/tables/:tableId/history', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          sessionId: 1,
          startedAt: '2026-05-05T09:00:00',
          completedAt: '2026-05-05T12:30:00',
          orders: [
            {
              orderId: 201,
              orderNumber: '001',
              items: [{ menuName: '김치찌개', quantity: 2, price: 9000 }],
              totalAmount: 18000,
              status: 'COMPLETED',
              createdAt: '2026-05-05T09:15:00',
            },
          ],
          sessionTotal: 18000,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }),
];
