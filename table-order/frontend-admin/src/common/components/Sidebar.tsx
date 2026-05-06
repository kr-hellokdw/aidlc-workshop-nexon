import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const Sidebar = () => {
  const { logout, storeInfo } = useAuth();

  return (
    <aside className="sidebar" aria-label="메인 네비게이션">
      <div className="sidebar-header">
        <span className="sidebar-logo">🍽</span>
        <span className="sidebar-store-name">{storeInfo?.storeName}</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          대시보드
        </NavLink>
        <NavLink to="/tables" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          테이블 관리
        </NavLink>
        <NavLink to="/menus" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          메뉴 관리
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          로그아웃
        </button>
      </div>
    </aside>
  );
};
