# Unit 1: Backend API Server - Functional Design Plan

## 계획 개요
Backend API Server의 비즈니스 로직을 상세 설계하기 위한 질문 및 실행 계획입니다.

---

## 질문 (Questions)

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

### Question 1
주문 상태 전이 규칙을 어떻게 정의하시겠습니까?

A) 단순 3단계: PENDING → PREPARING → COMPLETED (역방향 불가)
B) 3단계 + 취소: PENDING → PREPARING → COMPLETED, 어느 단계에서든 CANCELLED 가능
C) 3단계 + 역방향 허용: PREPARING → PENDING 되돌리기 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
주문번호 생성 규칙을 어떻게 하시겠습니까?

A) 매장별 일일 순번 (예: 001, 002, 003... 매일 리셋)
B) 매장별 세션 순번 (예: 테이블3-001, 테이블3-002)
C) 전역 고유 ID (UUID 또는 타임스탬프 기반)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
이용 완료 시 아직 PENDING/PREPARING 상태인 주문이 있으면 어떻게 처리하시겠습니까?

A) 이용 완료 차단 - 모든 주문이 COMPLETED여야만 세션 종료 가능
B) 강제 종료 - 미완료 주문도 자동으로 COMPLETED 처리 후 세션 종료
C) 경고 후 선택 - 미완료 주문 존재 알림 → 관리자가 강제 종료 또는 취소 선택
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
이미 주문된 메뉴를 삭제할 때 어떻게 처리하시겠습니까?

A) 삭제 차단 - 활성 주문에 포함된 메뉴는 삭제 불가
B) Soft Delete - 메뉴를 비활성화(숨김)하되 기존 주문 데이터는 유지
C) 삭제 허용 - 메뉴 삭제, 기존 주문의 OrderItem에 메뉴명/가격 스냅샷으로 보존
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 5
메뉴가 포함된 카테고리를 삭제할 때 어떻게 처리하시겠습니까?

A) 삭제 차단 - 메뉴가 있는 카테고리는 삭제 불가
B) 메뉴 이동 - "미분류" 카테고리로 자동 이동 후 삭제
C) 연쇄 삭제 - 카테고리 삭제 시 소속 메뉴도 함께 삭제
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
같은 테이블에서 동시에 여러 주문이 들어올 때 어떻게 처리하시겠습니까?

A) 모두 허용 - 같은 세션에 여러 주문 독립 생성 (각각 별도 주문번호)
B) 병합 - 짧은 시간 내 동일 테이블 주문은 하나로 합침
C) 잠금 - 주문 처리 중 해당 테이블 추가 주문 차단
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
주문 생성 시 클라이언트가 보낸 가격과 서버 DB 가격이 다를 때 어떻게 처리하시겠습니까?

A) 서버 가격 우선 - 항상 DB의 현재 가격으로 계산 (클라이언트 가격 무시)
B) 불일치 시 거부 - 가격이 다르면 주문 거부 + 메뉴 새로고침 요청
C) 클라이언트 가격 사용 - 주문 시점의 표시 가격 존중
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
관리자 계정 생성은 어떻게 하시겠습니까?

A) DB 직접 삽입 - 초기 데이터로 관리자 계정 생성 (회원가입 API 없음)
B) 회원가입 API - 별도 관리자 등록 엔드포인트 제공
C) 시드 데이터 + 비밀번호 변경 API - 초기 계정은 시드, 이후 비밀번호만 변경 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 실행 계획 (Execution Plan)

### Phase 1: 도메인 엔티티 설계
- [x] 핵심 엔티티 상세 정의 (Store, Admin, Table, TableSession, Category, Menu, Order, OrderItem)
- [x] 엔티티 간 관계 및 제약조건 정의
- [x] BaseEntity 공통 필드 정의 (id, createdAt, updatedAt)

### Phase 2: 비즈니스 로직 모델
- [x] 주문 생성 플로우 상세 (세션 자동 생성 포함)
- [x] 주문 상태 전이 규칙 정의
- [x] 테이블 세션 라이프사이클 정의
- [x] 메뉴/카테고리 CRUD 비즈니스 규칙
- [x] 인증/인가 비즈니스 규칙 (로그인 시도 제한 포함)
- [x] SSE 이벤트 발행 규칙

### Phase 3: 비즈니스 규칙 정의
- [x] 입력 검증 규칙 (각 엔드포인트별)
- [x] 상태 전이 규칙 (주문, 세션)
- [x] 권한 규칙 (ADMIN vs TABLE role)
- [x] 매장 격리 규칙 (Store Isolation)
- [x] 에러 처리 규칙 (예외 유형별 HTTP 상태 매핑)

---

## 산출물
- `aidlc-docs/construction/backend/functional-design/domain-entities.md`
- `aidlc-docs/construction/backend/functional-design/business-logic-model.md`
- `aidlc-docs/construction/backend/functional-design/business-rules.md`
