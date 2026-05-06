# Backend Functional Design Plan

## 계획 개요
Unit 1 (Backend API Server)의 상세 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 설계합니다.

---

## 질문 (Questions)

### Question 1
주문 상태 전이 규칙을 어떻게 정의하시겠습니까?

A) 단방향만 허용: PENDING → PREPARING → COMPLETED (역방향 불가)
B) 유연한 전이: 어떤 상태에서든 다른 상태로 변경 가능
C) 단방향 + 취소: PENDING → PREPARING → COMPLETED, 그리고 어떤 상태에서든 → CANCELLED 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 2
테이블 세션 시작 시점을 어떻게 정의하시겠습니까?

A) 첫 주문 생성 시 자동으로 세션 시작 (요구사항 원문 기준)
B) 관리자가 명시적으로 세션 시작 버튼 클릭
C) 테이블 태블릿 로그인 시 자동 세션 시작
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 3
주문 번호 생성 규칙은 어떻게 하시겠습니까?

A) 매장 내 일일 순번 (예: 001, 002, 003... 매일 리셋)
B) 전역 고유 ID (UUID 또는 시퀀스)
C) 매장코드 + 날짜 + 순번 (예: ST01-20260506-001)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 4
메뉴 가격 검증 범위는 어떻게 설정하시겠습니까?

A) 100원 ~ 1,000,000원 (일반 음식점 기준)
B) 0원 ~ 10,000,000원 (무료 메뉴 허용, 고가 메뉴 포함)
C) 1원 ~ 999,999원
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 5
관리자 로그인 시도 제한 정책은 어떻게 하시겠습니까?

A) 5회 실패 시 15분 차단
B) 3회 실패 시 30분 차단
C) 10회 실패 시 1시간 차단
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 6
이미지 업로드 제한은 어떻게 하시겠습니까?

A) 최대 5MB, 형식: JPG/PNG/WebP
B) 최대 10MB, 형식: JPG/PNG/WebP/GIF
C) 최대 2MB, 형식: JPG/PNG만
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## 생성 계획 (Execution Plan)

### Phase 1: 도메인 엔티티 설계
- [ ] 전체 엔티티 목록 및 관계 정의
- [ ] 각 엔티티의 필드, 타입, 제약조건 정의
- [ ] 엔티티 간 관계 (1:N, N:M) 정의

### Phase 2: 비즈니스 로직 모델
- [ ] 인증 플로우 상세 설계
- [ ] 주문 생성/상태 관리 로직 설계
- [ ] 테이블 세션 라이프사이클 설계
- [ ] 메뉴/카테고리 관리 로직 설계
- [ ] SSE 이벤트 발행 로직 설계

### Phase 3: 비즈니스 규칙 정의
- [ ] 검증 규칙 (입력값, 상태 전이, 권한)
- [ ] 비즈니스 제약조건 (가격 범위, 파일 크기 등)
- [ ] 에러 처리 규칙

---

## 산출물
- `aidlc-docs/construction/backend/functional-design/domain-entities.md`
- `aidlc-docs/construction/backend/functional-design/business-logic-model.md`
- `aidlc-docs/construction/backend/functional-design/business-rules.md`
