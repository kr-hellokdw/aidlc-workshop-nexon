import { useState, useEffect, useCallback } from 'react';
import { tableApi } from '../api/tableApi';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { TableInfo, TableCreateRequest, TableUpdateRequest } from '../types';
import { useToast } from '@/common/components/Toast';

export const useTableManagement = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tableData, dashboardData] = await Promise.all([
        tableApi.getTables(),
        dashboardApi.getDashboard().catch(() => []),
      ]);

      // dashboard 데이터에서 세션 상태를 병합
      const sessionMap = new Map(
        dashboardData.map((d) => [Number(d.tableId), d.sessionStatus]),
      );

      const merged: TableInfo[] = tableData.map((t) => ({
        ...t,
        sessionStatus: sessionMap.get(Number(t.tableId)) || t.sessionStatus || 'EMPTY',
      }));

      setTables(merged);
    } catch {
      setError('테이블 목록을 불러올 수 없습니다');
      toast.error('테이블 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const createTable = useCallback(
    async (request: TableCreateRequest) => {
      try {
        const newTable = await tableApi.createTable(request);
        setTables((prev) => [...prev, newTable]);
        toast.success('테이블이 추가되었습니다');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        toast.error(axiosErr.response?.data?.error?.message || '테이블 추가에 실패했습니다');
        throw err;
      }
    },
    [toast],
  );

  const updateTable = useCallback(
    async (tableId: number, request: TableUpdateRequest) => {
      try {
        const updated = await tableApi.updateTable(tableId, request);
        setTables((prev) => prev.map((t) => (t.tableId === tableId ? updated : t)));
        toast.success('테이블이 수정되었습니다');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        toast.error(axiosErr.response?.data?.error?.message || '테이블 수정에 실패했습니다');
        throw err;
      }
    },
    [toast],
  );

  const deleteTable = useCallback(
    async (tableId: number) => {
      try {
        await tableApi.deleteTable(tableId);
        setTables((prev) => prev.filter((t) => t.tableId !== tableId));
        toast.success('테이블이 삭제되었습니다');
      } catch {
        toast.error('테이블 삭제에 실패했습니다');
      }
    },
    [toast],
  );

  const completeSession = useCallback(
    async (tableId: number) => {
      try {
        await tableApi.completeSession(tableId);
        toast.success('이용 완료 처리되었습니다');
        await loadTables(); // 전체 다시 로드하여 상태 동기화
      } catch {
        toast.error('이용 완료 처리에 실패했습니다');
      }
    },
    [toast, loadTables],
  );

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    completeSession,
    reload: loadTables,
  };
};
