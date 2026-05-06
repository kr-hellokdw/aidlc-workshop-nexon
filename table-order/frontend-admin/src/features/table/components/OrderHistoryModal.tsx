import { useState, useEffect } from 'react';
import { apiClient } from '@/common/api/apiClient';
import { ApiResponse } from '@/common/types';
import { TableInfo } from '../types';
import { formatCurrency, formatDateTime } from '@/common/utils/formatters';

interface OrderHistoryItem {
  id: number;
  orderNumber: number;
  tableId: number;
  status: string;
  totalAmount: number;
  orderedAt: string;
  items?: { menuName: string; menuPrice: number; quantity: number; subtotal: number }[];
}

interface OrderHistoryModalProps {
  table: TableInfo;
  onClose: () => void;
}

export const OrderHistoryModal = ({ table, onClose }: OrderHistoryModalProps) => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      try {
        const { data } = await apiClient.get<ApiResponse<OrderHistoryItem[]>>(
          `/api/admin/tables/${table.tableId}/history`,
          { params: { from: dateRange.from, to: dateRange.to } },
        );
        setOrders(data.data || []);
      } catch {
        setError('주문 내역을 불러올 수 없습니다');
        setOrders([]);
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
          ) : error ? (
            <p className="empty-message">{error}</p>
          ) : orders.length === 0 ? (
            <p className="empty-message">해당 기간에 주문 내역이 없습니다</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="history-session">
                <div className="session-header">
                  주문 #{order.orderNumber} · {formatDateTime(order.orderedAt)} · {order.status}
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="session-orders">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="history-order">
                        <span>{item.menuName} x{item.quantity}</span>
                        <span>{formatCurrency(item.subtotal || item.menuPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="session-total">
                  합계: {formatCurrency(order.totalAmount)}
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
