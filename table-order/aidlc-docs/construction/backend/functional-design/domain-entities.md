# Domain Entities - Backend API Server

---

## 1. 공통 (BaseEntity)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Long (PK, Auto Increment) | 고유 식별자 |
| `createdAt` | LocalDateTime | 생성 시각 (자동) |
| `updatedAt` | LocalDateTime | 수정 시각 (자동) |

---

## 2. Store (매장)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 매장 ID |
| `name` | String | NOT NULL, max 50 | 매장명 |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: 1:N → Admin, Table, Category, Menu

---

## 3. Admin (관리자)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 관리자 ID |
| `storeId` | Long (FK) | NOT NULL | 소속 매장 |
| `username` | String | NOT NULL, max 30, UNIQUE per store | 사용자명 |
| `password` | String | NOT NULL | bcrypt 해시 비밀번호 |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: N:1 → Store
**유니크 제약**: (storeId, username)
**계정 생성**: DB 시드 데이터로 직접 삽입 (회원가입 API 없음)

---

## 4. RestaurantTable (테이블)

> 엔티티명을 `RestaurantTable`로 사용 (SQL 예약어 `TABLE` 회피)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 테이블 ID |
| `storeId` | Long (FK) | NOT NULL | 소속 매장 |
| `tableNumber` | Integer | NOT NULL | 테이블 번호 |
| `password` | String | NOT NULL | bcrypt 해시 (태블릿 보안 잠금용) |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: N:1 → Store, 1:N → TableSession
**유니크 제약**: (storeId, tableNumber)

---

## 5. TableSession (테이블 세션)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 세션 ID |
| `tableId` | Long (FK) | NOT NULL | 소속 테이블 |
| `storeId` | Long (FK) | NOT NULL | 소속 매장 (쿼리 편의) |
| `status` | Enum (ACTIVE, COMPLETED) | NOT NULL, default ACTIVE | 세션 상태 |
| `startedAt` | LocalDateTime | NOT NULL | 세션 시작 시각 |
| `completedAt` | LocalDateTime | NULL | 세션 종료 시각 |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: N:1 → RestaurantTable, 1:N → Order
**비즈니스 규칙**:
- 테이블당 ACTIVE 세션은 최대 1개
- 첫 주문 생성 시 자동 생성 (getOrCreateSession)
- 이용 완료 시 status = COMPLETED, completedAt 기록

---

## 6. Category (카테고리)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 카테고리 ID |
| `storeId` | Long (FK) | NOT NULL | 소속 매장 |
| `name` | String | NOT NULL, max 30 | 카테고리명 |
| `displayOrder` | Integer | NOT NULL, default 0 | 표시 순서 |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: N:1 → Store, 1:N → Menu
**유니크 제약**: (storeId, name)
**비즈니스 규칙**: 메뉴가 있는 카테고리는 삭제 불가

---

## 7. Menu (메뉴)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 메뉴 ID |
| `storeId` | Long (FK) | NOT NULL | 소속 매장 |
| `categoryId` | Long (FK) | NOT NULL | 소속 카테고리 |
| `name` | String | NOT NULL, max 50 | 메뉴명 |
| `price` | Integer | NOT NULL, min 0 | 가격 (원) |
| `description` | String | NULL, max 200 | 메뉴 설명 |
| `imageUrl` | String | NULL, max 255 | 이미지 URL |
| `displayOrder` | Integer | NOT NULL, default 0 | 표시 순서 |
| `available` | Boolean | NOT NULL, default true | 판매 가능 여부 |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: N:1 → Store, N:1 → Category
**비즈니스 규칙**: 삭제 시 물리 삭제 (OrderItem에 스냅샷 보존)

---

## 8. Order (주문)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 주문 ID |
| `storeId` | Long (FK) | NOT NULL | 소속 매장 |
| `tableId` | Long (FK) | NOT NULL | 주문 테이블 |
| `sessionId` | Long (FK) | NOT NULL | 소속 세션 |
| `orderNumber` | Integer | NOT NULL | 매장별 일일 순번 |
| `status` | Enum (PENDING, PREPARING, COMPLETED) | NOT NULL, default PENDING | 주문 상태 |
| `totalAmount` | Integer | NOT NULL | 총 주문 금액 (원) |
| `orderedAt` | LocalDateTime | NOT NULL | 주문 시각 |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |
| `updatedAt` | LocalDateTime | NOT NULL | 수정 시각 |

**관계**: N:1 → Store, N:1 → RestaurantTable, N:1 → TableSession, 1:N → OrderItem
**비즈니스 규칙**:
- 상태 전이: PENDING → PREPARING → COMPLETED (단방향만 허용)
- orderNumber: 매장별 당일 순번 (매일 1부터 리셋)
- totalAmount: 서버에서 DB 가격 기준으로 계산

---

## 9. OrderItem (주문 항목)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | Long (PK) | Auto Increment | 항목 ID |
| `orderId` | Long (FK) | NOT NULL | 소속 주문 |
| `menuId` | Long (FK) | NULL | 원본 메뉴 (삭제 시 NULL) |
| `menuName` | String | NOT NULL, max 50 | 메뉴명 스냅샷 |
| `menuPrice` | Integer | NOT NULL | 단가 스냅샷 (주문 시점 가격) |
| `quantity` | Integer | NOT NULL, min 1 | 수량 |
| `subtotal` | Integer | NOT NULL | 소계 (menuPrice × quantity) |
| `createdAt` | LocalDateTime | NOT NULL | 생성 시각 |

**관계**: N:1 → Order, N:1 → Menu (nullable)
**비즈니스 규칙**:
- menuName, menuPrice: 주문 시점의 메뉴 정보 스냅샷 (메뉴 삭제/가격 변경에도 이력 보존)
- menuId: 메뉴 삭제 시 SET NULL (참조 무결성)

---

## 10. 엔티티 관계 다이어그램 (ERD)

```
Store (1) ──── (N) Admin
  |
  ├── (1) ──── (N) RestaurantTable
  |                    |
  |                    └── (1) ──── (N) TableSession
  |                                        |
  |                                        └── (1) ──── (N) Order
  |                                                        |
  |                                                        └── (1) ──── (N) OrderItem
  |
  ├── (1) ──── (N) Category
  |                    |
  |                    └── (1) ──── (N) Menu ─── (referenced by) ─── OrderItem
  |
  └── (1) ──── (N) Menu
```

---

## 11. DB 테이블명 매핑

| 엔티티 | DB 테이블명 |
|--------|-------------|
| Store | `store` |
| Admin | `admin` |
| RestaurantTable | `restaurant_table` |
| TableSession | `table_session` |
| Category | `category` |
| Menu | `menu` |
| Order | `orders` |
| OrderItem | `order_item` |
