# Customer Frontend - 컴포넌트 설계

## 설계 결정 요약
| 항목 | 결정 |
|------|------|
| **네비게이션** | 메뉴 풀스크린 고정 + 우측 사이드 패널 (장바구니/주문내역 토글) |
| **장바구니 UI** | 우측 사이드 패널 (토글, 슬라이드 애니메이션) |
| **메뉴 담기** | 카드 클릭 → 상세 팝업(Bottom Sheet) → 수량 선택 → 담기 |
| **CSS** | CSS Modules (의존성 최소화) |
| **2026 트렌드** | 풀스크린 이머시브 메뉴, 플로팅 장바구니 버튼, 부드러운 전환 애니메이션, 햅틱 피드백 스타일 마이크로 인터랙션 |

---

## 1. 페이지/라우팅 구조

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 자동 리다이렉트 | → `/menu` (인증 완료 시) 또는 `/setup` (미설정 시) |
| `/setup` | TableSetupPage | 태블릿 초기 설정 (관리자가 1회 수행) |
| `/menu` | MenuPage | 메뉴 탐색 (기본 화면) + 우측 사이드 패널 |
| `/orders` | OrderHistoryPage | 주문 내역 조회 |

### 네비게이션 플로우
```
[앱 시작]
    |
    v
[AutoLogin 체크]
    |--- 성공 → /menu (메뉴 화면)
    |--- 실패 → /setup (초기 설정)
    
[/menu 화면 구성]
+------------------------------------------+----------+
|                                          |          |
|  [카테고리 탭]                           | 장바구니  |
|                                          | 사이드   |
|  [메뉴 그리드]                           | 패널     |
|  ┌──────┐ ┌──────┐ ┌──────┐            | (토글)   |
|  │ 메뉴1 │ │ 메뉴2 │ │ 메뉴3 │            |          |
|  └──────┘ └──────┘ └──────┘            |          |
|                                          |          |
|  [플로팅 장바구니 버튼 🛒 (3)]           |          |
+------------------------------------------+----------+
|  [하단 바: 주문내역 보기]                            |
+------------------------------------------------------+
```

---

## 2. 컴포넌트 트리

### 2.1 App 레벨
```
App
├── AuthProvider (Context)
├── CartProvider (Context)
├── Router
│   ├── /setup → TableSetupPage
│   ├── /menu → MenuPage
│   └── /orders → OrderHistoryPage
└── Toast (전역 알림)
```

### 2.2 MenuPage (핵심 화면)
```
MenuPage
├── Header
│   └── StoreName + TableNumber
├── CategoryTabs
│   └── CategoryTab[] (스크롤 가능한 탭 바)
├── MenuGrid
│   └── MenuCard[] (카드 그리드)
├── MenuDetailSheet (Bottom Sheet 팝업)
│   ├── MenuImage
│   ├── MenuInfo (이름, 가격, 설명)
│   ├── QuantitySelector (+/- 버튼)
│   └── AddToCartButton
├── CartSidePanel (우측 슬라이드 패널)
│   ├── CartHeader (총 N개 항목)
│   ├── CartItemList
│   │   └── CartItem[] (메뉴명, 수량 조절, 소계, 삭제)
│   ├── CartSummary (총 금액)
│   └── OrderButton (주문하기)
├── FloatingCartButton (플로팅 버튼 🛒 + 뱃지)
└── BottomBar
    └── OrderHistoryLink (주문내역 보기)
```

### 2.3 OrderHistoryPage
```
OrderHistoryPage
├── Header (← 뒤로가기 + "주문 내역")
├── OrderList
│   └── OrderCard[]
│       ├── OrderNumber + OrderTime
│       ├── OrderItemList (메뉴명 x 수량)
│       ├── OrderTotal
│       └── StatusBadge (대기중/준비중/완료)
└── BackToMenuButton
```

### 2.4 TableSetupPage
```
TableSetupPage
├── SetupForm
│   ├── StoreIdInput
│   ├── TableNumberInput
│   ├── PasswordInput (기기 잠금용)
│   └── SubmitButton
└── ErrorMessage
```

---

## 3. Props/State 인터페이스

### 3.1 주요 타입 정의

```typescript
// 메뉴 관련
interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  displayOrder: number;
}

// 장바구니 관련
interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

// 주문 관련
interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
  createdAt: string;
}

interface OrderItem {
  menuName: string;
  quantity: number;
  price: number;
}

// 인증 관련
interface TableInfo {
  storeId: number;
  tableId: number;
  tableNumber: number;
  sessionId: number | null;
}
```

### 3.2 주요 컴포넌트 Props

```typescript
// MenuCard
interface MenuCardProps {
  menu: Menu;
  onClick: (menu: Menu) => void;
}

// MenuDetailSheet
interface MenuDetailSheetProps {
  menu: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (menu: Menu, quantity: number) => void;
}

// CartItem
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (menuId: number, quantity: number) => void;
  onRemove: (menuId: number) => void;
}

// CartSidePanel
interface CartSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOrder: () => void;
}

// OrderCard
interface OrderCardProps {
  order: Order;
}

// StatusBadge
interface StatusBadgeProps {
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
}
```

---

## 4. 사용자 인터랙션 플로우

### 4.1 메뉴 탐색 → 장바구니 추가
```
1. 사용자가 카테고리 탭 터치 → 해당 카테고리 메뉴로 스크롤/필터
2. 메뉴 카드 터치 → MenuDetailSheet(Bottom Sheet) 올라옴
3. 수량 선택 (+/- 버튼, 기본값 1)
4. "담기" 버튼 터치 → 장바구니에 추가
5. Bottom Sheet 닫힘 + 플로팅 버튼 뱃지 숫자 증가 (애니메이션)
6. Toast: "장바구니에 추가되었습니다"
```

### 4.2 장바구니 → 주문
```
1. 플로팅 장바구니 버튼 터치 → 우측 사이드 패널 슬라이드 오픈
2. 장바구니 내용 확인 (수량 조절/삭제 가능)
3. "주문하기" 버튼 터치 → 주문 확인 다이얼로그 표시
4. "확인" 터치 → API 호출 (POST /api/orders)
5. 성공 시:
   - 주문 성공 모달 표시 (주문번호, 5초 카운트다운)
   - 장바구니 자동 비우기
   - 사이드 패널 닫기
   - 5초 후 자동으로 모달 닫힘 (또는 터치로 즉시 닫기)
6. 실패 시:
   - 에러 Toast 표시
   - 장바구니 유지
```

### 4.3 주문 내역 조회
```
1. 하단 바 "주문내역 보기" 터치 → /orders 페이지 이동
2. 현재 세션 주문 목록 표시 (시간순)
3. 각 주문의 상태 뱃지 확인
4. "메뉴로 돌아가기" 터치 → /menu 복귀
```

---

## 5. 2026 UX 트렌드 적용 사항

| 트렌드 | 적용 |
|--------|------|
| **이머시브 풀스크린** | 메뉴가 전체 화면 차지, 최소한의 크롬(UI 장식) |
| **Bottom Sheet** | 메뉴 상세를 하단에서 올라오는 시트로 표시 (모바일 네이티브 느낌) |
| **플로팅 액션** | 장바구니 버튼이 화면 위에 떠있음 (항상 접근 가능) |
| **마이크로 인터랙션** | 담기 시 뱃지 바운스, 수량 변경 시 가격 슬라이드 업데이트 |
| **부드러운 전환** | 사이드 패널 슬라이드, Bottom Sheet 스프링 애니메이션 |
| **큰 터치 영역** | 모든 인터랙티브 요소 최소 48x48px (44px 이상) |
| **다크/라이트 대응** | CSS 변수 기반 테마 (prefers-color-scheme) |
