# NFR Design Patterns - Backend API Server

---

## 1. 보안 패턴 (Security Patterns)

### 1.1 JWT Authentication Filter Chain
```
요청 → CorsFilter → JwtAuthenticationFilter → SecurityContext → Controller
                         |
                         ├── 토큰 없음 → 공개 API면 통과, 아니면 401
                         ├── 토큰 유효 → UserPrincipal 생성 → SecurityContext 설정
                         └── 토큰 만료/무효 → 401 Unauthorized
```

**구현 패턴**: OncePerRequestFilter
```java
// JwtAuthenticationFilter extends OncePerRequestFilter
// 1. Authorization 헤더에서 Bearer 토큰 추출
// 2. JwtTokenProvider.validateToken() 호출
// 3. UserPrincipal 생성 (id, storeId, role, tableNumber)
// 4. UsernamePasswordAuthenticationToken 생성 → SecurityContextHolder 설정
```

### 1.2 Role-Based Access Control
```java
// SecurityConfig
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/files/images/**").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("TABLE")
    .requestMatchers(HttpMethod.GET, "/api/orders/current").hasRole("TABLE")
    .requestMatchers("/api/stores/*/menus", "/api/stores/*/categories").hasAnyRole("TABLE", "ADMIN")
    .anyRequest().authenticated()
);
```

### 1.3 Store Isolation Pattern
```java
// 모든 Service 메서드에서 storeId 검증
public MenuResponse getMenu(Long menuId, Long storeId) {
    Menu menu = menuRepository.findById(menuId)
        .orElseThrow(() -> new ResourceNotFoundException("Menu", menuId));
    if (!menu.getStoreId().equals(storeId)) {
        throw new AccessDeniedException("Access denied to this resource");
    }
    return toResponse(menu);
}
```

### 1.4 Login Attempt Throttling
```
패턴: Token Bucket (단순화)
저장소: ConcurrentHashMap<String, AttemptInfo>
키: "storeId:username" 또는 "storeId:tableNumber"

AttemptInfo {
    int count;
    LocalDateTime lastAttempt;
    LocalDateTime blockedUntil;
}

규칙:
- count >= 5 && now < blockedUntil → 차단 (403)
- count >= 5 && now >= blockedUntil → 리셋 후 허용
- 성공 시 → 해당 키 제거
```

---

## 2. 성능 패턴 (Performance Patterns)

### 2.1 Database Index Strategy
```sql
-- 주문 조회 최적화
CREATE INDEX idx_orders_store_session ON orders(store_id, session_id);
CREATE INDEX idx_orders_store_ordered_at ON orders(store_id, ordered_at);

-- 세션 조회 최적화
CREATE INDEX idx_table_session_table_status ON table_session(table_id, status);

-- 메뉴 조회 최적화
CREATE INDEX idx_menu_store_category ON menu(store_id, category_id, display_order);
CREATE INDEX idx_category_store ON category(store_id, display_order);
```

### 2.2 JPA Fetch Strategy
```java
// N+1 방지: 주문 + 주문항목 한번에 조회
@Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.sessionId = :sessionId")
List<Order> findBySessionIdWithItems(@Param("sessionId") Long sessionId);

// 대시보드: 테이블 + 세션 + 주문 한번에
@Query("SELECT t FROM RestaurantTable t " +
       "LEFT JOIN FETCH t.sessions s " +
       "WHERE t.storeId = :storeId AND (s IS NULL OR s.status = 'ACTIVE')")
List<RestaurantTable> findAllWithActiveSession(@Param("storeId") Long storeId);
```

### 2.3 SSE Non-Blocking Event Publishing
```java
// 이벤트 발행은 비동기로 처리 (주문 생성 응답 지연 방지)
@Async
public void publishEvent(Long storeId, SseEventType type, Object data) {
    List<SseEmitter> emitters = emitterMap.get(storeId);
    if (emitters == null) return;
    
    SseEmitter.SseEventBuilder event = SseEmitter.event()
        .name(type.name())
        .data(data);
    
    emitters.removeIf(emitter -> {
        try { emitter.send(event); return false; }
        catch (Exception e) { return true; } // dead emitter 제거
    });
}
```

---

## 3. 복원력 패턴 (Resilience Patterns)

### 3.1 SSE Connection Recovery
```
서버 측:
- SseEmitter timeout: 30분
- Heartbeat: 30초 주기 (@Scheduled)
- Dead emitter 자동 정리 (onCompletion, onTimeout, onError 콜백)

클라이언트 측 (프론트엔드 참조용):
- EventSource 자동 재연결 (브라우저 내장)
- 재연결 딜레이: 3초
- 최대 재시도: 5회
- 5회 초과 시: 수동 재연결 버튼 표시
```

### 3.2 Transaction Management
```java
// 서비스 레이어 트랜잭션 경계
@Transactional
public OrderResponse createOrder(OrderCreateRequest request, UserPrincipal principal) {
    // 1. 세션 확보 (없으면 생성)
    // 2. 메뉴 검증
    // 3. 주문 저장
    // 4. SSE 발행 (@Async - 트랜잭션 외부)
    // → 3번까지 실패 시 전체 롤백
}
```

### 3.3 Order Number Retry Pattern
```java
// 주문번호 중복 시 재시도 (최대 3회)
private int generateOrderNumber(Long storeId) {
    for (int attempt = 0; attempt < 3; attempt++) {
        int number = countTodayOrders(storeId) + 1 + attempt;
        if (!orderRepository.existsByStoreIdAndOrderNumberAndDate(storeId, number, today())) {
            return number;
        }
    }
    throw new OrderNumberGenerationException("Failed to generate unique order number");
}
```

---

## 4. 에러 처리 패턴 (Error Handling Pattern)

### 4.1 Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 - Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        // 필드별 에러 메시지 수집 → 400 응답
    }

    // 400 - Business Rule Violation
    @ExceptionHandler({InvalidOrderStatusTransitionException.class, ...})
    public ResponseEntity<ApiResponse<?>> handleBadRequest(RuntimeException ex) {
        // 비즈니스 규칙 위반 → 400 응답
    }

    // 401 - Authentication
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuth(AuthenticationException ex) {
        // 인증 실패 → 401 응답
    }

    // 403 - Authorization
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        // 권한 부족 → 403 응답
    }

    // 404 - Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
        // 리소스 없음 → 404 응답
    }

    // 500 - Internal Error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleInternal(Exception ex) {
        log.error("Unexpected error", ex);
        // 일반 메시지만 반환 (스택 트레이스 숨김)
    }
}
```

### 4.2 Standard Response Envelope
```java
@Getter
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorDetail error;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) { ... }
    public static ApiResponse<?> error(String code, String message) { ... }
}
```

---

## 5. 로깅 패턴 (Logging Pattern)

### 5.1 Request/Response Logging
```java
// 필터 또는 인터셉터로 요청/응답 로깅
// 개발 환경: 상세 로깅 (헤더, 바디)
// 프로덕션: 요약 로깅 (메서드, URI, 상태코드, 소요시간)
```

### 5.2 보안 이벤트 로깅
```
로깅 대상:
- 로그인 성공/실패 (IP, username)
- 로그인 차단 발생
- 매장 격리 위반 시도
- 토큰 검증 실패
```

---

## 6. 설정 관리 패턴 (Configuration Pattern)

### 6.1 Profile 기반 설정 분리
```
application.yml        → 공통 설정 (포트, 파일 크기 제한 등)
application-dev.yml    → 개발 (H2/MySQL local, ddl-auto: update, SQL 로깅)
application-prod.yml   → 프로덕션 (환경변수 참조, ddl-auto: validate, 최소 로깅)
```

### 6.2 민감 정보 외부화
```yaml
# prod에서는 환경변수로 주입
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

jwt:
  secret: ${JWT_SECRET}
  access-expiration: 57600000   # 16시간 (ms)
  refresh-expiration: 86400000  # 24시간 (ms)
```
