# 컴포넌트 의존성 (Component Dependencies)

---

## 1. 백엔드 의존성 매트릭스

| 컴포넌트 | 의존 대상 | 의존 유형 |
|----------|-----------|-----------|
| AuthService | AdminRepository, TableRepository, JwtTokenProvider, PasswordEncoder, LoginAttemptService | 직접 의존 |
| StoreService | StoreRepository | 직접 의존 |
| TableService | TableRepository, TableSessionService, OrderService | 직접 의존 |
| TableSessionService | TableSessionRepository, SseService | 직접 의존 |
| MenuService | MenuRepository, CategoryRepository, FileService | 직접 의존 |
| CategoryService | CategoryRepository, MenuRepository | 직접 의존 |
| OrderService | OrderRepository, OrderItemRepository, TableSessionService, MenuRepository, SseService | 직접 의존 |
| SseService | (독립 - emitter 관리) | 없음 |
| FileService | (독립 - 파일 시스템) | 없음 |

### 의존성 방향 다이어그램 (순환 의존 없음)
```
+------------------+
|   AuthService    | (독립 - Repository만 의존)
+------------------+

+------------------+
|  StoreService    | (독립 - Repository만 의존)
+------------------+

+------------------+     +----------------------+
|  TableService    |---->| TableSessionService  |
+------------------+     +----------------------+
        |                         |
        v                         v
+------------------+     +------------------+
|  OrderService    |---->|    SseService    | (독립 - 의존 없음)
+------------------+     +------------------+
        |
        v
+------------------+
| TableSessionSvc  | (OrderService → TableSessionService, 단방향)
+------------------+

+------------------+     +------------------+
|   MenuService    |---->|   FileService    | (독립 - 파일시스템)
+------------------+     +------------------+

+------------------+
| CategoryService  | (독립 - Repository만 의존)
+------------------+
```

### 순환 의존 해소 설계
```
[이전 설계 - 순환 발생]
TableService → OrderService → TableService (순환!)

[개선 설계 - TableSessionService 분리]
TableService → TableSessionService (세션 조회)
TableService → OrderService (주문 조회)
OrderService → TableSessionService (세션 확보)
OrderService → SseService (이벤트 발행)
TableSessionService → SseService (이벤트 발행)

→ 모든 의존성이 단방향, 순환 없음
```

---

## 2. 통신 패턴

### 2.1 동기 통신 (Synchronous)
| 호출자 | 대상 | 패턴 | 설명 |
|--------|------|------|------|
| 고객 프론트엔드 → 백엔드 | REST API | HTTP (Axios) | 메뉴 조회, 주문 생성/조회 |
| 관리자 프론트엔드 → 백엔드 | REST API | HTTP (Axios) | CRUD, 상태 변경, 대시보드 |
| Service → Service | 직접 호출 | 메서드 호출 | 서비스 간 협력 |
| Service → Repository | JPA | 메서드 호출 | DB 접근 |

### 2.2 비동기 통신 (Asynchronous)
| 호출자 | 대상 | 패턴 | 설명 |
|--------|------|------|------|
| 백엔드 → 관리자 프론트엔드 | SSE | Server-Sent Events | 실시간 주문/상태 알림 |

### 2.3 SSE 이벤트 흐름
```
[이벤트 발생 트리거]              [SSE 이벤트]              [클라이언트 처리]
주문 생성 (OrderService)    →  NEW_ORDER              →  테이블 카드에 주문 추가
상태 변경 (OrderService)    →  ORDER_STATUS_CHANGED   →  주문 상태 배지 업데이트
주문 삭제 (OrderService)    →  ORDER_DELETED          →  주문 제거 + 총액 재계산
이용 완료 (TableSessionSvc) →  SESSION_COMPLETED      →  테이블 카드 리셋
Heartbeat (스케줄러)        →  HEARTBEAT              →  연결 유지 확인
```

---

## 3. 데이터 흐름

### 3.1 고객 주문 플로우 (상세)
```
[고객 태블릿]
    |
    | (1) POST /api/orders {items: [{menuId, quantity}...]}
    | Header: Authorization: Bearer <TABLE_TOKEN>
    v
[Security Filter] → JWT 검증 → UserPrincipal(tableId, storeId, sessionId) 추출
    |
    v
[OrderController] → @Valid 입력 검증
    |
    v
[OrderService.createOrder()]
    |--- (2) TableSessionService.getOrCreateSession(tableId)
    |         → 활성 세션 있으면 반환, 없으면 새로 생성
    |--- (3) MenuRepository.findAllById(menuIds)
    |         → 메뉴 존재 확인 + 현재 가격 조회
    |--- (4) Order + OrderItems 생성 → OrderRepository.save()
    |--- (5) SseService.publishEvent(storeId, NEW_ORDER, orderData)
    |                                      |
    |                                      v
    |                               [관리자 브라우저] SSE 수신
    v
(6) OrderResponse(orderId, orderNumber, items, totalAmount)
    → [고객 태블릿] 주문 성공 화면 표시
```

### 3.2 관리자 대시보드 플로우
```
[관리자 브라우저] 로그인 후
    |
    |--- (1) GET /api/admin/dashboard
    |         → DashboardResponse {
    |             tables: [{tableId, tableNumber, sessionStatus,
    |                       totalAmount, orders: [{...}]}]
    |           }
    |
    |--- (2) GET /api/admin/sse/subscribe
    |         → SSE 연결 수립 (EventSource)
    |
    v
[이후 실시간 업데이트]
    SSE event: {type: "NEW_ORDER", data: {tableId, order: {...}}}
    → 해당 테이블 카드에 주문 추가, 총액 업데이트, 하이라이트 효과
```

### 3.3 전체 시스템 데이터 흐름
```
+-------------------+                    +-------------------+
|  고객용 React App |                    | 관리자용 React App |
|                   |                    |                   |
| [Axios Client]    |                    | [Axios Client]    |
| - 토큰 자동 첨부  |                    | - 토큰 자동 첨부  |
| - 에러 인터셉터   |                    | - 에러 인터셉터   |
+--------+----------+                    | [SSE Client]      |
         |                               | - 자동 재연결     |
         | REST                          | - 이벤트 디스패치 |
         v                               +--------+----------+
+------------------------------------------+       |
|        Spring Boot Backend               |       | REST + SSE
|                                          |<------+
|  [Security Filter Chain]                 |
|    - JwtAuthenticationFilter             |
|    - RateLimitFilter (로그인만)          |
|                                          |
|  [Controllers] → [Services] → [Repos]   |
|                                          |
|  [Global Exception Handler]             |
|    - 표준 에러 응답 형식                 |
|    - 스택 트레이스 숨김 (prod)           |
+------------------------------------------+
         |
         | JPA/Hibernate
         v
+------------------------------------------+
|           MySQL Database                 |
|                                          |
|  store, admin, restaurant_table,         |
|  table_session, category, menu,          |
|  orders, order_item                      |
+------------------------------------------+
```

---

## 4. 보안 경계

### API 접근 제어
| 경로 패턴 | 접근 권한 | 인증 방식 | 비고 |
|-----------|-----------|-----------|------|
| `/api/auth/**` | 공개 | 없음 | 로그인/토큰 갱신 |
| `/api/stores/{storeId}/menus` | TABLE 또는 ADMIN | JWT | 메뉴 조회 |
| `/api/stores/{storeId}/categories` | TABLE 또는 ADMIN | JWT | 카테고리 조회 |
| `/api/orders` (POST) | TABLE | JWT (TABLE role) | 주문 생성 |
| `/api/orders/current` | TABLE | JWT (TABLE role) | 현재 세션 주문 |
| `/api/admin/**` | ADMIN | JWT (ADMIN role) | 관리자 전용 |
| `/api/files/images/**` | 공개 | 없음 | 이미지 서빙 |

### 매장 격리 (Store Isolation)
- 모든 데이터 접근 시 JWT에 포함된 storeId로 필터링
- 다른 매장의 데이터에 접근 불가 (IDOR 방지)
- Repository 쿼리에 storeId 조건 필수 포함

### 입력 검증 계층
```
[Controller Layer]
  - @Valid + Bean Validation (형식, 길이, 범위)
  - @RequestBody 크기 제한

[Service Layer]
  - 비즈니스 규칙 검증 (존재 여부, 상태 전이, 권한)
  - 매장 소속 검증 (storeId 일치 확인)

[Repository Layer]
  - JPA Parameterized Query (SQL Injection 방지)
```
