import { memo } from 'react';
import { TableDashboardItem } from '../types';
import { formatCurrency } from '@/common/utils/formatters';

interface TableCardProps {
  table: TableDashboardItem;
  onClick: () => void;
}

export const TableCard = memo(
  ({ table, onClick }: TableCardProps) => {
    const isEmpty = table.sessionStatus === 'EMPTY';

    return (
      <button
        className={`table-card ${isEmpty ? 'empty' : 'active'} ${table.isHighlighted ? 'highlighted' : ''}`}
        onClick={onClick}
        aria-label={`테이블 ${table.tableNumber} ${isEmpty ? '빈자리' : `이용중 ${formatCurrency(table.totalAmount)}`}`}
      >
        <div className="table-card-header">
          <span className="table-number">테이블 {table.tableNumber}</span>
          <span className={`status-badge ${isEmpty ? 'badge-empty' : 'badge-active'}`}>
            {isEmpty ? '빈자리' : '이용중'}
          </span>
        </div>

        {!isEmpty && (
          <div className="table-card-body">
            <p className="table-total">{formatCurrency(table.totalAmount)}</p>
            <p className="table-order-count">주문 {table.orders.length}건</p>
            {table.orders.length > 0 && (
              <div className="table-preview">
                {table.orders.slice(-2).map((order) =>
                  order.items.slice(0, 2).map((item, idx) => (
                    <span key={`${order.orderId}-${idx}`} className="preview-item">
                      {item.menuName}x{item.quantity}
                    </span>
                  )),
                )}
              </div>
            )}
          </div>
        )}
      </button>
    );
  },
  (prev, next) => prev.table === next.table,
);

TableCard.displayName = 'TableCard';
