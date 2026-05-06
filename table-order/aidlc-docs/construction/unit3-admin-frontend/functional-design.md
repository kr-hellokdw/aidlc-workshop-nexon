# Unit 3: Admin Frontend - Functional Design

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| **유닛** | frontend-admin |
| **기술 스택** | React 18+ / TypeScript / Vite / Axios / Context+useReducer / MSW / EventSource |
| **대상 사용자** | 매장 관리자 (박영희) |
| **대상 스토리** | US-A01 ~ US-A07 |
| **독립 개발** | MSW + Mock SSE로 Backend 없이 전체 기능 개발 가능 |

---

## 2. 라우팅 구조

```
/login                    → LoginPage (비인증 상태)
/dashboard                → DashboardPage (기본 화면, 인증 필요)
/tables                   → TableManagementPage (인증 필요)
/menus                    → MenuManagementPage (인증 필요)
```

### 라우팅 가드
- `AuthGuard`: 인증되지 않은 사용자 → `/login` 리다이렉트
- 인증된 사용자가 `/login` 접근 → `/dashboard` 리다이렉트
- 로그인 성공 후 기본 이동: `/dashboard`

---

## 3. Feature별 상세 설계

### 3.1 Auth Feature (US-A01)

#### 화면: LoginPage
```
+------------------------------------------+
|           테이블오더 관리자               |
|                                          |
|  +------------------------------------+  |
|  | 매장 ID        [____________]      |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | 사용자명       [____________]      |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | 비밀번호       [____________]      |  |
|  +------------------------------------+  |
|                                          |
|  [        로그인        ]                |
|                                          |
|  (에러 메시지 영역)                      |
+------------------------------------------+
```

#### 상태 관리: AuthContext
```typescript
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  storeInfo: StoreInfo | null;
  loading: boolean;
}

interface StoreInfo {
  storeId: number;
  storeName: string;
  username: string;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; refreshToken: string; storeInfo: StoreInfo } }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: { token: string } }
  | { type: 'SET_LOADING'; payload: boolean };
```

#### API 연동
| 동작 | API | Request | Response |
|------|-----|---------|----------|
| 로그인 | POST `/api/auth/admin/login` | `{ storeId, username, password }` | `{ token, refreshToken, storeInfo }` |
| 토큰 갱신 | POST `/api/auth/refresh` | `{ refreshToken }` | `{ token }` |
| 로그아웃 | POST `/api/auth/logout` | `{ token }` | `void` |

#### 비즈니스 로직
- localStorage에 token, refreshToken, storeInfo 저장
- 앱 시작 시 localStorage에서 토큰 복원 → 유효성 확인
- 토큰 만료(16시간) 시 자동 로그아웃 + `/login` 리다이렉트
- 로그인 실패 시 서버 에러 메시지 표시 (시도 제한 포함)
- Axios 인터셉터: 401 응답 시 refreshToken으로 갱신 시도 → 실패 시 로그아웃

---

### 3.2 Dashboard Feature (US-A02, US-A04, US-A05)

#### 화면: DashboardPage
```
+----------------------------------------------------------+
| [Sidebar]  |  주문 모니터링 대시보드                      |
|            |                                              |
| 대시보드   |  +--------+ +--------+ +--------+ +--------+|
| 테이블관리 |  |Table 1 | |Table 2 | |Table 3 | |Table 4 ||
| 메뉴관리   |  |        | |        | |        | |        ||
|            |  |₩45,000 | |  빈자리 | |₩12,000 | |₩28,000 ||
| [로그아웃] |  |주문 2건 | |        | |주문 1건 | |주문 3건 ||
|            |  +--------+ +--------+ +--------+ +--------+|
|            |                                              |
|            |  +--------+ +--------+                      |
|            |  |Table 5 | |Table 6 |                      |
|            |  |₩8,000  | |  빈자리 |                      |
|            |  |주문 1건 | |        |                      |
|            |  +--------+ +--------+                      |
+----------------------------------------------------------+
```

#### 화면: OrderDetailModal (테이블 카드 클릭 시)
```
+------------------------------------------+
|  테이블 3 - 주문 상세            [X]     |
|                                          |
|  주문 #001 (12:30)  상태: [대기중 ▼]    |
|  - 김치찌개 x2     ₩18,000              |
|  - 콜라 x1         ₩2,000               |
|                     [삭제]               |
|  ----------------------------------------|
|  주문 #002 (12:45)  상태: [준비중 ▼]    |
|  - 된장찌개 x1     ₩9,000               |
|                     [삭제]               |
|  ----------------------------------------|
|  총 주문액: ₩29,000                     |
|                                          |
|  [이용 완료]                             |
+------------------------------------------+
```

#### 상태 관리: useDashboard hook
```typescript
interface DashboardState {
  tables: TableDashboardItem[];
  loading: boolean;
  error: string | null;
}

interface TableDashboardItem {
  tableId: number;
  tableNumber: number;
  sessionStatus: 'ACTIVE' | 'EMPTY';
  totalAmount: number;
  orders: OrderSummary[];
}

interface OrderSummary {
  orderId: number;
  orderNumber: string;
  items: OrderItemSummary[];
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
  createdAt: string;
}

interface OrderItemSummary {
  menuName: string;
  quantity: number;
  price: number;
}
```

#### SSE 연동: useSSE hook
```typescript
interface UseSSEReturn {
  isConnected: boolean;
  lastEvent: SseEvent | null;
  reconnectCount: number;
}

// SSE 이벤트 수신 시 DashboardState 자동 업데이트:
// NEW_ORDER → 해당 테이블에 주문 추가 + totalAmount 재계산
// ORDER_STATUS_CHANGED → 해당 주문 status 업데이트
// ORDER_DELETED → 해당 주문 제거 + totalAmount = newTableTotal
// SESSION_COMPLETED → 해당 테이블 리셋 (orders=[], totalAmount=0, status=EMPTY)
// HEARTBEAT → 연결 상태 확인 (UI 변경 없음)
```

#### API 연동
| 동작 | API | Request | Response |
|------|-----|---------|----------|
| 초기 로드 | GET `/api/admin/dashboard` | - | `DashboardResponse` |
| SSE 구독 | GET `/api/admin/sse/subscribe` | - | EventStream |
| 상태 변경 | PUT `/api/admin/orders/{orderId}/status` | `{ status }` | `OrderResponse` |
| 주문 삭제 | DELETE `/api/admin/orders/{orderId}` | - | `void` |
| 이용 완료 | POST `/api/admin/tables/{tableId}/complete-session` | - | `void` |

#### 비즈니스 로직
- 페이지 진입 시: REST로 초기 데이터 로드 → SSE 연결 수립
- SSE 이벤트 수신 시 로컬 상태 즉시 업데이트 (서버 재조회 없음)
- 신규 주문 시 해당 테이블 카드 하이라이트 (2초간 배경색 변경)
- 주문 상태 변경: PENDING → PREPARING → COMPLETED (순방향만 허용)
- 주문 삭제: 확인 다이얼로그 → 삭제 → SSE로 totalAmount 업데이트
- 이용 완료: 확인 다이얼로그 → 세션 종료 → 테이블 카드 리셋
- SSE 연결 끊김 시: 3초 후 자동 재연결, 최대 5회, 실패 시 "연결 끊김" 배너 표시

---

### 3.3 Table Management Feature (US-A03, US-A05, US-A06)

#### 화면: TableManagementPage
```
+----------------------------------------------------------+
| [Sidebar]  |  테이블 관리                                 |
|            |                                              |
|            |  [+ 테이블 추가]                             |
|            |                                              |
|            |  +------------------------------------------+|
|            |  | # | 테이블번호 | 상태   | 액션           ||
|            |  |---|-----------|--------|----------------||
|            |  | 1 | 1번       | 이용중 | [완료][내역]   ||
|            |  | 2 | 2번       | 빈자리 | [수정][삭제]   ||
|            |  | 3 | 3번       | 이용중 | [완료][내역]   ||
|            |  +------------------------------------------+|
+----------------------------------------------------------+
```

#### 화면: TableSetupForm (추가/수정 모달)
```
+------------------------------------------+
|  테이블 추가                     [X]     |
|                                          |
|  테이블 번호  [____________]             |
|  비밀번호     [____________]             |
|  비밀번호 확인 [____________]            |
|                                          |
|  [취소]  [저장]                          |
+------------------------------------------+
```

#### 화면: OrderHistoryModal (과거 내역)
```
+------------------------------------------+
|  테이블 1 - 과거 주문 내역       [X]     |
|                                          |
|  기간: [2026-05-01] ~ [2026-05-06]       |
|                                          |
|  세션 1 (05-06 09:00 ~ 12:30)           |
|  - 주문#001: 김치찌개x2, 콜라x1 ₩20,000 |
|  - 주문#002: 된장찌개x1         ₩9,000  |
|  세션 합계: ₩29,000                     |
|                                          |
|  세션 2 (05-05 18:00 ~ 21:00)           |
|  - 주문#003: 비빔밥x3          ₩27,000  |
|  세션 합계: ₩27,000                     |
|                                          |
|  [닫기]                                  |
+------------------------------------------+
```

#### 상태 관리: useTableManagement hook
```typescript
interface TableManagementState {
  tables: TableInfo[];
  loading: boolean;
  error: string | null;
}

interface TableInfo {
  tableId: number;
  tableNumber: number;
  password?: string;
  sessionStatus: 'ACTIVE' | 'EMPTY';
  createdAt: string;
}
```

#### API 연동
| 동작 | API | Request | Response |
|------|-----|---------|----------|
| 목록 조회 | GET `/api/admin/tables` | - | `TableInfo[]` |
| 테이블 생성 | POST `/api/admin/tables` | `{ tableNumber, password }` | `TableInfo` |
| 테이블 수정 | PUT `/api/admin/tables/{tableId}` | `{ tableNumber?, password? }` | `TableInfo` |
| 테이블 삭제 | DELETE `/api/admin/tables/{tableId}` | - | `void` |
| 이용 완료 | POST `/api/admin/tables/{tableId}/complete-session` | - | `void` |
| 과거 내역 | GET `/api/admin/tables/{tableId}/history?from=&to=` | - | `OrderHistory[]` |

#### 비즈니스 로직
- 이용중인 테이블은 삭제 불가 (이용 완료 후에만 삭제 가능)
- 테이블 번호 중복 검증 (프론트 + 서버)
- 비밀번호: 최소 4자리 (태블릿 기기 잠금용)
- 과거 내역: 날짜 범위 필터, 세션 단위로 그룹핑

---

### 3.4 Menu Management Feature (US-A07)

#### 화면: MenuManagementPage
```
+----------------------------------------------------------+
| [Sidebar]  |  메뉴 관리                                   |
|            |                                              |
|            |  카테고리: [전체|한식|음료|디저트] [+카테고리]|
|            |                                              |
|            |  [+ 메뉴 추가]                               |
|            |                                              |
|            |  +------------------------------------------+|
|            |  | ≡ | 이미지 | 메뉴명   | 가격   | 액션   ||
|            |  |---|--------|---------|--------|--------||
|            |  | ≡ | [img]  | 김치찌개 | ₩9,000 | [✏][🗑]||
|            |  | ≡ | [img]  | 된장찌개 | ₩9,000 | [✏][🗑]||
|            |  | ≡ | [img]  | 비빔밥   | ₩8,000 | [✏][🗑]||
|            |  +------------------------------------------+|
|            |  (≡ 드래그로 순서 변경)                      |
+----------------------------------------------------------+
```

#### 화면: MenuForm (추가/수정 모달)
```
+------------------------------------------+
|  메뉴 등록                       [X]     |
|                                          |
|  메뉴명      [____________]              |
|  가격        [____________] 원           |
|  설명        [________________________]  |
|              [________________________]  |
|  카테고리    [한식        ▼]             |
|  이미지      [파일 선택]                 |
|              [미리보기 영역]             |
|                                          |
|  [취소]  [저장]                          |
+------------------------------------------+
```

#### 화면: CategoryManager (카테고리 관리 모달)
```
+------------------------------------------+
|  카테고리 관리                    [X]     |
|                                          |
|  +------------------------------------+  |
|  | ≡ | 한식     | [✏][🗑]            |  |
|  | ≡ | 음료     | [✏][🗑]            |  |
|  | ≡ | 디저트   | [✏][🗑]            |  |
|  +------------------------------------+  |
|                                          |
|  새 카테고리: [__________] [추가]        |
+------------------------------------------+
```

#### 상태 관리: useMenuManagement hook
```typescript
interface MenuManagementState {
  menus: MenuItem[];
  categories: Category[];
  selectedCategoryId: number | null;
  loading: boolean;
  error: string | null;
}

interface MenuItem {
  menuId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
}

interface Category {
  categoryId: number;
  name: string;
  displayOrder: number;
  menuCount: number;
}
```

#### API 연동
| 동작 | API | Request | Response |
|------|-----|---------|----------|
| 메뉴 목록 | GET `/api/stores/{storeId}/menus` | - | `MenuItem[]` |
| 메뉴 생성 | POST `/api/admin/menus` | `FormData (name, price, description, categoryId, image?)` | `MenuItem` |
| 메뉴 수정 | PUT `/api/admin/menus/{menuId}` | `FormData (name?, price?, description?, categoryId?, image?)` | `MenuItem` |
| 메뉴 삭제 | DELETE `/api/admin/menus/{menuId}` | - | `void` |
| 메뉴 순서 | PUT `/api/admin/menus/order` | `[{ menuId, displayOrder }]` | `void` |
| 카테고리 목록 | GET `/api/stores/{storeId}/categories` | - | `Category[]` |
| 카테고리 생성 | POST `/api/admin/categories` | `{ name }` | `Category` |
| 카테고리 수정 | PUT `/api/admin/categories/{categoryId}` | `{ name }` | `Category` |
| 카테고리 삭제 | DELETE `/api/admin/categories/{categoryId}` | - | `void` |
| 카테고리 순서 | PUT `/api/admin/categories/order` | `[{ categoryId, displayOrder }]` | `void` |
| 이미지 업로드 | POST `/api/admin/files/upload` | `FormData (file)` | `{ url, filename }` |

#### 비즈니스 로직
- 이미지 업로드: jpg/png/webp만 허용, 5MB 이하, 미리보기 표시
- 메뉴 순서 변경: 드래그 앤 드롭 → 변경된 순서 일괄 저장
- 카테고리 삭제: 소속 메뉴가 있으면 삭제 불가 (서버 검증)
- 가격 검증: 0 이상 정수, 최대 1,000,000원
- 필수 필드: 메뉴명, 가격, 카테고리

---

## 4. 공통 컴포넌트 설계

### 4.1 레이아웃
```typescript
// AdminLayout: Sidebar + Content 영역
// - Sidebar: 네비게이션 (대시보드, 테이블관리, 메뉴관리) + 로그아웃
// - Header: 현재 페이지 제목 + SSE 연결 상태 표시
// - Content: 라우트별 페이지 렌더링
```

### 4.2 공통 UI 컴포넌트
| 컴포넌트 | 용도 |
|----------|------|
| `ConfirmDialog` | 삭제/이용완료 등 위험 동작 확인 |
| `Toast` | 성공/실패 알림 (3초 자동 닫힘) |
| `Loading` | 데이터 로딩 스피너 |
| `ErrorMessage` | 에러 상태 표시 |
| `StatusBadge` | 주문 상태 배지 (색상 구분) |
| `Pagination` | 과거 내역 페이지네이션 |

### 4.3 API Client (Axios)
```typescript
// 기본 설정
// - baseURL: VITE_API_URL 환경변수 (기본: '/api')
// - timeout: 10초
// - Content-Type: application/json

// Request 인터셉터
// - Authorization: Bearer <token> 자동 첨부

// Response 인터셉터
// - 401: refreshToken으로 갱신 시도 → 실패 시 로그아웃
// - 403: "권한 없음" 토스트
// - 500: "서버 오류" 토스트
```

### 4.4 SSE Client
```typescript
// EventSource 래퍼
// - URL: /api/admin/sse/subscribe
// - 인증: URL 파라미터로 token 전달 (EventSource는 헤더 미지원)
//   또는 쿠키 기반 인증 대안
// - 자동 재연결: 연결 끊김 시 3초 후 재시도, 최대 5회
// - 이벤트 리스너: NEW_ORDER, ORDER_STATUS_CHANGED, ORDER_DELETED, SESSION_COMPLETED, HEARTBEAT
// - 연결 상태: connected / disconnected / reconnecting
```

---

## 5. 타입 정의 (공통)

```typescript
// API 응답 래퍼
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; fields?: Record<string, string> };
  timestamp: string;
}

// 주문 상태
type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

// SSE 이벤트
type SseEventType = 'NEW_ORDER' | 'ORDER_STATUS_CHANGED' | 'ORDER_DELETED' | 'SESSION_COMPLETED' | 'HEARTBEAT';

interface SseEvent {
  type: SseEventType;
  data: NewOrderEvent | OrderStatusChangedEvent | OrderDeletedEvent | SessionCompletedEvent | HeartbeatEvent;
}

interface NewOrderEvent {
  tableId: number;
  tableNumber: number;
  order: OrderSummary;
}

interface OrderStatusChangedEvent {
  tableId: number;
  orderId: number;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
}

interface OrderDeletedEvent {
  tableId: number;
  orderId: number;
  newTableTotal: number;
}

interface SessionCompletedEvent {
  tableId: number;
  tableNumber: number;
  completedAt: string;
}

interface HeartbeatEvent {
  timestamp: string;
}
```

---

## 6. Mock 데이터 구조

### MSW Handler 구성
```
src/mocks/
├── browser.ts          # MSW 브라우저 워커 설정
├── handlers/
│   ├── auth.ts         # 로그인/로그아웃 Mock
│   ├── dashboard.ts    # 대시보드 데이터 Mock
│   ├── tables.ts       # 테이블 CRUD Mock
│   ├── menus.ts        # 메뉴 CRUD Mock
│   ├── categories.ts   # 카테고리 CRUD Mock
│   ├── files.ts        # 파일 업로드 Mock
│   └── index.ts        # 핸들러 통합
├── sse-mock.ts         # SSE 이벤트 시뮬레이터 (setInterval 기반)
└── data.ts             # Mock 초기 데이터
```

### Mock 초기 데이터 예시
```typescript
// 테이블 6개, 카테고리 3개, 메뉴 12개, 활성 주문 8건
const mockTables = [
  { tableId: 1, tableNumber: 1, sessionStatus: 'ACTIVE', totalAmount: 45000, orders: [...] },
  { tableId: 2, tableNumber: 2, sessionStatus: 'EMPTY', totalAmount: 0, orders: [] },
  // ...
];
```

---

## 7. 화면 전환 흐름 (User Journey)

```
[앱 시작]
    |
    v
[localStorage 토큰 확인]
    |
    ├── 토큰 없음/만료 → /login → 로그인 성공 → /dashboard
    |
    └── 토큰 유효 → /dashboard
                        |
                        ├── Sidebar "테이블관리" → /tables
                        ├── Sidebar "메뉴관리" → /menus
                        └── Sidebar "로그아웃" → /login
```

---

## 8. 에러 처리 전략

| 상황 | 처리 |
|------|------|
| 네트워크 오류 | Toast "네트워크 연결을 확인해주세요" |
| 401 Unauthorized | 토큰 갱신 시도 → 실패 시 로그아웃 |
| 403 Forbidden | Toast "권한이 없습니다" |
| 404 Not Found | Toast "데이터를 찾을 수 없습니다" |
| 409 Conflict | Toast 서버 메시지 표시 (예: "메뉴가 있는 카테고리는 삭제 불가") |
| 422 Validation | 폼 필드별 에러 메시지 표시 |
| 500 Server Error | Toast "서버 오류가 발생했습니다" |
| SSE 연결 끊김 | 상단 배너 "실시간 연결 끊김 - 재연결 중..." |

---

## 9. 접근성 (Accessibility)

- 모든 인터랙티브 요소: 최소 44x44px 터치 영역
- 폼 필드: label 연결, aria-describedby로 에러 메시지 연결
- 모달: focus trap, ESC로 닫기, aria-modal="true"
- 상태 변경 알림: aria-live="polite" 영역으로 스크린리더 알림
- 색상 대비: WCAG AA 기준 충족 (4.5:1 이상)
- 키보드 네비게이션: Tab 순서 논리적, Enter/Space로 동작 실행
