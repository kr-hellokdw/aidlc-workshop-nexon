import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../cart/CartProvider';
import { useMenu } from './useMenu';
import { MenuGrid } from './MenuGrid';
import { CategoryTabs } from './CategoryTabs';
import { MenuDetailSheet } from './MenuDetailSheet';
import { CartSidePanel } from '../cart/CartSidePanel';
import { OrderSuccessModal } from '../order/OrderSuccessModal';
import type { Menu } from '../../common/types';
import styles from './MenuPage.module.css';

export function MenuPage() {
  const { tableInfo } = useAuth();
  const { itemCount } = useCart();
  const { menus, categories, loading } = useMenu(tableInfo?.storeId ?? 0);
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const filteredMenus = selectedCategory
    ? menus.filter((m) => m.categoryId === selectedCategory)
    : menus;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.storeName}>🍽️ 맛있는 식당</h1>
        <span className={styles.tableBadge}>테이블 {tableInfo?.tableNumber}</span>
      </header>

      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Menu Area */}
        <div className={styles.menuArea}>
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          {loading ? (
            <div className={styles.loading}>메뉴를 불러오는 중...</div>
          ) : (
            <MenuGrid menus={filteredMenus} onMenuClick={setSelectedMenu} />
          )}
        </div>

        {/* Cart Side Panel */}
        {isCartOpen && (
          <CartSidePanel
            onClose={() => setIsCartOpen(false)}
            onOrderSuccess={(orderNumber) => {
              setIsCartOpen(false);
              setOrderSuccess(orderNumber);
            }}
          />
        )}
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <button className={styles.orderHistoryBtn} onClick={() => navigate('/orders')}>
          📋 주문내역 보기
        </button>
      </div>

      {/* Floating Cart Button */}
      {!isCartOpen && (
        <button className={styles.floatingCart} onClick={() => setIsCartOpen(true)}>
          🛒
          {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </button>
      )}

      {/* Menu Detail Bottom Sheet */}
      {selectedMenu && (
        <MenuDetailSheet menu={selectedMenu} onClose={() => setSelectedMenu(null)} />
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <OrderSuccessModal
          orderNumber={orderSuccess}
          onClose={() => setOrderSuccess(null)}
        />
      )}
    </div>
  );
}
