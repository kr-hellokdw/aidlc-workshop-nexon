# Unit of Work Plan (유닛 분해 계획)

## 계획 개요
테이블오더 서비스를 개발 가능한 작업 단위(Unit of Work)로 분해합니다.
모노레포 구조에서 백엔드(Spring Boot) + 프론트엔드 2개(React)를 어떻게 나눠서 개발할지 결정합니다.

---

## 질문 (Questions)

### Question 1
개발 단위를 어떻게 나누시겠습니까?

A) 계층별 분리 - 백엔드 전체 → 고객 프론트엔드 → 관리자 프론트엔드 (순차 개발)
B) 기능별 수직 슬라이스 - 기능 단위로 백엔드+프론트엔드를 함께 개발 (예: 메뉴 기능 = 백엔드 API + 고객 UI + 관리자 UI)
C) 도메인별 분리 - 핵심 도메인(주문) 먼저, 지원 도메인(메뉴/테이블) 나중에
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
개발 우선순위를 어떻게 정하시겠습니까?

A) 의존성 순서 - 다른 기능이 의존하는 기반 기능부터 (인증 → 매장/테이블 → 메뉴 → 주문 → 실시간)
B) 비즈니스 가치 순서 - 핵심 사용자 경험부터 (주문 플로우 → 관리 기능)
C) 복잡도 순서 - 단순한 것부터 (메뉴 CRUD → 주문 → 실시간 SSE)

[Answer]: A

### Question 3
각 유닛의 크기(범위)를 어떻게 설정하시겠습니까?

A) 작은 유닛 - 모듈 하나씩 (예: Auth, Menu, Order 각각 별도 유닛) → 유닛 수 많음 (7~8개)
B) 중간 유닛 - 관련 모듈 묶음 (예: 기반 설정+인증, 메뉴 관리, 주문+실시간) → 유닛 수 적당 (4~5개)
C) 큰 유닛 - 전체를 2~3개로 (예: 백엔드 전체, 고객 FE, 관리자 FE)
D) Other (please describe after [Answer]: tag below)

[Answer]: C (3개로 나눠줘)

---

## 생성 계획 (Execution Plan)

### Phase 1: 유닛 정의
- [x] 유닛 목록 및 각 유닛의 범위/책임 정의
- [x] 각 유닛에 포함되는 컴포넌트/모듈 매핑

### Phase 2: 의존성 분석
- [x] 유닛 간 의존성 매트릭스 작성
- [x] 개발 순서 결정

### Phase 3: 스토리 매핑
- [x] 유저 스토리를 유닛에 매핑
- [x] 커버리지 검증 (모든 스토리가 유닛에 할당)

### Phase 4: 검증
- [x] 유닛 경계 검증 (순환 의존 없음)
- [x] 각 유닛이 독립적으로 테스트 가능한지 확인

---

## 산출물
- `aidlc-docs/inception/application-design/unit-of-work.md`
- `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
