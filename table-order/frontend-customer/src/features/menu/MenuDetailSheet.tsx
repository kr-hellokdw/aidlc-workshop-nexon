import { useState } from 'react';
import { useCart } from '../cart/CartProvider';
import type { Menu } from '../../common/types';
import styles from './MenuDetailSheet.module.css';

interface Props {
  menu: Menu;
  onClose: () => void;
}

export function MenuDetailSheet({ menu, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addItem(menu, quantity);
    onClose();
  };

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

  const getImageSrc = () => {
    if (!menu.imageUrl) return null;
    if (menu.imageUrl.startsWith('/') || !menu.imageUrl.startsWith('http')) {
      return `/api/files/images/${menu.imageUrl}`;
    }
    return menu.imageUrl;
  };

  const imgSrc = getImageSrc();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.content}>
          <div className={styles.imgWrap}>
            {imgSrc ? (
              <img src={imgSrc} alt={menu.name} className={styles.img} />
            ) : (
              <span className={styles.placeholder}>🍽️</span>
            )}
          </div>
          <div className={styles.info}>
            <h2 className={styles.name}>{menu.name}</h2>
            <p className={styles.desc}>{menu.description}</p>
            <p className={styles.price}>{formatPrice(menu.price)}</p>
            <div className={styles.qtyRow}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className={styles.qtyNum}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
              >
                +
              </button>
            </div>
            <button className={styles.addBtn} onClick={handleAdd}>
              담기 · {formatPrice(menu.price * quantity)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
