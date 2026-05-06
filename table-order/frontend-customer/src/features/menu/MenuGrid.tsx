import type { Menu } from '../../common/types';
import styles from './MenuGrid.module.css';

interface Props {
  menus: Menu[];
  onMenuClick: (menu: Menu) => void;
}

export function MenuGrid({ menus, onMenuClick }: Props) {
  const formatPrice = (price: number) =>
    price.toLocaleString('ko-KR') + '원';

  const getImageSrc = (menu: Menu) => {
    if (!menu.imageUrl) return null;
    // Backend 이미지 (상대 경로)는 우선순위 높음
    if (menu.imageUrl.startsWith('/') || !menu.imageUrl.startsWith('http')) {
      return `/api/files/images/${menu.imageUrl}`;
    }
    // 외부 URL (Mock 샘플 이미지 등)은 폴백
    return menu.imageUrl;
  };

  return (
    <div className={styles.grid}>
      {menus.map((menu) => {
        const imgSrc = getImageSrc(menu);
        return (
          <button key={menu.id} className={styles.card} onClick={() => onMenuClick(menu)}>
            <div className={styles.cardImg}>
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={menu.name}
                  className={styles.img}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                  }}
                />
              ) : null}
              <span className={styles.placeholder} style={imgSrc ? { display: 'none' } : undefined}>🍽️</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.name}>{menu.name}</div>
              <div className={styles.desc}>{menu.description}</div>
              <div className={styles.price}>{formatPrice(menu.price)}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
