import { useEffect, useState } from 'react';
import styles from './OrderSuccessModal.module.css';

interface Props {
  orderNumber: string;
  onClose: () => void;
}

export function OrderSuccessModal({ orderNumber, onClose }: Props) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>✅</div>
        <h2 className={styles.title}>주문 완료!</h2>
        <p className={styles.orderNumber}>주문번호: {orderNumber}</p>
        <p className={styles.message}>주문이 접수되었습니다</p>
        <p className={styles.countdown}>{countdown}초 후 메뉴 화면으로 돌아갑니다</p>
        <button className={styles.closeBtn} onClick={onClose}>확인</button>
      </div>
    </div>
  );
}
