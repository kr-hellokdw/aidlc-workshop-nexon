export interface StoreInfo {
  storeId: number;
  storeName: string;
  username: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  storeInfo: StoreInfo | null;
  loading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; refreshToken: string; storeInfo: StoreInfo } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: { token: string } }
  | { type: 'RESTORE_SESSION'; payload: { token: string; refreshToken: string; storeInfo: StoreInfo } };

export interface LoginRequest {
  storeId: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  storeInfo: StoreInfo;
}
