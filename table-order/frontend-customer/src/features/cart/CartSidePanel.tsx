import { useState } from 'react';
import { useCart } from './CartProvider';
import apiClient from '../../common/api/client';
import type { ApiResponse } from '../../common/types';
import styles from './CartSidePanel.module.css';

interface Props {
  onClose: () => void;
  onOrderSuccess: (orderNumber: string) => void;
}

export function CartSidePanel({ onClose, onOrderSuccess }: Props) {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const [ordering, setOrdering] = useState(false);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

  const handleOrder = async () => {
    if (items.length === 0 || ordering) return;

    const confirmed = window.confirm('주문하시겠습니까?');
    if (!confirmed) return;

    setOrdering(true);
    try {
      const res = await apiClient.post<ApiResponse<{ orderNumber: string }>>('/orders', {
        items: items.map((item) => ({ menuId: item.menuId, quantity: item.quantity })),
      });
      clearCart();
      onOrderSuccess(res.data.data.orderNumber);
    } catch {
      alert('주문에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>🛒 장바구니</h2>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.items}>
        {items.length === 0 ? (
          <div className={styles.empty}>장바구니가 비어있습니다</div>
        ) : (
          items.map((item) => (
            <div key={item.menuId} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.menuName}</div>
                <div className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</div>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                >
                  −
                </button>
                <span className={styles.qtyNum}>{item.quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                >
                  +
                </button>
                <button className={styles.removeBtn} onClick={() => removeItem(item.menuId)}>
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span>총 금액</span>
          <span className={styles.totalAmount}>{formatPrice(totalAmount)}</span>
        </div>
        <button
          className={styles.orderBtn}
          onClick={handleOrder}
          disabled={items.length === 0 || ordering}
        >
          {ordering ? '주문 중...' : '주문하기'}
        </button>
      </div>
    </div>
  );
}
