# Unit 3: Admin Frontend - NFR Design (비기능 설계)

---

## 1. 보안 설계 패턴

### 1.1 인증 아키텍처

```
[App 시작]
    |
    v
[AuthProvider 초기화]
    |
    ├── localStorage에서 token/refreshToken 복원
    ├── token 존재 시 → JWT 디코딩 → 만료 시간 확인
    │   ├── 유효 → isAuthenticated=true, 앱 렌더링
    │   └── 만료 → refreshToken으로 갱신 시도
    │       ├── 성공 → 새 token 저장, 앱 렌더링
    │       └── 실패 → 로그아웃, /login 리다이렉트
    └── token 없음 → /login 리다이렉트
```

#### Axios 인터셉터 설계
```typescript
// Request 인터셉터
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터 (토큰 갱신 로직)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('token', data.data.token);
        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        return axiosInstance(originalRequest);
      } catch {
        // refreshToken도 만료 → 로그아웃
        authContext.logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

#### 자동 로그아웃 타이머
```typescript
// JWT 디코딩 후 exp 기반 타이머 설정
const setupAutoLogout = (token: string) => {
  const { exp } = decodeJwt(token);
  const msUntilExpiry = exp * 1000 - Date.now();
  setTimeout(() => {
    logout();
    toast.info('세션이 만료되었습니다. 다시 로그인해주세요.');
  }, msUntilExpiry);
};
```

### 1.2 라우트 보호 패턴

```typescript
// AuthGuard 컴포넌트
const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// 라우트 구성
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<AuthGuard><AdminLayout /></AuthGuard>}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/tables" element={<TableManagementPage />} />
    <Route path="/menus" element={<MenuManagementPage />} />
  </Route>
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>
```

### 1.3 입력 검증 패턴

```typescript
// 폼 검증 유틸리티
const validators = {
  required: (value: string) => value.trim() ? null : '필수 입력 항목입니다',
  minLength: (min: number) => (value: string) =>
    value.length >= min ? null : `최소 ${min}자 이상 입력해주세요`,
  maxPrice: (value: number) =>
    value <= 1_000_000 ? null : '가격은 1,000,000원 이하여야 합니다',
  positiveNumber: (value: number) =>
    value > 0 ? null : '0보다 큰 값을 입력해주세요',
  imageFile: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return '지원하지 않는 파일 형식입니다 (jpg/png/webp)';
    if (file.size > 5 * 1024 * 1024) return '파일 크기는 5MB 이하여야 합니다';
    return null;
  },
};
```

---

## 2. 성능 설계 패턴

### 2.1 코드 분할 (Route-based Lazy Loading)

```typescript
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const TableManagementPage = lazy(() => import('./features/table/TableManagementPage'));
const MenuManagementPage = lazy(() => import('./features/menu/MenuManagementPage'));

// Suspense 래퍼
<Suspense fallback={<Loading />}>
  <Routes>...</Routes>
</Suspense>
```

### 2.2 SSE 이벤트 처리 최적화

```typescript
// useSSE hook - 이벤트별 디스패치로 최소 리렌더링
const useSSE = (storeId: number) => {
  const [state, dispatch] = useReducer(sseReducer, initialState);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectCountRef = useRef(0);
  const maxReconnects = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    const es = new EventSource(
      `${API_URL}/api/admin/sse/subscribe?token=${token}`
    );

    es.addEventListener('NEW_ORDER', (e) => {
      dispatch({ type: 'NEW_ORDER', payload: JSON.parse(e.data) });
    });

    es.addEventListener('ORDER_STATUS_CHANGED', (e) => {
      dispatch({ type: 'ORDER_STATUS_CHANGED', payload: JSON.parse(e.data) });
    });

    es.addEventListener('ORDER_DELETED', (e) => {
      dispatch({ type: 'ORDER_DELETED', payload: JSON.parse(e.data) });
    });

    es.addEventListener('SESSION_COMPLETED', (e) => {
      dispatch({ type: 'SESSION_COMPLETED', payload: JSON.parse(e.data) });
    });

    es.addEventListener('HEARTBEAT', () => {
      dispatch({ type: 'HEARTBEAT' });
    });

    es.onerror = () => {
      es.close();
      dispatch({ type: 'DISCONNECTED' });
      if (reconnectCountRef.current < maxReconnects) {
        reconnectCountRef.current++;
        setTimeout(connect, reconnectDelay);
      }
    };

    es.onopen = () => {
      reconnectCountRef.current = 0;
      dispatch({ type: 'CONNECTED' });
    };

    eventSourceRef.current = es;
  }, [storeId]);

  // cleanup on unmount
  useEffect(() => {
    connect();
    return () => eventSourceRef.current?.close();
  }, [connect]);

  return state;
};
```

### 2.3 대시보드 리렌더링 최적화

```typescript
// 테이블 카드를 React.memo로 감싸서 변경된 카드만 리렌더링
const TableCard = React.memo<TableCardProps>(({ table, onClickDetail }) => {
  return (
    <div className={`table-card ${table.isHighlighted ? 'highlight' : ''}`}>
      <h3>테이블 {table.tableNumber}</h3>
      <p>₩{table.totalAmount.toLocaleString()}</p>
      <p>주문 {table.orders.length}건</p>
    </div>
  );
}, (prev, next) => {
  // 커스텀 비교: 해당 테이블 데이터가 변경된 경우에만 리렌더링
  return prev.table === next.table;
});

// Dashboard reducer - 불변 업데이트로 변경된 테이블만 새 참조
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'NEW_ORDER': {
      const { tableId, order } = action.payload;
      return {
        ...state,
        tables: state.tables.map(t =>
          t.tableId === tableId
            ? { ...t, orders: [...t.orders, order], totalAmount: t.totalAmount + order.totalAmount, isHighlighted: true }
            : t
        ),
      };
    }
    // ... 다른 액션들도 동일 패턴
  }
};
```

### 2.4 이미지 Lazy Loading

```typescript
// 메뉴 이미지에 loading="lazy" + placeholder
const MenuImage: React.FC<{ src: string | null; alt: string }> = ({ src, alt }) => {
  if (!src) return <div className="menu-image-placeholder" aria-label={alt} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="menu-image"
      onError={(e) => { e.currentTarget.src = '/placeholder-menu.png'; }}
    />
  );
};
```

### 2.5 API 호출 중복 방지

```typescript
// useApiCall hook - 진행 중 요청 차단
const useApiCall = () => {
  const pendingRef = useRef<Set<string>>(new Set());

  const call = async <T>(key: string, fn: () => Promise<T>): Promise<T | null> => {
    if (pendingRef.current.has(key)) return null; // 중복 차단
    pendingRef.current.add(key);
    try {
      return await fn();
    } finally {
      pendingRef.current.delete(key);
    }
  };

  return { call };
};
```

---

## 3. 신뢰성 설계 패턴

### 3.1 Error Boundary

```typescript
class AppErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" role="alert">
          <h2>오류가 발생했습니다</h2>
          <p>페이지를 새로고침해주세요.</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 3.2 SSE 재연결 + 데이터 동기화

```
[SSE 연결 끊김]
    |
    v
[3초 대기] → [재연결 시도]
    |
    ├── 성공 → REST API로 전체 대시보드 데이터 재조회 (누락 이벤트 보상)
    │         → SSE 이벤트 수신 재개
    |
    └── 실패 → 재시도 카운트 증가
              ├── 5회 미만 → 3초 후 재시도
              └── 5회 도달 → "연결 끊김" 배너 표시 + 수동 새로고침 안내
```

### 3.3 낙관적 업데이트 + 롤백

```typescript
// 주문 상태 변경 예시
const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
  // 1. 낙관적 업데이트 (즉시 UI 반영)
  const previousState = state.tables;
  dispatch({ type: 'OPTIMISTIC_STATUS_CHANGE', payload: { orderId, newStatus } });

  try {
    // 2. 서버 요청
    await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
    toast.success('주문 상태가 변경되었습니다');
  } catch (error) {
    // 3. 실패 시 롤백
    dispatch({ type: 'ROLLBACK', payload: previousState });
    toast.error('상태 변경에 실패했습니다');
  }
};
```

### 3.4 네트워크 상태 감지

```typescript
// 네트워크 복구 시 자동 새로고침
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 네트워크 복구 시 대시보드 데이터 재조회
      queryClient.invalidateQueries(['dashboard']);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

---

## 4. 접근성 설계 패턴

### 4.1 모달 Focus Trap

```typescript
const useFocusTrap = (isOpen: boolean, modalRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 모달 닫기 트리거
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl?.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, modalRef]);
};
```

### 4.2 실시간 알림 (aria-live)

```typescript
// 주문 알림을 스크린리더에 전달
const LiveAnnouncer: React.FC = () => {
  const [message, setMessage] = useState('');

  // SSE 이벤트 수신 시 메시지 설정
  useEffect(() => {
    const handler = (event: CustomEvent<SseEvent>) => {
      switch (event.detail.type) {
        case 'NEW_ORDER':
          setMessage(`테이블 ${event.detail.data.tableNumber}에 새 주문이 들어왔습니다`);
          break;
        case 'SESSION_COMPLETED':
          setMessage(`테이블 ${event.detail.data.tableNumber} 이용 완료`);
          break;
      }
    };
    window.addEventListener('sse-event', handler as EventListener);
    return () => window.removeEventListener('sse-event', handler as EventListener);
  }, []);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
};
```

### 4.3 드래그 앤 드롭 키보드 대안

```typescript
// 메뉴 순서 변경 - 키보드 접근 가능한 버튼 제공
const SortableMenuItem: React.FC<{ item: MenuItem; index: number; total: number; onMove: (from: number, to: number) => void }> = 
  ({ item, index, total, onMove }) => (
  <div className="sortable-item" role="listitem">
    <span className="drag-handle" aria-hidden="true">≡</span>
    <span>{item.name}</span>
    <div className="order-buttons" aria-label={`${item.name} 순서 변경`}>
      <button
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
        aria-label="위로 이동"
      >↑</button>
      <button
        onClick={() => onMove(index, index + 1)}
        disabled={index === total - 1}
        aria-label="아래로 이동"
      >↓</button>
    </div>
  </div>
);
```

---

## 5. 유지보수성 설계 패턴

### 5.1 프로젝트 구조 (최종)

```
frontend-admin/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/        # LoginPage, AuthGuard
│   │   │   ├── hooks/             # useAuth (context consumer)
│   │   │   ├── context/           # AuthContext, authReducer
│   │   │   ├── api/               # auth API 호출 함수
│   │   │   └── types.ts           # Auth 관련 타입
│   │   ├── dashboard/
│   │   │   ├── components/        # DashboardPage, TableCard, OrderDetailModal
│   │   │   ├── hooks/             # useDashboard, useSSE
│   │   │   ├── reducers/          # dashboardReducer
│   │   │   ├── api/               # dashboard API 호출 함수
│   │   │   └── types.ts
│   │   ├── table/
│   │   │   ├── components/        # TableManagementPage, TableSetupForm, OrderHistoryModal
│   │   │   ├── hooks/             # useTableManagement
│   │   │   ├── api/
│   │   │   └── types.ts
│   │   └── menu/
│   │       ├── components/        # MenuManagementPage, MenuForm, CategoryManager
│   │       ├── hooks/             # useMenuManagement, useCategoryManagement
│   │       ├── api/
│   │       └── types.ts
│   ├── common/
│   │   ├── components/            # AdminLayout, Sidebar, Toast, ConfirmDialog, Loading, ErrorMessage
│   │   ├── hooks/                 # useApiCall, useNetworkStatus, useFocusTrap
│   │   ├── api/                   # apiClient (Axios 인스턴스)
│   │   ├── types/                 # 공통 타입 (ApiResponse, OrderStatus 등)
│   │   └── utils/                 # validators, formatters (날짜, 통화)
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── handlers/
│   │   ├── sse-mock.ts
│   │   └── data.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── placeholder-menu.png
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
└── .prettierrc
```

### 5.2 환경변수 관리

```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_SSE_URL=http://localhost:8080
VITE_ENABLE_MOCKS=true

# .env.production
VITE_API_URL=/api
VITE_SSE_URL=
VITE_ENABLE_MOCKS=false
```

```typescript
// src/common/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  sseUrl: import.meta.env.VITE_SSE_URL || '',
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === 'true',
} as const;
```

### 5.3 공통 포맷터

```typescript
// src/common/utils/formatters.ts
export const formatCurrency = (amount: number): string =>
  `₩${amount.toLocaleString('ko-KR')}`;

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};
```

---

## 6. 테스트 설계 패턴

### 6.1 MSW 설정

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// src/main.tsx (개발 모드에서만 활성화)
if (config.enableMocks) {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

### 6.2 SSE Mock 시뮬레이터

```typescript
// src/mocks/sse-mock.ts
// 개발 모드에서 SSE 이벤트를 시뮬레이션
export const startSseMock = () => {
  // 10초마다 랜덤 주문 이벤트 발생
  setInterval(() => {
    const event = generateRandomOrderEvent();
    window.dispatchEvent(new CustomEvent('mock-sse', { detail: event }));
  }, 10000);
};

// useSSE hook에서 mock 모드 분기
// config.enableMocks === true → CustomEvent 리스너
// config.enableMocks === false → 실제 EventSource
```

### 6.3 컴포넌트 테스트 패턴

```typescript
// 예시: TableCard 테스트
import { render, screen } from '@testing-library/react';
import { TableCard } from './TableCard';

describe('TableCard', () => {
  it('테이블 번호와 총 주문액을 표시한다', () => {
    render(<TableCard table={mockTable} onClickDetail={vi.fn()} />);
    expect(screen.getByText('테이블 1')).toBeInTheDocument();
    expect(screen.getByText('₩45,000')).toBeInTheDocument();
  });

  it('빈 테이블은 "빈자리"로 표시한다', () => {
    render(<TableCard table={emptyTable} onClickDetail={vi.fn()} />);
    expect(screen.getByText('빈자리')).toBeInTheDocument();
  });
});
```

---

## 7. 설계 결정 요약

| NFR 카테고리 | 핵심 설계 패턴 | 적용 위치 |
|-------------|---------------|-----------|
| 보안 | Axios 인터셉터 + 자동 토큰 갱신 | `common/api/apiClient.ts` |
| 보안 | AuthGuard 라우트 보호 | `features/auth/components/AuthGuard.tsx` |
| 성능 | Route-based lazy loading | `App.tsx` |
| 성능 | React.memo + 불변 reducer | `features/dashboard/` |
| 성능 | SSE 이벤트별 최소 디스패치 | `features/dashboard/hooks/useSSE.ts` |
| 신뢰성 | Error Boundary | `App.tsx` 최상위 |
| 신뢰성 | SSE 자동 재연결 + REST 보상 조회 | `features/dashboard/hooks/useSSE.ts` |
| 신뢰성 | 낙관적 업데이트 + 롤백 | `features/dashboard/hooks/useDashboard.ts` |
| 접근성 | Focus trap + aria-live | `common/hooks/`, `common/components/` |
| 접근성 | 키보드 순서 변경 대안 | `features/menu/components/` |
| 유지보수 | Feature 기반 폴더 구조 | 전체 src/ |
| 테스트 | MSW + SSE Mock | `mocks/` |
