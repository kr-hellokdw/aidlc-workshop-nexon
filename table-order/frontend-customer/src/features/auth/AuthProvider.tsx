import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TableInfo, ApiResponse } from '../../common/types';
import apiClient from '../../common/api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  tableInfo: TableInfo | null;
  login: (storeId: number, tableNumber: number, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('tableAuth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          setTableInfo({
            storeId: parsed.storeId,
            tableId: parsed.tableId,
            tableNumber: parsed.tableNumber,
            sessionId: parsed.sessionId,
          });
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem('tableAuth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (storeId: number, tableNumber: number, password: string) => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; role: string; storeId: number }>>('/auth/table/login', {
      storeId,
      tableNumber,
      password,
    });
    const data = res.data.data;
    // JWT에서 tableId, tableNumber 추출
    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
    const authData = {
      storeId,
      tableNumber,
      password,
      token: data.accessToken,
      tableId: Number(payload.sub),
      sessionId: null,
    };
    localStorage.setItem('tableAuth', JSON.stringify(authData));
    setTableInfo({
      storeId: data.storeId,
      tableId: Number(payload.sub),
      tableNumber: payload.tableNumber,
      sessionId: null,
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('tableAuth');
    setIsAuthenticated(false);
    setTableInfo(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, tableInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
