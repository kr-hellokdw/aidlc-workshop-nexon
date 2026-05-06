import { useState, useEffect } from 'react';
import { tableApi } from '../api/tableApi';
import { TableInfo, OrderHistorySession } from '../types';
import { formatCurrency, formatDateTime } from '@/common/utils/formatters';

interface OrderHistoryModalProps {
  table: TableInfo;
  onClose: () => void;
}

export const OrderHistoryModal = ({ table, onClose }: OrderHistoryModalProps) => {
  const [sessions, setSessions] = useState<OrderHistorySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: getDefaultFrom(),
    to: getDefaultTo(),
  });

  function getDefaultFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }

  function getDefaultTo(): string {
    return new Date().toISOString().split('T')[0];
  }

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await tableApi.getOrderHistory(table.tableId, dateRange.from, dateRange.to);
        setSessions(data);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [table.tableId, dateRange]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal modal-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="history-title">테이블 {table.tableNumber} - 과거 주문 내역</h2>
          <button onClick={onClose} className="modal-close" aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="date-filter">
            <label htmlFor="date-from">기간:</label>
            <input
              id="date-from"
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
            />
            <span>~</span>
            <input
              id="date-to"
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
            />
          </div>

          {loading ? (
            <div className="loading-spinner" role="status" aria-label="로딩 중" />
          ) : sessions.length === 0 ? (
            <p className="empty-message">해당 기간에 주문 내역이 없습니다</p>
          ) : (
            sessions.map((session) => (
              <div key={session.sessionId} className="history-session">
                <div className="session-header">
                  세션: {formatDateTime(session.startedAt)} ~ {formatDateTime(session.completedAt)}
                </div>
                <div className="session-orders">
                  {session.orders.map((order) => (
                    <div key={order.orderId} className="history-order">
                      <span>#{order.orderNumber}</span>
                      <span>
                        {order.items.map((i) => `${i.menuName}x${i.quantity}`).join(', ')}
                      </span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  ))}
                </div>
                <div className="session-total">
                  세션 합계: {formatCurrency(session.sessionTotal)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
