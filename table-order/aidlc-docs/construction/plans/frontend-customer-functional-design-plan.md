# Customer Frontend - Functional Design Plan

## 계획 개요
Unit 2 (Customer Frontend)의 UI 컴포넌트 구조, 사용자 인터랙션 플로우, 상태 관리, API 연동을 설계합니다.

---

## 질문 (Questions)

### Question 1
고객 앱의 네비게이션 구조를 어떻게 하시겠습니까?

A) 하단 탭 네비게이션 (메뉴 | 장바구니 | 주문내역) - 태블릿 터치에 최적
B) 상단 헤더 + 사이드 메뉴 - 전통적 웹 구조
C) 메뉴 화면 고정 + 장바구니/주문내역은 슬라이드 패널(Drawer)로 표시
D) Other (please describe after [Answer]: tag below)

[Answer]: C 인데 좀더 최근 트랜드 반영해줘(2026년)

### Question 2
장바구니 UI를 어떻게 표시하시겠습니까?

A) 하단에서 올라오는 Drawer (슬라이드업) - 메뉴 화면 위에 오버레이
B) 별도 페이지로 이동 (라우팅)
C) 화면 우측 사이드 패널 (항상 보이거나 토글)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
메뉴 카드에 "담기" 버튼을 어떻게 배치하시겠습니까?

A) 메뉴 카드 안에 "담기" 버튼 직접 배치 (한 번 터치로 바로 추가)
B) 메뉴 카드 클릭 → 상세 팝업 → 수량 선택 → 담기
C) 메뉴 카드 클릭 → 바로 장바구니에 1개 추가 (수량은 장바구니에서 조절)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
CSS/UI 프레임워크는 무엇을 사용하시겠습니까?

A) Tailwind CSS (유틸리티 기반, 빠른 개발)
B) Material UI (MUI) (풍부한 컴포넌트, 디자인 시스템)
C) Styled Components (CSS-in-JS)
D) 순수 CSS Modules (의존성 최소화)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## 생성 계획 (Execution Plan)

### Phase 1: 페이지/라우팅 구조 설계
- [x] 페이지 목록 및 라우팅 정의
- [x] 네비게이션 플로우 정의

### Phase 2: 컴포넌트 상세 설계
- [x] 각 Feature별 컴포넌트 트리 정의
- [x] Props/State 인터페이스 정의
- [x] 사용자 인터랙션 플로우 정의

### Phase 3: 상태 관리 설계
- [x] Context/Reducer 구조 정의
- [x] localStorage 영속화 전략

### Phase 4: API 연동 설계
- [x] 사용할 Backend API 목록 및 요청/응답 타입
- [x] Mock API 핸들러 구조

---

## 산출물
- `aidlc-docs/construction/frontend-customer/functional-design/frontend-components.md`
- `aidlc-docs/construction/frontend-customer/functional-design/business-logic-model.md`
- `aidlc-docs/construction/frontend-customer/functional-design/business-rules.md`
