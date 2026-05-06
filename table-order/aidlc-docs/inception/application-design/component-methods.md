# 컴포넌트 메서드 정의 (Component Methods)

> **Note**: 상세 비즈니스 규칙은 Functional Design (CONSTRUCTION) 단계에서 정의됩니다.

---

## 1. 백엔드 컴포넌트 메서드

### 1.1 Auth Module

#### AuthController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `adminLogin()` | POST | `/api/auth/admin/login` | 관리자 로그인 |
| `tableLogin()` | POST | `/api/auth/table/login` | 테이블 태블릿 로그인 |
| `refreshToken()` | POST | `/api/auth/refresh` | 토큰 갱신 |
| `logout()` | POST | `/api/auth/logout` | 로그아웃 |

#### AuthService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `authenticateAdmin(AdminLoginRequest)` | 매장ID, 사용자명, 비밀번호 | TokenResponse | 관리자 인증 + 시도 제한 검사 |
| `authenticateTable(TableLoginRequest)` | 매장ID, 테이블번호, 비밀번호 | TokenResponse | 테이블 인증 |
| `refreshToken(String refreshToken)` | 리프레시 토큰 | TokenResponse | 토큰 갱신 |
| `logout(String token)` | 토큰 | void | 토큰 무효화 |

#### JwtTokenProvider
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `generateToken(UserPrincipal)` | 사용자 정보 | String | Access Token 생성 |
| `generateRefreshToken(UserPrincipal)` | 사용자 정보 | String | Refresh Token 생성 |
| `validateToken(String token)` | JWT 토큰 | boolean | 토큰 유효성 검증 |
| `getUserPrincipal(String token)` | JWT 토큰 | UserPrincipal | 토큰에서 사용자 정보 추출 |

#### LoginAttemptService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `recordFailedAttempt(String key)` | 로그인 키 | void | 실패 기록 |
| `isBlocked(String key)` | 로그인 키 | boolean | 차단 여부 확인 |
| `resetAttempts(String key)` | 로그인 키 | void | 성공 시 초기화 |

### 1.2 Store Module

#### StoreController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `getStore()` | GET | `/api/stores/{storeId}` | 매장 정보 조회 |

#### StoreService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `getStoreById(Long storeId)` | 매장 ID | StoreResponse | 매장 정보 조회 |
| `validateStoreExists(Long storeId)` | 매장 ID | Store | 매장 존재 검증 (내부용) |

### 1.3 Table Module

#### TableController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `createTable()` | POST | `/api/admin/tables` | 테이블 생성 |
| `getTables()` | GET | `/api/admin/tables` | 테이블 목록 조회 |
| `getTable()` | GET | `/api/admin/tables/{tableId}` | 테이블 상세 조회 |
| `updateTable()` | PUT | `/api/admin/tables/{tableId}` | 테이블 수정 |
| `deleteTable()` | DELETE | `/api/admin/tables/{tableId}` | 테이블 삭제 |
| `completeSession()` | POST | `/api/admin/tables/{tableId}/complete-session` | 이용 완료 처리 |
| `getDashboardData()` | GET | `/api/admin/dashboard` | 대시보드 초기 데이터 |

#### TableService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `createTable(TableCreateRequest)` | 테이블번호, 비밀번호 | TableResponse | 테이블 생성 |
| `getTablesByStore(Long storeId)` | 매장 ID | List\<TableResponse\> | 매장 테이블 목록 |
| `getTableById(Long tableId)` | 테이블 ID | TableResponse | 테이블 상세 |
| `updateTable(Long tableId, TableUpdateRequest)` | 테이블 ID, 수정 정보 | TableResponse | 테이블 수정 |
| `deleteTable(Long tableId)` | 테이블 ID | void | 테이블 삭제 |
| `getDashboardData(Long storeId)` | 매장 ID | DashboardResponse | 전체 테이블+주문 현황 |

#### TableSessionService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `getOrCreateSession(Long tableId)` | 테이블 ID | TableSession | 현재 세션 조회 또는 신규 생성 |
| `getCurrentSession(Long tableId)` | 테이블 ID | Optional\<TableSession\> | 현재 활성 세션 조회 |
| `completeSession(Long tableId)` | 테이블 ID | void | 세션 종료 (이용 완료) |
| `isSessionActive(Long tableId)` | 테이블 ID | boolean | 세션 활성 여부 |

### 1.4 Menu Module

#### MenuController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `getMenusByStore()` | GET | `/api/stores/{storeId}/menus` | 메뉴 목록 조회 (고객용) |
| `createMenu()` | POST | `/api/admin/menus` | 메뉴 등록 |
| `updateMenu()` | PUT | `/api/admin/menus/{menuId}` | 메뉴 수정 |
| `deleteMenu()` | DELETE | `/api/admin/menus/{menuId}` | 메뉴 삭제 |
| `updateMenuOrder()` | PUT | `/api/admin/menus/order` | 메뉴 순서 변경 |

#### CategoryController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `getCategories()` | GET | `/api/stores/{storeId}/categories` | 카테고리 목록 (고객용) |
| `createCategory()` | POST | `/api/admin/categories` | 카테고리 생성 |
| `updateCategory()` | PUT | `/api/admin/categories/{categoryId}` | 카테고리 수정 |
| `deleteCategory()` | DELETE | `/api/admin/categories/{categoryId}` | 카테고리 삭제 |
| `updateCategoryOrder()` | PUT | `/api/admin/categories/order` | 카테고리 순서 변경 |

#### MenuService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `getMenusByStore(Long storeId)` | 매장 ID | List\<MenuResponse\> | 카테고리별 메뉴 목록 |
| `createMenu(MenuCreateRequest)` | 메뉴 정보 | MenuResponse | 메뉴 생성 |
| `updateMenu(Long menuId, MenuUpdateRequest)` | 메뉴 ID, 수정 정보 | MenuResponse | 메뉴 수정 |
| `deleteMenu(Long menuId)` | 메뉴 ID | void | 메뉴 삭제 (이미지도 삭제) |
| `updateMenuOrder(List\<MenuOrderRequest\>)` | 순서 목록 | void | 순서 변경 |

#### CategoryService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `getCategoriesByStore(Long storeId)` | 매장 ID | List\<CategoryResponse\> | 카테고리 목록 |
| `createCategory(CategoryCreateRequest)` | 카테고리 정보 | CategoryResponse | 카테고리 생성 |
| `updateCategory(Long id, CategoryUpdateRequest)` | ID, 수정 정보 | CategoryResponse | 카테고리 수정 |
| `deleteCategory(Long id)` | 카테고리 ID | void | 카테고리 삭제 |
| `updateCategoryOrder(List\<CategoryOrderRequest\>)` | 순서 목록 | void | 순서 변경 |

### 1.5 Order Module

#### OrderController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `createOrder()` | POST | `/api/orders` | 주문 생성 (고객) |
| `getOrdersBySession()` | GET | `/api/orders/current` | 현재 세션 주문 조회 (고객) |
| `getActiveOrdersByTable()` | GET | `/api/admin/tables/{tableId}/orders` | 테이블 활성 주문 (관리자) |
| `updateOrderStatus()` | PUT | `/api/admin/orders/{orderId}/status` | 주문 상태 변경 |
| `deleteOrder()` | DELETE | `/api/admin/orders/{orderId}` | 주문 삭제 |
| `getOrderHistory()` | GET | `/api/admin/tables/{tableId}/history` | 과거 주문 내역 |

#### OrderService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `createOrder(OrderCreateRequest, UserPrincipal)` | 주문 정보, 인증 정보 | OrderResponse | 주문 생성 + 세션 자동 시작 |
| `getOrdersBySession(Long sessionId)` | 세션 ID | List\<OrderResponse\> | 현재 세션 주문 목록 |
| `getActiveOrdersByTable(Long tableId)` | 테이블 ID | List\<OrderResponse\> | 활성 세션 주문 목록 |
| `updateOrderStatus(Long orderId, OrderStatus)` | 주문 ID, 상태 | OrderResponse | 상태 변경 + SSE 발행 |
| `deleteOrder(Long orderId)` | 주문 ID | void | 주문 삭제 + SSE 발행 |
| `getOrderHistory(Long tableId, LocalDate from, LocalDate to)` | 테이블 ID, 기간 | List\<OrderResponse\> | 완료된 세션의 주문 이력 |
| `calculateTableTotal(Long tableId)` | 테이블 ID | BigDecimal | 테이블 총 주문액 계산 |

### 1.6 SSE Module

#### SseController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `subscribe()` | GET | `/api/admin/sse/subscribe` | SSE 구독 |

#### SseService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `subscribe(Long storeId)` | 매장 ID | SseEmitter | SSE 연결 생성 (타임아웃: 30분) |
| `publishEvent(Long storeId, SseEventType, Object data)` | 매장 ID, 이벤트 타입, 데이터 | void | 이벤트 발행 |
| `removeEmitter(Long storeId, SseEmitter)` | 매장 ID, emitter | void | 연결 해제 |
| `sendHeartbeat()` | - | void | 30초 주기 heartbeat (스케줄러) |

#### SseEventType (Enum)
| 값 | 설명 |
|----|------|
| `NEW_ORDER` | 신규 주문 발생 |
| `ORDER_STATUS_CHANGED` | 주문 상태 변경 |
| `ORDER_DELETED` | 주문 삭제 |
| `SESSION_COMPLETED` | 테이블 이용 완료 |
| `HEARTBEAT` | 연결 유지 |

### 1.7 File Module

#### FileController
| 메서드 | HTTP | 경로 | 설명 |
|--------|------|------|------|
| `uploadImage()` | POST | `/api/admin/files/upload` | 이미지 업로드 |
| `getImage()` | GET | `/api/files/images/{filename}` | 이미지 조회 |
| `deleteImage()` | DELETE | `/api/admin/files/{filename}` | 이미지 삭제 |

#### FileService
| 메서드 | Input | Output | 설명 |
|--------|-------|--------|------|
| `uploadImage(MultipartFile)` | 파일 | FileUploadResponse (url, filename) | 이미지 저장 (형식/크기 검증) |
| `deleteImage(String filename)` | 파일명 | void | 이미지 삭제 |
| `validateImageFile(MultipartFile)` | 파일 | void | 파일 검증 (형식: jpg/png/webp, 크기: 5MB 이하) |

---

## 2. 프론트엔드 주요 인터페이스

### 2.1 고객용 앱 - 주요 Hook/Context

| Hook/Context | 책임 | 주요 인터페이스 |
|--------------|------|-----------------|
| `AuthContext` | 인증 상태 관리 | `isAuthenticated`, `tableInfo`, `sessionId`, `token`, `setupTable()` |
| `useMenu(storeId)` | 메뉴 데이터 조회 | `menus`, `categories`, `selectedCategory`, `setCategory()`, `loading`, `error` |
| `CartContext` | 장바구니 상태 (localStorage 영속화) | `items`, `addItem(menu)`, `removeItem(menuId)`, `updateQuantity(menuId, qty)`, `clearCart()`, `totalAmount`, `itemCount` |
| `useOrder()` | 주문 생성/조회 | `createOrder(items)`, `orders`, `loading`, `error`, `refetch()` |

### 2.2 관리자용 앱 - 주요 Hook/Context

| Hook/Context | 책임 | 주요 인터페이스 |
|--------------|------|-----------------|
| `AuthContext` | 관리자 인증 | `login(credentials)`, `logout()`, `isAuthenticated`, `token`, `storeInfo` |
| `useSSE(storeId)` | SSE 연결 관리 (자동 재연결) | `isConnected`, `lastEvent`, `subscribe()`, `unsubscribe()` |
| `useDashboard(storeId)` | 대시보드 데이터 (REST + SSE) | `tables`, `updateOrderStatus(orderId, status)`, `deleteOrder(orderId)`, `loading` |
| `useMenuManagement(storeId)` | 메뉴 CRUD | `menus`, `create(data)`, `update(id, data)`, `delete(id)`, `reorder(items)`, `loading` |
| `useCategoryManagement(storeId)` | 카테고리 CRUD | `categories`, `create(data)`, `update(id, data)`, `delete(id)`, `reorder(items)` |
| `useTableManagement(storeId)` | 테이블 관리 | `tables`, `create(data)`, `completeSession(tableId)`, `getHistory(tableId, dateRange)` |
