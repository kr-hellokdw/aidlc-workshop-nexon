import { createContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, StoreInfo, LoginRequest } from '../types';
import { authReducer, initialAuthState } from './authReducer';
import { authApi } from '../api/authApi';

interface AuthContextValue extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 앱 시작 시 localStorage에서 세션 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const storeInfoStr = localStorage.getItem('storeInfo');

    if (token && refreshToken && storeInfoStr) {
      try {
        const storeInfo: StoreInfo = JSON.parse(storeInfoStr);
        dispatch({ type: 'RESTORE_SESSION', payload: { token, refreshToken, storeInfo } });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('storeInfo');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(request);
      const { token, refreshToken, storeInfo } = response;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('storeInfo', JSON.stringify(storeInfo));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, refreshToken, storeInfo } });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('storeInfo');
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
