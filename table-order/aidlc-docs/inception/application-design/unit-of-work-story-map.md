# Unit of Work - Story Map (스토리 매핑)

---

## 1. 유닛별 스토리 할당

### Unit 1: Backend API Server

| 스토리 ID | 스토리명 | 관련 백엔드 모듈 |
|-----------|----------|------------------|
| US-C01 | 태블릿 자동 로그인 | Auth, Table |
| US-C02 | 메뉴 조회 및 탐색 | Menu, Category, File |
| US-C03 | 장바구니 관리 | (클라이언트 전용 - API 불필요) |
| US-C04 | 주문 생성 | Order, TableSession, SSE |
| US-C05 | 주문 내역 조회 | Order |
| US-A01 | 매장 관리자 로그인 | Auth |
| US-A02 | 실시간 주문 모니터링 | Order, SSE, Table |
| US-A03 | 테이블 초기 설정 | Table, Auth |
| US-A04 | 주문 삭제 | Order, SSE |
| US-A05 | 테이블 이용 완료 처리 | TableSession, Order, SSE |
| US-A06 | 과거 주문 내역 조회 | Order, TableSession |
| US-A07 | 메뉴 관리 | Menu, Category, File |

**커버리지**: 12/12 스토리 (100%) - 모든 스토리의 백엔드 로직 포함

---

### Unit 2: Customer Frontend

| 스토리 ID | 스토리명 | 관련 FE Feature |
|-----------|----------|-----------------|
| US-C01 | 태블릿 자동 로그인 | Auth |
| US-C02 | 메뉴 조회 및 탐색 | Menu |
| US-C03 | 장바구니 관리 | Cart |
| US-C04 | 주문 생성 | Order |
| US-C05 | 주문 내역 조회 | Order |

**커버리지**: 5/5 고객 스토리 (100%)

---

### Unit 3: Admin Frontend

| 스토리 ID | 스토리명 | 관련 FE Feature |
|-----------|----------|-----------------|
| US-A01 | 매장 관리자 로그인 | Auth |
| US-A02 | 실시간 주문 모니터링 | Dashboard |
| US-A03 | 테이블 초기 설정 | Table Management |
| US-A04 | 주문 삭제 | Dashboard |
| US-A05 | 테이블 이용 완료 처리 | Table Management |
| US-A06 | 과거 주문 내역 조회 | Table Management |
| US-A07 | 메뉴 관리 | Menu Management |

**커버리지**: 7/7 관리자 스토리 (100%)

---

## 2. 커버리지 검증 요약

| 스토리 ID | Unit 1 (Backend) | Unit 2 (Customer FE) | Unit 3 (Admin FE) |
|-----------|:---:|:---:|:---:|
| US-C01 | ✅ | ✅ | - |
| US-C02 | ✅ | ✅ | - |
| US-C03 | - | ✅ | - |
| US-C04 | ✅ | ✅ | - |
| US-C05 | ✅ | ✅ | - |
| US-A01 | ✅ | - | ✅ |
| US-A02 | ✅ | - | ✅ |
| US-A03 | ✅ | - | ✅ |
| US-A04 | ✅ | - | ✅ |
| US-A05 | ✅ | - | ✅ |
| US-A06 | ✅ | - | ✅ |
| US-A07 | ✅ | - | ✅ |

**전체 커버리지**: 12/12 스토리 모두 최소 1개 유닛에 할당 ✅

---

## 3. 스토리 간 의존성 (개발 순서 영향)

```
[Unit 1 내부 의존성]
US-A01 (관리자 로그인) → US-A03 (테이블 설정) → US-C01 (태블릿 로그인)
US-A07 (메뉴 관리) → US-C02 (메뉴 조회)
US-C01 (태블릿 로그인) → US-C04 (주문 생성) → US-A02 (실시간 모니터링)
US-C04 (주문 생성) → US-C05 (주문 내역) → US-A05 (이용 완료) → US-A06 (과거 내역)

[유닛 간 의존성]
Unit 1 완성 → Unit 2, Unit 3 개발 가능
```

---

## 4. 특이사항

| 스토리 | 특이사항 |
|--------|----------|
| US-C03 (장바구니) | 백엔드 API 불필요 - 순수 클라이언트 로직 (localStorage) |
| US-A02 (실시간 모니터링) | SSE 연동 필요 - Unit 1의 SSE 모듈 완성 후 개발 |
| US-C01 (자동 로그인) | Unit 1 Auth + Unit 2 Auth 모두 필요 |
| US-A03 (테이블 설정) | Unit 1 Table + Auth + Unit 3 Table Management 모두 필요 |
