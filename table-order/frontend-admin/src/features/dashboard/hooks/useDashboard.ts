import { useReducer, useEffect, useCallback, useRef } from 'react';
import { dashboardReducer, initialDashboardState } from '../reducers/dashboardReducer';
import { dashboardApi } from '../api/dashboardApi';
import { useSSE } from './useSSE';
import { useToast } from '@/common/components/Toast';
import { OrderStatus } from '@/common/types';
import { TableDashboardItem } from '../types';

export const useDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
  const toast = useToast();
  const tablesRef = useRef<TableDashboardItem[]>([]);

  // SSE 연결
  useSSE(dispatch);

  // 테이블 참조 업데이트 (롤백용)
  useEffect(() => {
    tablesRef.current = state.tables;
  }, [state.tables]);

  // 초기 데이터 로드
  const loadDashboard = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const tables = await dashboardApi.getDashboard();
      dispatch({ type: 'LOAD_SUCCESS', payload: tables });
    } catch {
      dispatch({ type: 'LOAD_FAILURE', payload: '대시보드 데이터를 불러올 수 없습니다' });
      toast.error('대시보드 데이터를 불러올 수 없습니다');
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // 하이라이트 자동 제거 (2초)
  useEffect(() => {
    const highlighted = state.tables.filter((t) => t.isHighlighted);
    if (highlighted.length === 0) return;

    const timers = highlighted.map((t) =>
      setTimeout(() => dispatch({ type: 'CLEAR_HIGHLIGHT', payload: { tableId: t.tableId } }), 2000),
    );

    return () => timers.forEach(clearTimeout);
  }, [state.tables]);

  // 주문 상태 변경 (낙관적 업데이트)
  const updateOrderStatus = useCallback(
    async (orderId: number, newStatus: OrderStatus) => {
      const previousTables = tablesRef.current;
      dispatch({ type: 'OPTIMISTIC_STATUS_CHANGE', payload: { orderId, newStatus } });

      try {
        await dashboardApi.updateOrderStatus(orderId, newStatus);
        toast.success('주문 상태가 변경되었습니다');
      } catch {
        dispatch({ type: 'ROLLBACK', payload: previousTables });
        toast.error('상태 변경에 실패했습니다');
      }
    },
    [toast],
  );

  // 주문 삭제
  const deleteOrder = useCallback(
    async (orderId: number) => {
      try {
        await dashboardApi.deleteOrder(orderId);
        toast.success('주문이 삭제되었습니다');
      } catch {
        toast.error('주문 삭제에 실패했습니다');
      }
    },
    [toast],
  );

  // 이용 완료
  const completeSession = useCallback(
    async (tableId: number) => {
      try {
        await dashboardApi.completeSession(tableId);
        toast.success('이용 완료 처리되었습니다');
      } catch {
        toast.error('이용 완료 처리에 실패했습니다');
      }
    },
    [toast],
  );

  return {
    ...state,
    loadDashboard,
    updateOrderStatus,
    deleteOrder,
    completeSession,
  };
};
