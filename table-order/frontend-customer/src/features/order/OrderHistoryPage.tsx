import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../common/api/client';
import type { Order, ApiResponse } from '../../common/types';
import styles from './OrderHistoryPage.module.css';

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get<ApiResponse<Order[]>>('/orders/current');
        setOrders(res.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const statusLabel: Record<string, string> = {
    PENDING: '대기중',
    PREPARING: '준비중',
    COMPLETED: '완료',
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/menu')}>← 메뉴로</button>
        <h1 className={styles.title}>주문 내역</h1>
        <div style={{ width: 60 }} />
      </header>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>주문 내역이 없습니다</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.orderNumber}>#{order.orderNumber}</span>
                <span className={styles.time}>{formatTime(order.createdAt)}</span>
                <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                  {statusLabel[order.status]}
                </span>
              </div>
              <div className={styles.items}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.item}>
                    <span>{item.menuName} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.totalLabel}>합계</span>
                <span className={styles.totalAmount}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
