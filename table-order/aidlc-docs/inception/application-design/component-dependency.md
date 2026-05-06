# 컴포넌트 의존성 (Component Dependencies)

---

## 1. 백엔드 의존성 매트릭스

| 컴포넌트 | 의존 대상 | 의존 유형 |
|----------|-----------|-----------|
| AuthService | AdminRepository, TableRepository, JwtTokenProvider, PasswordEncoder | 직접 의존 |
| StoreService | StoreRepository | 직접 의존 |
| TableService | TableRepository, TableSessionRepository, OrderService | 직접 의존 |
| MenuService | MenuRepository, CategoryRepository, FileService | 직접 의존 |
| OrderService | OrderRepository, OrderItemRepository, OrderHistoryRepository, SseService | 직접 의존 |
| SseService | (독립 - emitter 관리) | 없음 |
| FileService | (독립 - 파일 시스템) | 없음 |

### 의존성 방향 다이어그램
```
+------------------+
|   AuthService    |
+------------------+
        |
        v
+------------------+     +------------------+
|  StoreService    |     |   FileService    |
+------------------+     +------------------+
                                  ^
                                  |
+------------------+     +------------------+
|  TableService    |---->|   OrderService   |
+------------------+     +------------------+
                                  |
                                  v
                         +------------------+
                         |    SseService    |
                         +------------------+
                                  ^
                                  |
                         +------------------+
                         |   MenuService    |---> FileService
                         +------------------+
```

---

## 2. 통신 패턴

### 2.1 동기 통신 (Synchronous)
| 호출자 | 대상 | 패턴 | 설명 |
|--------|------|------|------|
| 프론트엔드 → 백엔드 | REST API | HTTP Request/Response | 모든 CRUD 작업 |
| Service → Repository | JPA | 메서드 호출 | DB 접근 |
| Service → Service | 직접 호출 | 메서드 호출 | 서비스 간 협력 |

### 2.2 비동기 통신 (Asynchronous)
| 호출자 | 대상 | 패턴 | 설명 |
|--------|------|------|------|
| 백엔드 → 관리자 프론트엔드 | SSE | Server-Sent Events | 실시간 주문 알림 |

---

## 3. 데이터 흐름

### 3.1 고객 주문 플로우
```
[고객 태블릿]
    |
    | (1) POST /api/orders
    v
[OrderController]
    |
    | (2) createOrder()
    v
[OrderService]
    |
    |--- (3) getCurrentSession() ---> [TableService]
    |--- (4) save() ---> [OrderRepository] ---> [MySQL]
    |--- (5) publishOrderEvent() ---> [SseService]
    |                                      |
    |                                      | (6) SSE push
    |                                      v
    |                               [관리자 브라우저]
    v
[OrderResponse] ---> [고객 태블릿]
```

### 3.2 관리자 실시간 모니터링 플로우
```
[관리자 브라우저]
    |
    | (1) GET /api/admin/sse/subscribe
    v
[SseController]
    |
    | (2) subscribe()
    v
[SseService] --- emitter 저장 ---
    |
    | (이후 주문 발생 시)
    | (3) publishOrderEvent()
    v
[관리자 브라우저] --- SSE 이벤트 수신 --- UI 업데이트
```

### 3.3 프론트엔드 → 백엔드 API 구조
```
[고객용 앱]                          [관리자용 앱]
    |                                     |
    | Axios                               | Axios
    v                                     v
+------------------------------------------+
|          Spring Boot REST API            |
|  /api/orders    (고객 + 관리자)          |
|  /api/stores    (공통)                   |
|  /api/admin/*   (관리자 전용)            |
|  /api/table/*   (테이블 전용)            |
+------------------------------------------+
    |
    | JPA/Hibernate
    v
+------------------------------------------+
|              MySQL Database              |
+------------------------------------------+
```

---

## 4. 보안 경계

### API 접근 제어
| 경로 패턴 | 접근 권한 | 인증 방식 |
|-----------|-----------|-----------|
| `/api/table/login` | 공개 | 없음 |
| `/api/admin/login` | 공개 | 없음 |
| `/api/stores/{storeId}/menus` | 테이블 인증 | JWT (TABLE role) |
| `/api/stores/{storeId}/categories` | 테이블 인증 | JWT (TABLE role) |
| `/api/orders` (POST) | 테이블 인증 | JWT (TABLE role) |
| `/api/orders/session/*` | 테이블 인증 | JWT (TABLE role) |
| `/api/admin/*` | 관리자 인증 | JWT (ADMIN role) |
| `/api/files/*` | 공개 | 없음 (이미지 서빙) |
