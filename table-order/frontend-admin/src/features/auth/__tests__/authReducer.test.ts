import { describe, it, expect } from 'vitest';
import { authReducer, initialAuthState } from '../context/authReducer';
import { AuthState } from '../types';

describe('authReducer', () => {
  it('초기 상태를 올바르게 설정한다', () => {
    expect(initialAuthState).toEqual({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      storeInfo: null,
      loading: true,
    });
  });

  it('LOGIN_START 시 loading을 true로 설정한다', () => {
    const state: AuthState = { ...initialAuthState, loading: false };
    const result = authReducer(state, { type: 'LOGIN_START' });
    expect(result.loading).toBe(true);
  });

  it('LOGIN_SUCCESS 시 인증 상태를 설정한다', () => {
    const payload = {
      token: 'test-token',
      refreshToken: 'test-refresh',
      storeInfo: { storeId: 1, storeName: '테스트매장', username: 'admin' },
    };
    const result = authReducer(initialAuthState, { type: 'LOGIN_SUCCESS', payload });

    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBe('test-token');
    expect(result.refreshToken).toBe('test-refresh');
    expect(result.storeInfo).toEqual(payload.storeInfo);
    expect(result.loading).toBe(false);
  });

  it('LOGIN_FAILURE 시 loading을 false로 설정한다', () => {
    const state: AuthState = { ...initialAuthState, loading: true };
    const result = authReducer(state, { type: 'LOGIN_FAILURE' });
    expect(result.loading).toBe(false);
    expect(result.isAuthenticated).toBe(false);
  });

  it('LOGOUT 시 모든 인증 정보를 초기화한다', () => {
    const state: AuthState = {
      isAuthenticated: true,
      token: 'token',
      refreshToken: 'refresh',
      storeInfo: { storeId: 1, storeName: '매장', username: 'admin' },
      loading: false,
    };
    const result = authReducer(state, { type: 'LOGOUT' });

    expect(result.isAuthenticated).toBe(false);
    expect(result.token).toBeNull();
    expect(result.refreshToken).toBeNull();
    expect(result.storeInfo).toBeNull();
    expect(result.loading).toBe(false);
  });

  it('TOKEN_REFRESHED 시 토큰만 업데이트한다', () => {
    const state: AuthState = {
      isAuthenticated: true,
      token: 'old-token',
      refreshToken: 'refresh',
      storeInfo: { storeId: 1, storeName: '매장', username: 'admin' },
      loading: false,
    };
    const result = authReducer(state, { type: 'TOKEN_REFRESHED', payload: { token: 'new-token' } });

    expect(result.token).toBe('new-token');
    expect(result.isAuthenticated).toBe(true);
  });

  it('RESTORE_SESSION 시 세션을 복원한다', () => {
    const payload = {
      token: 'restored-token',
      refreshToken: 'restored-refresh',
      storeInfo: { storeId: 1, storeName: '매장', username: 'admin' },
    };
    const result = authReducer(initialAuthState, { type: 'RESTORE_SESSION', payload });

    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBe('restored-token');
    expect(result.loading).toBe(false);
  });
});
