# Customer Frontend - 비즈니스 로직 모델

---

## 1. 인증 로직 (AuthContext)

### 자동 로그인 플로우
```
앱 시작
  |
  v
localStorage에서 인증 정보 로드
  |--- 없음 → /setup 이동
  |--- 있음 → 토큰 유효성 확인
                |--- 유효 → 메뉴 화면 표시
                |--- 만료 → POST /api/auth/table/login (저장된 정보로 재로그인)
                              |--- 성공 → 새 토큰 저장 → 메뉴 화면
                              |--- 실패 → localStorage 클리어 → /setup 이동
```

### 저장 데이터 (localStorage)
```typescript
interface StoredAuth {
  storeId: number;
  tableNumber: number;
  password: string;  // 태블릿 기기 잠금용 비밀번호
  token: string;     // JWT access token
  tableId: number;
  sessionId: number | null;
}
```

### 토큰 관리
- Axios 인터셉터에서 모든 요청에 `Authorization: Bearer <token>` 자동 첨부
- 401 응답 시 자동 재로그인 시도 → 실패 시 /setup 이동

---

## 2. 장바구니 로직 (CartContext)

### 상태 구조
```typescript
interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menu: Menu; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { menuId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { menuId: number; quantity: number } }
  | { type: 'CLEAR_CART' };
```

### Reducer 로직
```
ADD_ITEM:
  - 이미 있는 메뉴 → quantity 누적 (기존 수량 + 추가 수량)
  - 새 메뉴 → items에 추가

REMOVE_ITEM:
  - menuId로 필터링하여 제거

UPDATE_QUANTITY:
  - quantity <= 0 → 해당 아이템 제거
  - quantity > 0 → 수량 업데이트

CLEAR_CART:
  - items = []
```

### localStorage 동기화
- 모든 상태 변경 후 `localStorage.setItem('cart', JSON.stringify(state.items))` 호출
- 앱 시작 시 `localStorage.getItem('cart')` 로 초기 상태 복원
- 주문 성공 시 `CLEAR_CART` → localStorage도 클리어

### 계산 로직
```typescript
totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
```

---

## 3. 메뉴 조회 로직 (useMenu hook)

### 데이터 로드
```
컴포넌트 마운트 시:
  1. GET /api/stores/{storeId}/categories → 카테고리 목록
  2. GET /api/stores/{storeId}/menus → 전체 메뉴 목록
  3. 카테고리별로 메뉴 그룹핑 (클라이언트 측)
```

### 카테고리 필터링
- 선택된 카테고리 ID로 메뉴 필터링
- "전체" 탭 선택 시 모든 메뉴 표시
- 카테고리 탭은 displayOrder 순으로 정렬

### 이미지 URL 처리
- `imageUrl`이 있으면: `{API_BASE_URL}/api/files/images/{filename}` 으로 표시
- `imageUrl`이 null이면: 기본 플레이스홀더 이미지 표시

---

## 4. 주문 생성 로직 (useOrder hook)

### 주문 생성 플로우
```
1. 장바구니 items → OrderCreateRequest 변환
2. POST /api/orders 호출
3. 성공 시:
   - OrderResponse에서 orderNumber 추출
   - 주문 성공 모달 표시 (5초 타이머)
   - CartContext.clearCart() 호출
   - 5초 후 모달 자동 닫기
4. 실패 시:
   - 에러 메시지 Toast 표시
   - 장바구니 유지 (변경 없음)
```

### 요청 데이터
```typescript
interface OrderCreateRequest {
  items: Array<{
    menuId: number;
    quantity: number;
  }>;
}
```

### 주문 내역 조회
```
GET /api/orders/current
  → 현재 세션의 주문 목록 반환
  → 시간순 정렬 (최신 먼저)
```

---

## 5. 사이드 패널 상태 관리

### 패널 토글 로직
```typescript
// 메뉴 페이지 로컬 상태
const [isCartOpen, setIsCartOpen] = useState(false);

// 플로팅 버튼 클릭 → 패널 토글
// 주문 완료 → 패널 닫기
// 패널 외부 클릭 → 패널 닫기 (선택적)
```

### 패널 열림 조건
- 플로팅 장바구니 버튼 클릭 시 토글
- 장바구니가 비어있어도 열림 (빈 상태 안내 메시지 표시)
