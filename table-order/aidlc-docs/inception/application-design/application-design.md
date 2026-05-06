# 애플리케이션 설계 통합 문서 (Application Design)

---

## 1. 설계 결정 요약

| 항목 | 결정 | 근거 |
|------|------|------|
| **백엔드 아키텍처** | Layered Architecture | 단순 명확, 소규모 프로젝트에 적합 |
| **백엔드 언어** | Java | 안정적, 풍부한 레퍼런스 |
| **프론트엔드 상태 관리** | React Context + useReducer | 내장 기능, 추가 의존성 없음 |
| **API 통신** | Axios | 인터셉터 지원, 토큰 자동 첨부 |
| **API 문서화** | Swagger/OpenAPI (SpringDoc) | 자동 생성, 실시간 동기화 |
| **실시간 통신** | Server-Sent Events (SSE) | 단방향 충분, WebSocket보다 단순 |
| **인증** | JWT (ADMIN + TABLE role) | Stateless, 확장 용이 |
| **빌드 도구** | Gradle (백엔드), Vite (프론트엔드) | 빠른 빌드, 현대적 도구 |

---

## 2. 시스템 아키텍처 개요

```
+-------------------+     +-------------------+
|  고객용 React App |     | 관리자용 React App |
|  (TypeScript)     |     |  (TypeScript)     |
|  - Vite           |     |  - Vite           |
|  - Axios          |     |  - Axios + SSE    |
|  - Context API    |     |  - Context API    |
+--------+----------+     +--------+----------+
         |                          |
         | REST API                 | REST API + SSE
         v                          v
+------------------------------------------+
|      Spring Boot Backend (Java 17+)      |
|      Layered Architecture                |
|                                          |
|  +----------+  +---------+  +---------+  |
|  |   Auth   |  |  Store  |  |  Table  |  |
|  +----------+  +---------+  +---------+  |
|  +----------+  +---------+  +---------+  |
|  |   Menu   |  |  Order  |  |   SSE   |  |
|  +----------+  +---------+  +---------+  |
|  +----------+  +---------+  +---------+  |
|  |Category  |  |  File   |  | Common  |  |
|  +----------+  +---------+  +---------+  |
|                                          |
|  [Spring Security + JWT Filter]          |
|  [SpringDoc OpenAPI]                     |
|  [Global Exception Handler]             |
+------------------------------------------+
         |
         | Spring Data JPA / Hibernate
         v
+------------------------------------------+
|           MySQL 8.0+                     |
|  Encryption at rest (InnoDB)             |
|  TLS connections enforced                |
+------------------------------------------+
```

---

## 3. 모노레포 프로젝트 구조

> **독립 개발 원칙**: 각 유닛(폴더)은 자체 빌드 시스템을 가지며, 다른 유닛 없이도 독립적으로 개발/빌드/테스트 가능합니다. 3명의 개발자가 각각 자신의 유닛 폴더만 작업합니다.

```
table-order/                              # 모노레포 루트
|
+-- docs/                                 # 공유 문서 (API 계약 등)
|   +-- api-spec/                         # OpenAPI 스펙 (Backend 개발자가 작성, FE 개발자가 참조)
|   |   +-- openapi.yml                   # API 스펙 정의서
|   +-- shared-types/                     # API 요청/응답 타입 정의 (참조용, 코드 의존성 아님)
|   |   +-- auth.md                       # 인증 관련 DTO 명세
|   |   +-- order.md                      # 주문 관련 DTO 명세
|   |   +-- menu.md                       # 메뉴 관련 DTO 명세
|   |   +-- table.md                      # 테이블 관련 DTO 명세
|   +-- sse-events.md                     # SSE 이벤트 형식 정의
|
+-- backend/                              # [개발자 A] Spring Boot 백엔드
|   +-- src/main/java/com/tableorder/
|   |   +-- TableOrderApplication.java
|   |   +-- auth/
|   |   |   +-- controller/
|   |   |   +-- service/
|   |   |   +-- dto/
|   |   |   +-- entity/
|   |   |   +-- repository/
|   |   |   +-- security/
|   |   +-- store/
|   |   +-- table/
|   |   +-- menu/
|   |   +-- order/
|   |   +-- sse/
|   |   +-- file/
|   |   +-- common/
|   |       +-- config/
|   |       +-- dto/
|   |       +-- entity/
|   |       +-- exception/
|   |       +-- util/
|   +-- src/main/resources/
|   |   +-- application.yml
|   |   +-- application-dev.yml
|   |   +-- application-prod.yml
|   +-- src/test/
|   +-- build.gradle
|   +-- settings.gradle
|   +-- Dockerfile
|   +-- README.md                         # Backend 독립 빌드/실행 가이드
|
+-- frontend-customer/                    # [개발자 B] 고객용 React 앱
|   +-- src/
|   |   +-- features/
|   |   |   +-- auth/
|   |   |   +-- menu/
|   |   |   +-- cart/
|   |   |   +-- order/
|   |   +-- common/
|   |   |   +-- components/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   +-- mocks/                        # Mock API (Backend 없이 독립 개발용)
|   |   |   +-- handlers.ts              # MSW 핸들러
|   |   |   +-- data.ts                  # Mock 데이터
|   |   +-- App.tsx
|   |   +-- main.tsx
|   +-- index.html
|   +-- package.json
|   +-- vite.config.ts
|   +-- tsconfig.json
|   +-- Dockerfile
|   +-- README.md                         # Customer FE 독립 빌드/실행 가이드
|
+-- frontend-admin/                       # [개발자 C] 관리자용 React 앱
|   +-- src/
|   |   +-- features/
|   |   |   +-- auth/
|   |   |   +-- dashboard/
|   |   |   +-- table/
|   |   |   +-- menu/
|   |   +-- common/
|   |   |   +-- components/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   +-- mocks/                        # Mock API + Mock SSE (Backend 없이 독립 개발용)
|   |   |   +-- handlers.ts
|   |   |   +-- sse-mock.ts
|   |   |   +-- data.ts
|   |   +-- App.tsx
|   |   +-- main.tsx
|   +-- index.html
|   +-- package.json
|   +-- vite.config.ts
|   +-- tsconfig.json
|   +-- Dockerfile
|   +-- README.md                         # Admin FE 독립 빌드/실행 가이드
|
+-- docker-compose.yml                    # 통합 실행 (3개 유닛 + MySQL)
+-- docker-compose.dev.yml                # 개발용 (MySQL만)
+-- README.md                             # 전체 프로젝트 가이드
+-- .gitignore
```

### 독립 개발 지원 구조 설명

| 요소 | 목적 | 담당 |
|------|------|------|
| `docs/api-spec/openapi.yml` | API 계약 정의 (FE 개발자가 Mock 생성 시 참조) | 개발자 A 작성 |
| `docs/shared-types/*.md` | DTO 명세 문서 (코드 의존성 아닌 참조 문서) | 개발자 A 작성 |
| `docs/sse-events.md` | SSE 이벤트 형식 정의 | 개발자 A 작성 |
| `frontend-*/src/mocks/` | MSW(Mock Service Worker) 기반 Mock API | 개발자 B, C 각자 작성 |
| `*/Dockerfile` | 각 유닛 독립 컨테이너화 | 각 개발자 |
| `*/README.md` | 각 유닛 독립 빌드/실행 가이드 | 각 개발자 |
| `docker-compose.yml` | 통합 테스트 시 전체 실행 | 통합 시 사용 |

---

## 4. 핵심 설계 패턴

### 4.1 인증 패턴
- **JWT 이중 역할**: ADMIN (관리자 16시간), TABLE (태블릿 16시간)
- **Security Filter Chain**: 요청별 토큰 검증 → UserPrincipal 추출 → SecurityContext 설정
- **로그인 시도 제한**: 5회 실패 시 15분 차단 (LoginAttemptService, 인메모리 캐시)
- **토큰 저장**: 프론트엔드 localStorage (httpOnly cookie 대안 고려 가능)

### 4.2 실시간 통신 패턴 (SSE)
- **연결 관리**: 매장별 SseEmitter 목록 (ConcurrentHashMap)
- **Heartbeat**: 30초 주기 ping으로 연결 유지
- **타임아웃**: 30분 (이후 클라이언트 자동 재연결)
- **재연결**: 클라이언트 EventSource 자동 재연결 + 3초 딜레이, 최대 5회
- **이벤트 타입**: NEW_ORDER, ORDER_STATUS_CHANGED, ORDER_DELETED, SESSION_COMPLETED, HEARTBEAT

### 4.3 세션 관리 패턴
- **세션 시작**: 첫 주문 생성 시 자동 (TableSessionService.getOrCreateSession)
- **세션 종료**: 관리자 "이용 완료" 클릭 시 (session.status = COMPLETED)
- **데이터 분리**: Order 테이블에 sessionId FK → 세션 상태로 현재/과거 필터링
- **별도 이력 테이블 불필요**: completed 세션의 주문 = 과거 이력 (쿼리로 분리)

### 4.4 순환 의존 해소 패턴
- **문제**: TableService ↔ OrderService 상호 참조
- **해결**: TableSessionService를 독립 서비스로 분리
  - OrderService → TableSessionService (세션 확보)
  - TableService → OrderService (주문 조회)
  - TableSessionService → SseService (이벤트 발행)
  - 모든 의존성 단방향 유지

### 4.5 파일 관리 패턴
- **저장 위치**: 서버 로컬 파일 시스템 (설정 가능한 경로)
- **파일명**: UUID + 원본 확장자 (충돌 방지)
- **검증**: 형식 (jpg, png, webp), 크기 (5MB 이하)
- **서빙**: Spring 정적 리소스 매핑 (`/api/files/images/` → 파일 디렉토리)
- **삭제**: 메뉴 삭제 시 연관 이미지 자동 삭제

### 4.6 에러 처리 패턴
- **표준 응답 형식**: `ApiResponse<T>` (success, data, error, timestamp)
- **글로벌 핸들러**: `@RestControllerAdvice` + 예외별 HTTP 상태 매핑
- **프로덕션 보안**: 스택 트레이스 숨김, 일반적 에러 메시지만 노출
- **검증 에러**: 필드별 에러 메시지 목록 반환

### 4.7 매장 격리 패턴 (Store Isolation)
- JWT에 storeId 포함 → 모든 쿼리에 storeId 조건 자동 적용
- 다른 매장 데이터 접근 시 403 Forbidden
- IDOR(Insecure Direct Object Reference) 방지

---

## 5. 주요 개선사항 (초기 설계 대비)

| # | 이슈 | 해결 |
|---|------|------|
| 1 | TableService ↔ OrderService 순환 의존 | TableSessionService 분리로 단방향 의존 확보 |
| 2 | 카테고리 관리 API 누락 | CategoryController + CategoryService 추가 |
| 3 | 세션 시작 로직 불명확 | getOrCreateSession()으로 첫 주문 시 자동 생성 |
| 4 | OrderHistory 별도 테이블 불필요 | 세션 상태(ACTIVE/COMPLETED)로 필터링, 단일 Order 테이블 |
| 5 | SSE 재연결 미정의 | Heartbeat(30초) + 클라이언트 자동 재연결(3초, 5회) |
| 6 | 대시보드 초기 데이터 API 누락 | GET /api/admin/dashboard 추가 |
| 7 | 의존성 다이어그램 부정확 | 정확한 단방향 의존성 다이어그램으로 교체 |
| 8 | 로그인 시도 제한 구현 미정의 | LoginAttemptService 추가 (5회/15분) |
| 9 | 파일 검증 미정의 | 형식(jpg/png/webp) + 크기(5MB) 검증 추가 |
| 10 | SSE 이벤트 타입 미정의 | SseEventType enum 정의 (5가지 이벤트) |

---

## 6. 상세 설계 문서 참조

- **컴포넌트 정의**: [components.md](./components.md)
- **메서드 시그니처**: [component-methods.md](./component-methods.md)
- **서비스 레이어**: [services.md](./services.md)
- **의존성 관계**: [component-dependency.md](./component-dependency.md)
