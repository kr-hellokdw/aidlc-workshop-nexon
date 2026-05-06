# Logical Components - Backend API Server

---

## 1. 컴포넌트 아키텍처 개요

```
+------------------------------------------------------------------+
|                    Spring Boot Application                         |
|                                                                    |
|  +------------------+  +------------------+  +------------------+ |
|  |  Security Layer  |  |   API Layer      |  |  SSE Layer       | |
|  |                  |  |                  |  |                  | |
|  | - CorsFilter     |  | - Controllers    |  | - SseController  | |
|  | - JwtAuthFilter  |  | - GlobalExcHndlr |  | - SseService     | |
|  | - SecurityConfig |  | - ApiResponse    |  | - Heartbeat      | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                    |
|  +------------------+  +------------------+  +------------------+ |
|  |  Service Layer   |  |  Domain Layer    |  |  Infra Layer     | |
|  |                  |  |                  |  |                  | |
|  | - AuthService    |  | - Entities       |  | - Repositories   | |
|  | - TableService   |  | - Enums          |  | - FileService    | |
|  | - MenuService    |  | - DTOs           |  | - JwtProvider    | |
|  | - OrderService   |  | - Exceptions     |  | - LoginAttempt   | |
|  | - CategorySvc    |  |                  |  |   Service        | |
|  | - TableSessionSvc|  |                  |  |                  | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                    |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|                    MySQL Database                                  |
+------------------------------------------------------------------+
```

---

## 2. Security Layer 컴포넌트

### 2.1 JwtAuthenticationFilter
| 항목 | 내용 |
|------|------|
| **타입** | OncePerRequestFilter |
| **책임** | 모든 요청에서 JWT 토큰 추출 및 인증 처리 |
| **의존** | JwtTokenProvider |
| **동작** | Authorization 헤더 → 토큰 추출 → 검증 → UserPrincipal → SecurityContext |

### 2.2 SecurityConfig
| 항목 | 내용 |
|------|------|
| **타입** | @Configuration + @EnableWebSecurity |
| **책임** | HTTP 보안 설정, CORS, CSRF, 경로별 권한 |
| **설정** | CSRF 비활성화 (JWT 사용), CORS 설정, Stateless 세션 |

### 2.3 UserPrincipal
| 항목 | 내용 |
|------|------|
| **타입** | Record / DTO |
| **필드** | id, storeId, role (ADMIN/TABLE), tableNumber (nullable) |
| **용도** | SecurityContext에 저장, 서비스 레이어에서 인증 정보 접근 |

---

## 3. API Layer 컴포넌트

### 3.1 GlobalExceptionHandler
| 항목 | 내용 |
|------|------|
| **타입** | @RestControllerAdvice |
| **책임** | 모든 예외를 표준 ApiResponse 형식으로 변환 |
| **매핑** | 예외 클래스 → HTTP 상태코드 + 에러 코드 |

### 3.2 ApiResponse\<T\>
| 항목 | 내용 |
|------|------|
| **타입** | Generic DTO |
| **필드** | success (boolean), data (T), error (ErrorDetail), timestamp |
| **용도** | 모든 API 응답의 표준 래퍼 |

### 3.3 Controllers (도메인별)
| Controller | 경로 접두사 | 역할 |
|-----------|-------------|------|
| AuthController | /api/auth | 인증 (로그인, 토큰 갱신) |
| StoreController | /api/stores | 매장 정보 |
| TableController | /api/admin/tables | 테이블 CRUD + 세션 관리 |
| MenuController | /api/admin/menus, /api/stores/{id}/menus | 메뉴 CRUD |
| CategoryController | /api/admin/categories, /api/stores/{id}/categories | 카테고리 CRUD |
| OrderController | /api/orders, /api/admin/orders | 주문 생성/관리 |
| FileController | /api/admin/files, /api/files/images | 파일 업로드/서빙 |
| SseController | /api/admin/sse | SSE 구독 |

---

## 4. Service Layer 컴포넌트

### 의존성 방향 (단방향)
```
AuthService         → AdminRepository, TableRepository, JwtTokenProvider, LoginAttemptService
StoreService        → StoreRepository
TableService        → TableRepository, TableSessionService, OrderService
TableSessionService → TableSessionRepository, SseService
MenuService         → MenuRepository, CategoryRepository, FileService
CategoryService     → CategoryRepository, MenuRepository
OrderService        → OrderRepository, TableSessionService, MenuRepository, SseService
SseService          → (독립, ConcurrentHashMap)
FileService         → (독립, 파일 시스템)
LoginAttemptService → (독립, ConcurrentHashMap)
```

---

## 5. Infrastructure Layer 컴포넌트

### 5.1 JwtTokenProvider
| 항목 | 내용 |
|------|------|
| **타입** | @Component |
| **책임** | JWT 토큰 생성, 검증, 파싱 |
| **라이브러리** | io.jsonwebtoken (jjwt) |
| **설정** | secret key, access/refresh 만료 시간 (application.yml) |

### 5.2 LoginAttemptService
| 항목 | 내용 |
|------|------|
| **타입** | @Service |
| **저장소** | ConcurrentHashMap\<String, AttemptInfo\> |
| **규칙** | 5회 실패 → 15분 차단 |
| **키** | "storeId:username" 또는 "storeId:tableNumber" |

### 5.3 FileService
| 항목 | 내용 |
|------|------|
| **타입** | @Service |
| **저장소** | 로컬 파일 시스템 (설정 가능 경로) |
| **검증** | Content-Type + 확장자 + 크기 (5MB) |
| **파일명** | UUID + 원본 확장자 |

### 5.4 SseEmitter 관리
| 항목 | 내용 |
|------|------|
| **저장소** | ConcurrentHashMap\<Long, CopyOnWriteArrayList\<SseEmitter\>\> |
| **키** | storeId |
| **타임아웃** | 30분 |
| **정리** | onCompletion/onTimeout/onError 콜백 + heartbeat 시 dead 제거 |

---

## 6. Cross-Cutting 컴포넌트

### 6.1 BaseEntity
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### 6.2 WebConfig (CORS)
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "http://localhost:5174") // dev
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

### 6.3 FileConfig (정적 리소스)
```java
@Configuration
public class FileConfig implements WebMvcConfigurer {
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/files/images/**")
            .addResourceLocations("file:" + uploadDir + "/");
    }
}
```

### 6.4 AsyncConfig (SSE 비동기 발행)
```java
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
    // SSE 이벤트 발행용 비동기 설정
    // Heartbeat 스케줄링 활성화
}
```

---

## 7. 데이터 흐름 요약

### 일반 API 요청
```
Client → CorsFilter → JwtAuthFilter → Controller → Service → Repository → DB
                                          ↓
                                    ApiResponse<T> → Client
```

### 주문 생성 (SSE 포함)
```
Client → JwtAuthFilter → OrderController → OrderService
                                              ├── TableSessionService (세션 확보)
                                              ├── MenuRepository (메뉴 검증)
                                              ├── OrderRepository (저장)
                                              └── SseService.publishEvent() [@Async]
                                                       ↓
                                              Admin Browser (SSE)
```

### SSE 구독
```
Admin Browser → JwtAuthFilter → SseController → SseService.subscribe()
                                                      ↓
                                              SseEmitter 반환 (30분 유지)
                                                      ↓
                                              Heartbeat (30초 주기)
```
