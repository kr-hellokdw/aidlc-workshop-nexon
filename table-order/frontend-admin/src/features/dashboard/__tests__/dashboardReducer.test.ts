import { describe, it, expect } from 'vitest';
import { dashboardReducer, initialDashboardState } from '../reducers/dashboardReducer';
import { DashboardState, TableDashboardItem } from '../types';
import { OrderStatus } from '@/common/types';

const mockTable: TableDashboardItem = {
  tableId: 1,
  tableNumber: 1,
  sessionStatus: 'ACTIVE',
  totalAmount: 20000,
  orders: [
    {
      orderId: 101,
      orderNumber: '001',
      items: [{ menuName: '김치찌개', quantity: 2, price: 9000 }],
      totalAmount: 18000,
      status: 'PENDING' as OrderStatus,
      createdAt: '2026-05-06T12:30:00',
    },
  ],
};

const stateWithTable: DashboardState = {
  tables: [mockTable, { tableId: 2, tableNumber: 2, sessionStatus: 'EMPTY', totalAmount: 0, orders: [] }],
  loading: false,
  error: null,
  sseConnected: true,
};

describe('dashboardReducer', () => {
  it('LOAD_START 시 loading을 true로 설정한다', () => {
    const result = dashboardReducer(initialDashboardState, { type: 'LOAD_START' });
    expect(result.loading).toBe(true);
  });

  it('LOAD_SUCCESS 시 테이블 데이터를 설정한다', () => {
    const tables = [mockTable];
    const result = dashboardReducer(initialDashboardState, { type: 'LOAD_SUCCESS', payload: tables });
    expect(result.tables).toEqual(tables);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('LOAD_FAILURE 시 에러를 설정한다', () => {
    const result = dashboardReducer(initialDashboardState, { type: 'LOAD_FAILURE', payload: '서버 오류' });
    expect(result.error).toBe('서버 오류');
    expect(result.loading).toBe(false);
  });

  it('NEW_ORDER 시 해당 테이블에 주문을 추가하고 하이라이트한다', () => {
    const newOrder = {
      orderId: 102,
      orderNumber: '002',
      items: [{ menuName: '콜라', quantity: 1, price: 2000 }],
      totalAmount: 2000,
      status: 'PENDING' as OrderStatus,
      createdAt: '2026-05-06T12:45:00',
    };

    const result = dashboardReducer(stateWithTable, {
      type: 'NEW_ORDER',
      payload: { tableId: 1, tableNumber: 1, order: newOrder },
    });

    const table1 = result.tables.find((t) => t.tableId === 1)!;
    expect(table1.orders).toHaveLength(2);
    expect(table1.totalAmount).toBe(22000);
    expect(table1.isHighlighted).toBe(true);
    expect(table1.sessionStatus).toBe('ACTIVE');
  });

  it('ORDER_STATUS_CHANGED 시 해당 주문의 상태를 변경한다', () => {
    const result = dashboardReducer(stateWithTable, {
      type: 'ORDER_STATUS_CHANGED',
      payload: { tableId: 1, orderId: 101, newStatus: 'PREPARING' },
    });

    const table1 = result.tables.find((t) => t.tableId === 1)!;
    expect(table1.orders[0].status).toBe('PREPARING');
  });

  it('ORDER_DELETED 시 해당 주문을 제거하고 총액을 업데이트한다', () => {
    const result = dashboardReducer(stateWithTable, {
      type: 'ORDER_DELETED',
      payload: { tableId: 1, orderId: 101, newTableTotal: 0 },
    });

    const table1 = result.tables.find((t) => t.tableId === 1)!;
    expect(table1.orders).toHaveLength(0);
    expect(table1.totalAmount).toBe(0);
  });

  it('SESSION_COMPLETED 시 해당 테이블을 리셋한다', () => {
    const result = dashboardReducer(stateWithTable, {
      type: 'SESSION_COMPLETED',
      payload: { tableId: 1 },
    });

    const table1 = result.tables.find((t) => t.tableId === 1)!;
    expect(table1.sessionStatus).toBe('EMPTY');
    expect(table1.orders).toHaveLength(0);
    expect(table1.totalAmount).toBe(0);
  });

  it('CLEAR_HIGHLIGHT 시 하이라이트를 제거한다', () => {
    const highlighted: DashboardState = {
      ...stateWithTable,
      tables: stateWithTable.tables.map((t) =>
        t.tableId === 1 ? { ...t, isHighlighted: true } : t,
      ),
    };

    const result = dashboardReducer(highlighted, { type: 'CLEAR_HIGHLIGHT', payload: { tableId: 1 } });
    const table1 = result.tables.find((t) => t.tableId === 1)!;
    expect(table1.isHighlighted).toBe(false);
  });

  it('SSE_CONNECTED 시 연결 상태를 true로 설정한다', () => {
    const result = dashboardReducer(initialDashboardState, { type: 'SSE_CONNECTED' });
    expect(result.sseConnected).toBe(true);
  });

  it('SSE_DISCONNECTED 시 연결 상태를 false로 설정한다', () => {
    const result = dashboardReducer(stateWithTable, { type: 'SSE_DISCONNECTED' });
    expect(result.sseConnected).toBe(false);
  });

  it('ROLLBACK 시 이전 테이블 상태로 복원한다', () => {
    const previousTables = [mockTable];
    const result = dashboardReducer(stateWithTable, { type: 'ROLLBACK', payload: previousTables });
    expect(result.tables).toEqual(previousTables);
  });
});
