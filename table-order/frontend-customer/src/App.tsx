import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import { CartProvider } from './features/cart/CartProvider';
import { AuthGuard } from './features/auth/AuthGuard';
import { TableSetupPage } from './features/auth/TableSetupPage';
import { MenuPage } from './features/menu/MenuPage';
import { OrderHistoryPage } from './features/order/OrderHistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/setup" element={<TableSetupPage />} />
            <Route
              path="/menu"
              element={
                <AuthGuard>
                  <MenuPage />
                </AuthGuard>
              }
            />
            <Route
              path="/orders"
              element={
                <AuthGuard>
                  <OrderHistoryPage />
                </AuthGuard>
              }
            />
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
