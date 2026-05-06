import { useState, useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { TableCard } from './TableCard';
import { OrderDetailModal } from './OrderDetailModal';

export const DashboardPage = () => {
  const { tables, loading, error, sseConnected, updateOrderStatus, deleteOrder, completeSession } =
    useDashboard();
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // tables가 업데이트되면 selectedTable도 최신 데이터 반영
  const selectedTable = useMemo(
    () => tables.find((t) => t.tableId === selectedTableId) || null,
    [tables, selectedTableId],
  );

  if (loading) {
    return (
      <div className="page-loading" role="status" aria-label="로딩 중">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>주문 모니터링</h1>
        <div className={`sse-status ${sseConnected ? 'connected' : 'disconnected'}`}>
          <span className="sse-dot" />
          {sseConnected ? '실시간 연결됨' : '연결 끊김'}
        </div>
      </header>

      {!sseConnected && (
        <div className="sse-warning" role="alert">
          ⚠ 실시간 연결이 끊겼습니다. 재연결 시도 중...
        </div>
      )}

      <div className="table-grid">
        {tables.map((table) => (
          <TableCard
            key={table.tableId}
            table={table}
            onClick={() => setSelectedTableId(table.tableId)}
          />
        ))}
      </div>

      {selectedTable && (
        <OrderDetailModal
          table={selectedTable}
          onClose={() => setSelectedTableId(null)}
          onStatusChange={updateOrderStatus}
          onDeleteOrder={deleteOrder}
          onCompleteSession={completeSession}
        />
      )}
    </div>
  );
};
