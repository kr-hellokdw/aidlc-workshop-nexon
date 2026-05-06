# Unit of Work 의존성 (Dependencies)

---

## 1. 유닛 간 의존성 매트릭스

| 유닛 | 의존 대상 | 의존 유형 | 설명 |
|------|-----------|-----------|------|
| **Unit 1: Backend** | MySQL | 런타임 | 데이터 저장소 |
| **Unit 2: Customer FE** | Unit 1 (Backend) | REST API | 메뉴 조회, 주문 생성/조회 |
| **Unit 3: Admin FE** | Unit 1 (Backend) | REST API + SSE | CRUD + 실시간 알림 |

### 의존성 다이어그램
```
+-------------------------+     +-------------------------+
|  Unit 2: Customer FE    |     |  Unit 3: Admin FE       |
|  (React - 고객 주문)    |     |  (React - 관리자 운영)  |
+------------+------------+     +------------+------------+
             |                               |
             | REST API (Axios)              | REST API + SSE
             |                               |
             v                               v
+--------------------------------------------------+
|           Unit 1: Backend API Server             |
|           (Spring Boot - Java)                   |
|                                                  |
|  Auth → Store → Table → Menu → Order → SSE      |
+--------------------------------------------------+
             |
             | JPA
             v
+--------------------------------------------------+
|                  MySQL Database                   |
+--------------------------------------------------+
```

---

## 2. 개발 순서 (의존성 기반)

```
Phase 1: Unit 1 (Backend)
    ↓ API 완성 후
Phase 2: Unit 2 (Customer FE) + Unit 3 (Admin FE) [병렬 가능]
```

| 순서 | 유닛 | 선행 조건 | 병렬 가능 |
|------|------|-----------|-----------|
| 1 | Backend API Server | 없음 (최초) | - |
| 2 | Customer Frontend | Backend API 완성 | Unit 3과 병렬 가능 |
| 3 | Admin Frontend | Backend API + SSE 완성 | Unit 2와 병렬 가능 |

---

## 3. 인터페이스 계약 (Interface Contracts)

### Unit 1 → Unit 2 (Backend → Customer FE)
| API | 용도 |
|-----|------|
| `POST /api/auth/table/login` | 태블릿 인증 |
| `GET /api/stores/{storeId}/menus` | 메뉴 목록 |
| `GET /api/stores/{storeId}/categories` | 카테고리 목록 |
| `POST /api/orders` | 주문 생성 |
| `GET /api/orders/current` | 현재 세션 주문 조회 |
| `GET /api/files/images/{filename}` | 메뉴 이미지 |

### Unit 1 → Unit 3 (Backend → Admin FE)
| API | 용도 |
|-----|------|
| `POST /api/auth/admin/login` | 관리자 인증 |
| `GET /api/admin/dashboard` | 대시보드 초기 데이터 |
| `GET /api/admin/sse/subscribe` | SSE 실시간 구독 |
| `GET/POST/PUT/DELETE /api/admin/tables/*` | 테이블 관리 |
| `GET/POST/PUT/DELETE /api/admin/menus/*` | 메뉴 관리 |
| `GET/POST/PUT/DELETE /api/admin/categories/*` | 카테고리 관리 |
| `PUT /api/admin/orders/{id}/status` | 주문 상태 변경 |
| `DELETE /api/admin/orders/{id}` | 주문 삭제 |
| `POST /api/admin/tables/{id}/complete-session` | 이용 완료 |
| `GET /api/admin/tables/{id}/history` | 과거 내역 |
| `POST /api/admin/files/upload` | 이미지 업로드 |

---

## 4. 공유 리소스

| 리소스 | 공유 유닛 | 관리 방식 |
|--------|-----------|-----------|
| MySQL Database | Unit 1 (단독 접근) | Backend만 DB 접근, FE는 API 통해서만 |
| 이미지 파일 | Unit 1 (저장), Unit 2+3 (조회) | Backend가 저장, 정적 파일로 서빙 |
| JWT 토큰 형식 | Unit 1 (발급), Unit 2+3 (사용) | Backend가 정의, FE가 헤더에 첨부 |

---

## 5. 통합 테스트 포인트

| 통합 지점 | 테스트 내용 |
|-----------|-------------|
| Unit 2 ↔ Unit 1 | 고객 주문 플로우 E2E (로그인 → 메뉴 → 장바구니 → 주문) |
| Unit 3 ↔ Unit 1 | 관리자 플로우 E2E (로그인 → 대시보드 → 상태 변경) |
| Unit 2 → Unit 1 → Unit 3 | 크로스 유닛: 고객 주문 → SSE → 관리자 실시간 수신 |
