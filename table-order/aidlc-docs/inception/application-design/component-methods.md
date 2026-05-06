# 컴포넌트 메서드 정의 (Component Methods)

> **Note**: 상세 비즈니스 규칙은 Functional Design (CONSTRUCTION) 단계에서 정의됩니다.

---

## 1. 백엔드 컴포넌트 메서드

### 1.1 Auth Module

#### AuthController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `adminLogin()` | POST | `/api/admin/login` | 관리자 로그인 |
| `tableLogin()` | POST | `/api/table/login` | 테이블 태블릿 로그인 |
| `refreshToken()` | POST | `/api/auth/refresh` | 토큰 갱신 |

#### AuthService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `authenticateAdmin(LoginRequest)` | 매장ID, 사용자명, 비밀번호 | TokenResponse | 관리자 인증 |
| `authenticateTable(TableLoginRequest)` | 매장ID, 테이블번호, 비밀번호 | TokenResponse | 테이블 인증 |
| `validateToken(String token)` | JWT 토큰 | UserPrincipal | 토큰 검증 |

### 1.2 Store Module

#### StoreController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `getStore()` | GET | `/api/stores/{storeId}` | 매장 정보 조회 |

#### StoreService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `getStoreById(Long storeId)` | 매장 ID | StoreResponse | 매장 정보 조회 |

### 1.3 Table Module

#### TableController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `setupTable()` | POST | `/api/admin/tables` | 테이블 초기 설정 |
| `getTables()` | GET | `/api/admin/tables` | 테이블 목록 조회 |
| `completeSession()` | POST | `/api/admin/tables/{tableId}/complete` | 이용 완료 처리 |

#### TableService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `setupTable(TableSetupRequest)` | 테이블번호, 비밀번호 | TableResponse | 테이블 설정 |
| `getTablesByStore(Long storeId)` | 매장 ID | List\<TableResponse\> | 매장 테이블 목록 |
| `completeSession(Long tableId)` | 테이블 ID | void | 세션 종료 |
| `getCurrentSession(Long tableId)` | 테이블 ID | TableSessionResponse | 현재 세션 조회 |

### 1.4 Menu Module

#### MenuController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `getMenusByStore()` | GET | `/api/stores/{storeId}/menus` | 메뉴 목록 조회 |
| `createMenu()` | POST | `/api/admin/menus` | 메뉴 등록 |
| `updateMenu()` | PUT | `/api/admin/menus/{menuId}` | 메뉴 수정 |
| `deleteMenu()` | DELETE | `/api/admin/menus/{menuId}` | 메뉴 삭제 |
| `updateMenuOrder()` | PUT | `/api/admin/menus/order` | 메뉴 순서 변경 |
| `getCategories()` | GET | `/api/stores/{storeId}/categories` | 카테고리 목록 |

#### MenuService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `getMenusByStore(Long storeId)` | 매장 ID | List\<MenuResponse\> | 메뉴 목록 |
| `createMenu(MenuCreateRequest)` | 메뉴 정보 | MenuResponse | 메뉴 생성 |
| `updateMenu(Long menuId, MenuUpdateRequest)` | 메뉴 ID, 수정 정보 | MenuResponse | 메뉴 수정 |
| `deleteMenu(Long menuId)` | 메뉴 ID | void | 메뉴 삭제 |
| `updateMenuOrder(List\<MenuOrderRequest\>)` | 순서 목록 | void | 순서 변경 |

### 1.5 Order Module

#### OrderController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `createOrder()` | POST | `/api/orders` | 주문 생성 |
| `getOrdersBySession()` | GET | `/api/orders/session/{sessionId}` | 세션별 주문 조회 |
| `getOrdersByTable()` | GET | `/api/admin/tables/{tableId}/orders` | 테이블별 주문 조회 |
| `updateOrderStatus()` | PUT | `/api/admin/orders/{orderId}/status` | 주문 상태 변경 |
| `deleteOrder()` | DELETE | `/api/admin/orders/{orderId}` | 주문 삭제 |
| `getOrderHistory()` | GET | `/api/admin/tables/{tableId}/history` | 과거 주문 내역 |

#### OrderService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `createOrder(OrderCreateRequest)` | 주문 정보 | OrderResponse | 주문 생성 |
| `getOrdersBySession(Long sessionId)` | 세션 ID | List\<OrderResponse\> | 세션 주문 목록 |
| `getOrdersByTable(Long tableId)` | 테이블 ID | List\<OrderResponse\> | 테이블 주문 목록 |
| `updateOrderStatus(Long orderId, OrderStatus)` | 주문 ID, 상태 | OrderResponse | 상태 변경 |
| `deleteOrder(Long orderId)` | 주문 ID | void | 주문 삭제 |
| `getOrderHistory(Long tableId, LocalDate date)` | 테이블 ID, 날짜 | List\<OrderHistoryResponse\> | 과거 내역 |

### 1.6 SSE Module

#### SseController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `subscribe()` | GET | `/api/admin/sse/subscribe` | SSE 구독 |

#### SseService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `subscribe(Long storeId)` | 매장 ID | SseEmitter | SSE 연결 생성 |
| `publishOrderEvent(Long storeId, OrderEvent)` | 매장 ID, 이벤트 | void | 주문 이벤트 발행 |
| `publishStatusChange(Long storeId, StatusEvent)` | 매장 ID, 이벤트 | void | 상태 변경 발행 |

### 1.7 File Module

#### FileController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `uploadImage()` | POST | `/api/admin/files/upload` | 이미지 업로드 |
| `getImage()` | GET | `/api/files/{filename}` | 이미지 조회 |

#### FileService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `uploadImage(MultipartFile)` | 파일 | String (URL) | 이미지 저장 |
| `deleteImage(String filename)` | 파일명 | void | 이미지 삭제 |

---

## 2. 프론트엔드 주요 인터페이스

### 2.1 고객용 앱 - 주요 Hook/Context

| Hook/Context | 책임 | 주요 메서드 |
|--------------|------|-------------|
| `AuthContext` | 인증 상태 관리 | `isAuthenticated`, `tableInfo`, `sessionId` |
| `useMenu()` | 메뉴 데이터 조회 | `menus`, `categories`, `loading` |
| `CartContext` | 장바구니 상태 | `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalAmount` |
| `useOrder()` | 주문 생성/조회 | `createOrder`, `getOrders`, `orders` |

### 2.2 관리자용 앱 - 주요 Hook/Context

| Hook/Context | 책임 | 주요 메서드 |
|--------------|------|-------------|
| `AuthContext` | 관리자 인증 | `login`, `logout`, `isAuthenticated`, `token` |
| `useSSE()` | SSE 연결 관리 | `connect`, `disconnect`, `onOrderEvent` |
| `useDashboard()` | 대시보드 데이터 | `tables`, `orders`, `updateStatus` |
| `useMenuManagement()` | 메뉴 CRUD | `create`, `update`, `delete`, `reorder` |
| `useTableManagement()` | 테이블 관리 | `setup`, `completeSession`, `getHistory` |
