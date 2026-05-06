# 컴포넌트 정의 (Components)

---

## 1. 백엔드 컴포넌트 (Spring Boot - Java)

### 1.1 Auth Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.auth` |
| **책임** | 인증/인가 처리, JWT 토큰 관리 |
| **주요 기능** | 관리자 로그인, 테이블 태블릿 인증, 토큰 발급/검증, 로그인 시도 제한 |
| **핵심 클래스** | AuthController, AuthService, JwtTokenProvider, LoginAttemptService |

### 1.2 Store Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.store` |
| **책임** | 매장 정보 관리 |
| **주요 기능** | 매장 조회 |
| **핵심 클래스** | StoreController, StoreService, StoreRepository |

### 1.3 Table Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.table` |
| **책임** | 테이블 관리, 테이블 세션 라이프사이클 |
| **주요 기능** | 테이블 CRUD, 세션 시작/종료, 이용 완료 처리 |
| **핵심 클래스** | TableController, TableService, TableSessionService, TableRepository, TableSessionRepository |
| **설계 포인트** | TableSessionService를 분리하여 세션 로직 독립 관리 (순환 의존 방지) |

### 1.4 Menu Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.menu` |
| **책임** | 메뉴 및 카테고리 CRUD, 이미지 관리 |
| **주요 기능** | 메뉴 등록/수정/삭제/조회, 카테고리 CRUD, 메뉴 순서 조정 |
| **핵심 클래스** | MenuController, CategoryController, MenuService, CategoryService |

### 1.5 Order Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.order` |
| **책임** | 주문 생성, 상태 관리, 주문 내역 조회/이력 관리 |
| **주요 기능** | 주문 생성(세션 자동 시작 포함), 상태 변경, 주문 삭제, 이력 조회 |
| **핵심 클래스** | OrderController, OrderService, OrderRepository |
| **설계 포인트** | 이용 완료 시 Order 레코드를 별도 테이블로 이동하지 않고, 세션 상태(active/completed)로 필터링 |

### 1.6 SSE Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.sse` |
| **책임** | Server-Sent Events 기반 실시간 알림 |
| **주요 기능** | SSE 연결 관리, 주문/상태 이벤트 발행, 연결 해제 처리, heartbeat |
| **핵심 클래스** | SseController, SseService, SseEmitterRepository |
| **설계 포인트** | 30초 heartbeat로 연결 유지, 타임아웃 시 자동 정리, 클라이언트 재연결 지원 |

### 1.7 File Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.file` |
| **책임** | 파일 업로드/다운로드 관리 |
| **주요 기능** | 이미지 업로드(크기/형식 검증), 파일 서빙, 파일 삭제 |
| **핵심 클래스** | FileController, FileService |

### 1.8 Common Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.common` |
| **책임** | 공통 유틸리티, 예외 처리, 보안 설정, 감사 로깅 |
| **주요 기능** | 글로벌 예외 핸들러, Spring Security 설정, 공통 DTO/응답 형식, 입력 검증, 요청 로깅 |
| **핵심 클래스** | GlobalExceptionHandler, SecurityConfig, ApiResponse, BaseEntity |

---

## 2. 고객용 프론트엔드 컴포넌트 (React - TypeScript)

### 2.1 Auth (인증)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/auth/` |
| **책임** | 태블릿 자동 로그인, 인증 상태 관리, 초기 설정 |
| **주요 컴포넌트** | `TableSetup`, `AutoLogin`, `AuthProvider` |
| **상태** | `AuthContext` (tableInfo, sessionId, isAuthenticated, token) |

### 2.2 Menu (메뉴)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/menu/` |
| **책임** | 메뉴 조회 및 탐색, 카테고리 필터링 |
| **주요 컴포넌트** | `MenuPage`, `MenuGrid`, `MenuCard`, `MenuDetail`, `CategoryTabs` |
| **상태** | `useMenu()` hook (menus, categories, selectedCategory, loading) |

### 2.3 Cart (장바구니)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/cart/` |
| **책임** | 장바구니 CRUD, localStorage 영속화, 총액 계산 |
| **주요 컴포넌트** | `CartDrawer`, `CartItem`, `CartSummary`, `CartBadge` |
| **상태** | `CartContext` (items, addItem, removeItem, updateQuantity, clearCart, totalAmount, itemCount) |
| **설계 포인트** | localStorage 동기화로 새로고침 시에도 유지 |

### 2.4 Order (주문)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/order/` |
| **책임** | 주문 확정, 주문 성공 표시, 주문 내역 조회 |
| **주요 컴포넌트** | `OrderConfirmPage`, `OrderSuccessModal`, `OrderHistoryPage`, `OrderCard` |
| **상태** | `useOrder()` hook (createOrder, orders, loading, error) |

### 2.5 Common (공통)
| 항목 | 내용 |
|------|------|
| **경로** | `src/common/` |
| **책임** | 공통 UI, API 클라이언트, 레이아웃, 에러 처리 |
| **주요 컴포넌트** | `AppLayout`, `BottomNav`, `Loading`, `ErrorBoundary`, `Toast` |
| **유틸** | `apiClient` (Axios 인스턴스, 인터셉터, 토큰 자동 첨부) |

---

## 3. 관리자용 프론트엔드 컴포넌트 (React - TypeScript)

### 3.1 Auth (인증)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/auth/` |
| **책임** | 관리자 로그인, 세션 관리, 인증 가드 |
| **주요 컴포넌트** | `LoginPage`, `AuthProvider`, `AuthGuard` |
| **상태** | `AuthContext` (login, logout, isAuthenticated, token, storeInfo) |
| **설계 포인트** | 16시간 세션, localStorage에 토큰 저장, 만료 시 자동 로그아웃 |

### 3.2 Dashboard (대시보드)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/dashboard/` |
| **책임** | 실시간 주문 모니터링, 테이블별 그리드, 주문 상태 변경 |
| **주요 컴포넌트** | `DashboardPage`, `TableGrid`, `TableCard`, `OrderDetailModal`, `StatusBadge` |
| **상태** | `useDashboard()` hook + `useSSE()` hook |
| **설계 포인트** | 초기 로드 시 REST API로 현재 상태 fetch → 이후 SSE로 실시간 업데이트 |

### 3.3 Table Management (테이블 관리)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/table/` |
| **책임** | 테이블 설정, 세션 종료, 과거 내역 조회 |
| **주요 컴포넌트** | `TableManagementPage`, `TableSetupForm`, `SessionActions`, `OrderHistoryModal` |
| **상태** | `useTableManagement()` hook |

### 3.4 Menu Management (메뉴 관리)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/menu/` |
| **책임** | 메뉴 CRUD, 카테고리 관리, 순서 조정, 이미지 업로드 |
| **주요 컴포넌트** | `MenuManagementPage`, `MenuForm`, `MenuList`, `CategoryManager`, `DragOrderEditor`, `ImageUploader` |
| **상태** | `useMenuManagement()` hook, `useCategoryManagement()` hook |

### 3.5 Common (공통)
| 항목 | 내용 |
|------|------|
| **경로** | `src/common/` |
| **책임** | 공통 UI, API 클라이언트, SSE 클라이언트, 레이아웃 |
| **주요 컴포넌트** | `AdminLayout`, `Sidebar`, `Header`, `ConfirmDialog`, `Toast`, `Pagination` |
| **유틸** | `apiClient`, `sseClient` (EventSource 래퍼, 자동 재연결) |
| **설계 포인트** | SSE 클라이언트에 자동 재연결 로직 포함 (3초 후 재시도, 최대 5회) |
