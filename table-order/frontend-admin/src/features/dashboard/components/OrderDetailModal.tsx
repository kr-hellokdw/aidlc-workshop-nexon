import { useState } from 'react';
import { TableDashboardItem } from '../types';
import { OrderStatus } from '@/common/types';
import { formatCurrency, formatTime } from '@/common/utils/formatters';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';

interface OrderDetailModalProps {
  table: TableDashboardItem;
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  onDeleteOrder: (orderId: number) => void;
  onCompleteSession: (tableId: number) => void;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: '대기중' },
  { value: 'PREPARING', label: '준비중' },
  { value: 'COMPLETED', label: '완료' },
];

const getAvailableStatuses = (current: OrderStatus) => {
  const order: OrderStatus[] = ['PENDING', 'PREPARING', 'COMPLETED'];
  const currentIdx = order.indexOf(current);
  // 현재 상태 + 바로 다음 상태만 허용
  return STATUS_OPTIONS.filter((_, idx) => idx <= currentIdx + 1);
};

export const OrderDetailModal = ({
  table,
  onClose,
  onStatusChange,
  onDeleteOrder,
  onCompleteSession,
}: OrderDetailModalProps) => {
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    onStatusChange(orderId, newStatus);
  };

  const handleDelete = () => {
    if (deleteTarget !== null) {
      onDeleteOrder(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleComplete = () => {
    onCompleteSession(table.tableId);
    setShowCompleteConfirm(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="order-detail-title">테이블 {table.tableNumber} - 주문 상세</h2>
          <button onClick={onClose} className="modal-close" aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {table.orders.length === 0 ? (
            <p className="empty-message">주문이 없습니다</p>
          ) : (
            table.orders.map((order) => (
              <div key={order.orderId} className="order-item">
                <div className="order-item-header">
                  <span className="order-number">주문 #{order.orderNumber}</span>
                  <span className="order-time">{formatTime(order.createdAt)}</span>
                </div>

                <div className="order-item-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-menu-item">
                      <span>{item.menuName}</span>
                      <span>x{item.quantity}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-item-footer">
                  <label htmlFor={`status-${order.orderId}`} className="sr-only">
                    주문 상태
                  </label>
                  <select
                    id={`status-${order.orderId}`}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.orderId, e.target.value as OrderStatus)
                    }
                    className={`status-select status-${order.status.toLowerCase()}`}
                  >
                    {getAvailableStatuses(order.status).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setDeleteTarget(order.orderId)}
                    className="btn btn-danger btn-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="order-total">
            <span>총 주문액:</span>
            <span className="total-amount">{formatCurrency(table.totalAmount)}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => setShowCompleteConfirm(true)}
            className="btn btn-primary btn-full"
            disabled={table.sessionStatus === 'EMPTY'}
          >
            이용 완료
          </button>
        </div>

        <ConfirmDialog
          isOpen={deleteTarget !== null}
          title="주문 삭제"
          message="이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmLabel="삭제"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          variant="danger"
        />

        <ConfirmDialog
          isOpen={showCompleteConfirm}
          title="이용 완료 처리"
          message={`테이블 ${table.tableNumber}의 세션을 종료합니다. 현재 주문 내역이 과거 이력으로 이동됩니다.`}
          confirmLabel="확인"
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteConfirm(false)}
        />
      </div>
    </div>
  );
};
