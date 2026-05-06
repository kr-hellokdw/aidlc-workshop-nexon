import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TableInfo, TokenResponse, ApiResponse } from '../../common/types';
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
    const res = await apiClient.post<ApiResponse<TokenResponse>>('/auth/table/login', {
      storeId,
      tableNumber,
      password,
    });
    const data = res.data.data;
    const authData = {
      storeId,
      tableNumber,
      password,
      token: data.accessToken,
      tableId: data.tableId,
      sessionId: data.sessionId,
    };
    localStorage.setItem('tableAuth', JSON.stringify(authData));
    setTableInfo({
      storeId: data.storeId,
      tableId: data.tableId,
      tableNumber: data.tableNumber,
      sessionId: data.sessionId,
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
