# Unit 1: Backend API Server - Code Generation Plan

## 개요
Backend API Server의 전체 코드를 모듈 순서대로 생성합니다.
개발 순서: Common → Auth → Store → Table → Menu → File → Order → SSE

---

## Step 1: 프로젝트 구조 및 빌드 설정
- [x] build.gradle (의존성 전체)
- [x] settings.gradle
- [x] application.yml, application-dev.yml, application-prod.yml
- [x] TableOrderApplication.java (메인 클래스)
- [x] Dockerfile

## Step 2: Common 모듈
- [x] BaseEntity (공통 엔티티)
- [x] ApiResponse (표준 응답 래퍼)
- [x] ErrorDetail, ValidationErrorDetail (에러 DTO)
- [x] GlobalExceptionHandler (글로벌 예외 처리)
- [x] 커스텀 예외 클래스들 (ResourceNotFoundException, AccessDeniedException 등)
- [x] SecurityConfig (Spring Security 설정)
- [x] WebConfig (CORS 설정)
- [x] AsyncConfig (비동기 + 스케줄링)
- [x] FileConfig (정적 리소스 매핑)
- [x] UserPrincipal (인증 정보 DTO)

## Step 3: Auth 모듈
- [x] Admin 엔티티 + Repository
- [x] JwtTokenProvider (토큰 생성/검증)
- [x] JwtAuthenticationFilter (요청 필터)
- [x] LoginAttemptService (로그인 시도 제한)
- [x] AuthService (인증 비즈니스 로직)
- [x] AuthController (로그인 API)
- [x] Auth DTO (LoginRequest, TokenResponse)

## Step 4: Store 모듈
- [x] Store 엔티티 + Repository
- [x] StoreService
- [x] StoreController
- [x] Store DTO (StoreResponse)

## Step 5: Table 모듈
- [x] RestaurantTable 엔티티 + Repository
- [x] TableSession 엔티티 + Repository
- [x] TableSessionService (세션 라이프사이클)
- [x] TableService (테이블 CRUD + 대시보드)
- [x] TableController (테이블 관리 API)
- [x] Table DTO (TableCreateRequest, TableUpdateRequest, TableResponse, DashboardResponse)

## Step 6: Menu 모듈 (+ Category)
- [x] Category 엔티티 + Repository
- [x] Menu 엔티티 + Repository
- [x] CategoryService
- [x] MenuService
- [x] CategoryController
- [x] MenuController
- [x] Menu/Category DTO

## Step 7: File 모듈
- [x] FileService (업로드/삭제/검증)
- [x] FileController (업로드/서빙 API)
- [x] File DTO (FileUploadResponse)

## Step 8: Order 모듈
- [x] Order 엔티티 + Repository
- [x] OrderItem 엔티티
- [x] OrderService (주문 생성/상태 변경/삭제/이력)
- [x] OrderController (주문 API)
- [x] Order DTO (OrderCreateRequest, OrderResponse, OrderStatusUpdateRequest)
- [x] OrderStatus Enum

## Step 9: SSE 모듈
- [x] SseEventType Enum
- [x] SseService (구독/발행/heartbeat)
- [x] SseController (구독 API)

## Step 10: DB 초기화 스크립트
- [x] schema.sql (DDL)
- [x] data.sql (시드 데이터: 매장, 관리자, 테이블, 카테고리, 메뉴)

## Step 11: 문서화
- [x] backend/README.md (빌드/실행 가이드)

---

## 스토리 매핑

| Step | 관련 스토리 |
|------|-------------|
| Step 2-3 | US-A01, US-C01 (인증) |
| Step 4 | (기반 인프라) |
| Step 5 | US-A03, US-A05 (테이블 관리, 이용 완료) |
| Step 6 | US-C02, US-A07 (메뉴 조회/관리) |
| Step 7 | US-A07 (메뉴 이미지) |
| Step 8 | US-C04, US-C05, US-A02, US-A04, US-A06 (주문 전체) |
| Step 9 | US-A02 (실시간 모니터링) |
