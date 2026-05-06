import { AuthState, AuthAction } from '../types';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  storeInfo: null,
  loading: true,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };

    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        storeInfo: action.payload.storeInfo,
        loading: false,
      };

    case 'LOGIN_FAILURE':
      return { ...state, loading: false, isAuthenticated: false };

    case 'LOGOUT':
      return {
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        storeInfo: null,
        loading: false,
      };

    case 'TOKEN_REFRESHED':
      return { ...state, token: action.payload.token };

    case 'RESTORE_SESSION':
      return {
        isAuthenticated: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        storeInfo: action.payload.storeInfo,
        loading: false,
      };

    default:
      return state;
  }
};
