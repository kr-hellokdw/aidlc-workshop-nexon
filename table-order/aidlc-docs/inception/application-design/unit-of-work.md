# Unit of Work 정의

## 분해 전략
- **분류 방식**: 도메인별 분리 (핵심 도메인 우선)
- **우선순위**: 의존성 순서 (기반 → 지원 → 핵심)
- **유닛 크기**: 큰 유닛 (3개)
- **아키텍처**: 모노리스 (단일 Spring Boot 앱 + React 앱 2개)
- **개발 방식**: 3명이 각 유닛을 개별 PC에서 독립 개발 후 push

---

## 협업 전략 (Independent Development)

### 개발 환경
- **개발자 A**: Unit 1 (Backend) - 개별 PC에서 독립 개발
- **개발자 B**: Unit 2 (Customer Frontend) - 개별 PC에서 독립 개발
- **개발자 C**: Unit 3 (Admin Frontend) - 개별 PC에서 독립 개발

### Git 브랜치 전략
```
main (단일 브랜치)
├── backend/              ← 개발자 A 작업 영역
├── frontend-customer/    ← 개발자 B 작업 영역
└── frontend-admin/       ← 개발자 C 작업 영역
```
- **단일 브랜치(main)** 에서 폴더별로 작업 영역 분리
- 각 개발자는 자신의 폴더만 수정 → 충돌 없음
- `docs/` 폴더는 개발자 A가 API 스펙 작성, B/C가 참조만

### 독립 개발을 위한 핵심 원칙
1. **API 계약 우선 정의**: Backend 개발자가 Swagger/OpenAPI 스펙을 먼저 공유
2. **Mock API 활용**: Frontend 개발자는 API 스펙 기반 Mock으로 독립 개발 가능
3. **공유 타입 없음**: 각 유닛이 자체 타입 정의 (모노레포이지만 코드 의존성 없음)
4. **독립 빌드**: 각 유닛이 자체 빌드/테스트 가능 (다른 유닛 없이도 동작)

### 통합 순서
```
1. 모두 main 브랜치에서 자기 폴더만 작업 (backend/, frontend-customer/, frontend-admin/)
2. 각자 commit & push (폴더가 다르므로 충돌 없음)
3. docs/ 폴더: 개발자 A가 API 스펙 작성 → B, C가 pull 후 참조
4. 전체 완성 후 통합 테스트
```

---

## Unit 1: Backend API Server (백엔드 API 서버)

### 개요
| 항목 | 내용 |
|------|------|
| **유닛명** | backend |
| **유형** | Spring Boot 모노리스 애플리케이션 |
| **책임** | 전체 비즈니스 로직, 데이터 관리, API 제공, SSE 실시간 통신 |
| **개발 순서** | 1번째 (프론트엔드가 의존) |

### 포함 모듈
| 모듈 | 개발 순서 (모듈 내) | 근거 |
|------|---------------------|------|
| Common | 1 | 모든 모듈이 의존하는 공통 기반 |
| Auth | 2 | 보안 필터, JWT - 다른 API가 의존 |
| Store | 3 | 매장 정보 - Table/Menu가 의존 |
| Table (+ TableSession) | 4 | 테이블/세션 - Order가 의존 |
| Menu (+ Category) | 5 | 메뉴/카테고리 - Order가 의존 |
| File | 6 | 이미지 업로드 - Menu가 의존 |
| Order | 7 | 주문 - 핵심 비즈니스 로직 |
| SSE | 8 | 실시간 알림 - Order 이벤트 발행 |

### 코드 구조
```
backend/
├── src/main/java/com/tableorder/
│   ├── TableOrderApplication.java
│   ├── common/
│   ├── auth/
│   ├── store/
│   ├── table/
│   ├── menu/
│   ├── file/
│   ├── order/
│   └── sse/
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
├── src/test/
└── build.gradle
```

### 주요 산출물
- REST API 전체 (인증, 매장, 테이블, 메뉴, 주문, 파일, SSE)
- MySQL 스키마 (DDL)
- Spring Security 설정
- Swagger/OpenAPI 문서
- 단위 테스트 + 통합 테스트

---

## Unit 2: Customer Frontend (고객용 프론트엔드)

### 개요
| 항목 | 내용 |
|------|------|
| **유닛명** | frontend-customer |
| **유형** | React SPA (TypeScript + Vite) |
| **책임** | 고객 주문 경험 (메뉴 탐색, 장바구니, 주문, 내역 조회) |
| **개발 순서** | 2번째 (Backend API에 의존) |

### 포함 기능
| Feature | 개발 순서 (기능 내) | 근거 |
|---------|---------------------|------|
| Common (API Client, Layout) | 1 | 모든 기능이 의존 |
| Auth (자동 로그인) | 2 | 인증 후 다른 기능 사용 가능 |
| Menu (메뉴 조회) | 3 | 기본 화면, 장바구니의 전제 |
| Cart (장바구니) | 4 | 주문의 전제 |
| Order (주문 생성/내역) | 5 | 핵심 기능 |

### 코드 구조
```
frontend-customer/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── menu/
│   │   ├── cart/
│   │   └── order/
│   ├── common/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 주요 산출물
- 고객 주문 SPA
- 반응형 터치 UI (태블릿 최적화)
- localStorage 기반 장바구니 영속화
- Axios API 클라이언트 (JWT 자동 첨부)

---

## Unit 3: Admin Frontend (관리자용 프론트엔드)

### 개요
| 항목 | 내용 |
|------|------|
| **유닛명** | frontend-admin |
| **유형** | React SPA (TypeScript + Vite) |
| **책임** | 매장 운영 관리 (주문 모니터링, 테이블/메뉴 관리) |
| **개발 순서** | 3번째 (Backend API + SSE에 의존) |

### 포함 기능
| Feature | 개발 순서 (기능 내) | 근거 |
|---------|---------------------|------|
| Common (API Client, SSE Client, Layout) | 1 | 모든 기능이 의존 |
| Auth (관리자 로그인) | 2 | 인증 후 다른 기능 사용 가능 |
| Dashboard (실시간 모니터링) | 3 | 핵심 기능, SSE 연동 |
| Table Management (테이블 관리) | 4 | 세션 관리, 이용 완료 |
| Menu Management (메뉴 관리) | 5 | CRUD + 이미지 업로드 |

### 코드 구조
```
frontend-admin/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── table/
│   │   └── menu/
│   ├── common/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 주요 산출물
- 관리자 운영 SPA
- SSE 기반 실시간 대시보드
- 테이블/메뉴 관리 UI
- 이미지 업로드 기능
- 자동 재연결 SSE 클라이언트
