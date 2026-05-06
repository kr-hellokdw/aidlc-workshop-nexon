import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AuthGuard } from './features/auth/components/AuthGuard';
import { LoginPage } from './features/auth/components/LoginPage';
import { AdminLayout } from './common/components/AdminLayout';
import { ToastProvider } from './common/components/Toast';

const DashboardPage = lazy(() =>
  import('./features/dashboard/components/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TableManagementPage = lazy(() =>
  import('./features/table/components/TableManagementPage').then((m) => ({ default: m.TableManagementPage })),
);
const MenuManagementPage = lazy(() =>
  import('./features/menu/components/MenuManagementPage').then((m) => ({ default: m.MenuManagementPage })),
);

const PageLoading = () => (
  <div className="page-loading" role="status" aria-label="페이지 로딩 중">
    <div className="loading-spinner" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <AuthGuard>
                    <AdminLayout />
                  </AuthGuard>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tables" element={<TableManagementPage />} />
                <Route path="/menus" element={<MenuManagementPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
