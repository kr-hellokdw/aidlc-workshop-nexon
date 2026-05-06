# 애플리케이션 설계 통합 문서 (Application Design)

---

## 1. 설계 결정 요약

| 항목 | 결정 |
|------|------|
| **백엔드 아키텍처** | Layered Architecture (Controller → Service → Repository) |
| **백엔드 언어** | Java |
| **프론트엔드 상태 관리** | React Context + useReducer |
| **API 통신** | Axios |
| **API 문서화** | Swagger/OpenAPI (SpringDoc) |
| **실시간 통신** | Server-Sent Events (SSE) |
| **인증** | JWT (ADMIN role + TABLE role) |

---

## 2. 시스템 아키텍처 개요

```
+-------------------+     +-------------------+
|  고객용 React App |     | 관리자용 React App |
|  (TypeScript)     |     |  (TypeScript)     |
+-------------------+     +-------------------+
         |                         |
         | REST API (Axios)        | REST API (Axios) + SSE
         v                         v
+------------------------------------------+
|        Spring Boot Backend (Java)        |
|                                          |
|  +--------+  +-------+  +--------+      |
|  |  Auth  |  | Store |  |  Table |      |
|  +--------+  +-------+  +--------+      |
|  +--------+  +-------+  +--------+      |
|  |  Menu  |  | Order |  |   SSE  |      |
|  +--------+  +-------+  +--------+      |
|  +--------+  +------------------+        |
|  |  File  |  |     Common      |        |
|  +--------+  +------------------+        |
+------------------------------------------+
         |
         | JPA/Hibernate
         v
+------------------------------------------+
|           MySQL Database                 |
+------------------------------------------+
```

---

## 3. 모노레포 프로젝트 구조

```
table-order/
├── backend/                          # Spring Boot 백엔드
│   ├── src/main/java/com/tableorder/
│   │   ├── auth/                     # 인증 모듈
│   │   ├── store/                    # 매장 모듈
│   │   ├── table/                    # 테이블 모듈
│   │   ├── menu/                     # 메뉴 모듈
│   │   ├── order/                    # 주문 모듈
│   │   ├── sse/                      # SSE 모듈
│   │   ├── file/                     # 파일 모듈
│   │   └── common/                   # 공통 모듈
│   ├── src/main/resources/
│   └── pom.xml (or build.gradle)
│
├── frontend-customer/                # 고객용 React 앱
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   └── order/
│   │   ├── common/
│   │   └── App.tsx
│   └── package.json
│
├── frontend-admin/                   # 관리자용 React 앱
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── table/
│   │   │   └── menu/
│   │   ├── common/
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

---

## 4. 핵심 설계 패턴

### 4.1 인증 패턴
- JWT 토큰 기반 (Access Token)
- 두 가지 역할: `ADMIN` (관리자), `TABLE` (테이블 태블릿)
- Spring Security Filter Chain으로 요청별 인증/인가

### 4.2 실시간 통신 패턴
- SSE (Server-Sent Events) 단방향 통신
- 매장별 SseEmitter 관리 (ConcurrentHashMap)
- 주문 생성/상태 변경 시 이벤트 자동 발행

### 4.3 세션 관리 패턴
- 테이블 세션: 첫 주문 시작 ~ 이용 완료 처리
- 이용 완료 시 주문 이력 이동 + 테이블 리셋
- 새 고객은 깨끗한 상태에서 시작

### 4.4 파일 관리 패턴
- 서버 로컬 파일 시스템 저장
- 고유 파일명 생성 (UUID 기반)
- 정적 리소스로 서빙

---

## 5. 상세 설계 문서 참조

- **컴포넌트 정의**: [components.md](./components.md)
- **메서드 시그니처**: [component-methods.md](./component-methods.md)
- **서비스 레이어**: [services.md](./services.md)
- **의존성 관계**: [component-dependency.md](./component-dependency.md)
