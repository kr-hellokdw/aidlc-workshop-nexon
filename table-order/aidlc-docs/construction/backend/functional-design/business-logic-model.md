# Business Logic Model - Backend API Server

---

## 1. 주문 생성 플로우

### 트리거
고객이 장바구니에서 "주문하기" 버튼 클릭 → POST /api/orders

### 입력
```
{
  items: [{ menuId: Long, quantity: Integer }]
}
```
> 인증 정보(storeId, tableId)는 JWT 토큰에서 추출

### 처리 순서

```
1. JWT에서 storeId, tableId 추출
2. TableSessionService.getOrCreateSession(tableId)
   ├── 활성 세션 존재 → 반환
   └── 활성 세션 없음 → 새 세션 생성 (status=ACTIVE, startedAt=now)
3. 메뉴 검증
   ├── MenuRepository.findAllById(menuIds)
   ├── 모든 menuId가 존재하는지 확인
   ├── 모든 메뉴가 해당 storeId 소속인지 확인
   └── 모든 메뉴가 available=true인지 확인
4. 주문번호 생성
   └── 해당 매장의 오늘 주문 수 + 1 (매장별 일일 순번)
5. 가격 계산 (서버 가격 우선)
   ├── 각 OrderItem: menuPrice = DB의 현재 menu.price
   ├── 각 OrderItem: subtotal = menuPrice × quantity
   └── totalAmount = sum(subtotals)
6. Order + OrderItems 저장
   ├── Order(storeId, tableId, sessionId, orderNumber, PENDING, totalAmount, now)
   └── OrderItem(orderId, menuId, menuName, menuPrice, quantity, subtotal) × N
7. SSE 이벤트 발행
   └── SseService.publishEvent(storeId, NEW_ORDER, orderData)
8. OrderResponse 반환
```

### 실패 시나리오
| 조건 | 예외 | HTTP |
|------|------|------|
| 메뉴 ID 존재하지 않음 | MenuNotFoundException | 404 |
| 메뉴가 다른 매장 소속 | AccessDeniedException | 403 |
| 메뉴 판매 불가 (available=false) | MenuNotAvailableException | 400 |
| 빈 주문 (items 비어있음) | InvalidOrderException | 400 |
| 수량 0 이하 | ValidationException | 400 |

---

## 2. 주문 상태 전이

### 상태 다이어그램
```
PENDING ──→ PREPARING ──→ COMPLETED
  (생성)      (준비중)      (완료)
```

### 전이 규칙
| 현재 상태 | 허용 전이 | 비허용 |
|-----------|-----------|--------|
| PENDING | → PREPARING | → COMPLETED (건너뛰기 불가) |
| PREPARING | → COMPLETED | → PENDING (역방향 불가) |
| COMPLETED | 없음 (최종 상태) | 모든 전이 불가 |

### 상태 변경 처리
```
1. 주문 조회 (orderId + storeId 검증)
2. 현재 상태에서 요청 상태로 전이 가능한지 검증
3. 상태 업데이트
4. SSE 이벤트 발행 (ORDER_STATUS_CHANGED)
5. 응답 반환
```

---

## 3. 테이블 세션 라이프사이클

### 상태 다이어그램
```
[세션 없음] ──→ ACTIVE ──→ COMPLETED ──→ [세션 없음]
  (첫 주문 시)   (이용 중)   (이용 완료)    (다음 고객 대기)
```

### 세션 시작 (자동)
- **트리거**: 첫 주문 생성 시 (getOrCreateSession)
- **조건**: 해당 테이블에 ACTIVE 세션이 없을 때
- **동작**: TableSession 생성 (status=ACTIVE, startedAt=now)

### 세션 종료 (이용 완료)
- **트리거**: 관리자가 POST /api/admin/tables/{tableId}/complete-session
- **처리 순서**:
```
1. 해당 테이블의 ACTIVE 세션 조회
2. 세션 없으면 → 예외 (NoActiveSessionException)
3. 미완료 주문(PENDING/PREPARING) 일괄 COMPLETED 처리 (강제 종료)
4. 세션 상태 → COMPLETED, completedAt = now
5. SSE 이벤트 발행 (SESSION_COMPLETED)
6. 응답 반환
```

---

## 4. 메뉴/카테고리 CRUD 비즈니스 규칙

### 메뉴 생성
```
1. 입력 검증 (name, price, categoryId 필수)
2. 카테고리 존재 + 같은 매장 소속 확인
3. 이미지 URL 설정 (있으면)
4. displayOrder = 해당 카테고리 내 마지막 순서 + 1
5. Menu 저장
```

### 메뉴 수정
```
1. 메뉴 존재 + 매장 소속 확인
2. 카테고리 변경 시: 새 카테고리 존재 + 같은 매장 확인
3. 이미지 변경 시: 기존 이미지 삭제 + 새 이미지 URL 설정
4. 필드 업데이트
```

### 메뉴 삭제
```
1. 메뉴 존재 + 매장 소속 확인
2. 이미지 있으면 파일 삭제
3. 메뉴 물리 삭제 (OrderItem.menuId → SET NULL, 스냅샷 유지)
```

### 메뉴 순서 변경
```
1. 요청: [{menuId, displayOrder}] 목록
2. 모든 menuId가 같은 매장 소속 확인
3. 일괄 displayOrder 업데이트
```

### 카테고리 생성
```
1. 입력 검증 (name 필수)
2. 같은 매장 내 중복 이름 확인
3. displayOrder = 마지막 순서 + 1
4. Category 저장
```

### 카테고리 삭제
```
1. 카테고리 존재 + 매장 소속 확인
2. 소속 메뉴 존재 여부 확인
3. 메뉴 있으면 → 예외 (CategoryHasMenusException, 삭제 차단)
4. 메뉴 없으면 → 카테고리 삭제
```

---

## 5. 인증/인가 비즈니스 규칙

### 관리자 로그인
```
1. 로그인 시도 차단 확인 (LoginAttemptService.isBlocked)
   └── 차단 중이면 → AccountLockedException (15분 대기)
2. Admin 조회 (storeId + username)
   └── 없으면 → 실패 기록 + BadCredentialsException
3. 비밀번호 검증 (BCrypt)
   ├── 실패 → 실패 기록 (recordFailedAttempt)
   └── 성공 → 시도 초기화 (resetAttempts)
4. JWT 토큰 발급
   ├── Access Token: {sub: adminId, storeId, role: ADMIN, exp: 16h}
   └── Refresh Token: {sub: adminId, exp: 24h}
5. TokenResponse 반환
```

### 테이블 로그인
```
1. RestaurantTable 조회 (storeId + tableNumber)
   └── 없으면 → BadCredentialsException
2. 비밀번호 검증 (BCrypt)
   └── 실패 → BadCredentialsException
3. JWT 토큰 발급
   ├── Access Token: {sub: tableId, storeId, tableNumber, role: TABLE, exp: 16h}
   └── Refresh Token: {sub: tableId, exp: 24h}
4. TokenResponse 반환
```

### 로그인 시도 제한 (LoginAttemptService)
- **키**: `storeId:username` (관리자) 또는 `storeId:tableNumber` (테이블)
- **저장**: ConcurrentHashMap (인메모리)
- **규칙**: 5회 연속 실패 → 15분 차단
- **리셋**: 로그인 성공 시 해당 키 초기화
- **만료**: 15분 후 자동 해제

### JWT 토큰 구조
```
Access Token Claims:
- sub: 사용자 ID (adminId 또는 tableId)
- storeId: 매장 ID
- role: ADMIN 또는 TABLE
- tableNumber: 테이블 번호 (TABLE role만)
- iat: 발급 시각
- exp: 만료 시각 (16시간)

Refresh Token Claims:
- sub: 사용자 ID
- iat: 발급 시각
- exp: 만료 시각 (24시간)
```

---

## 6. SSE 이벤트 발행 규칙

### 이벤트 타입 및 트리거

| 이벤트 | 트리거 | 데이터 |
|--------|--------|--------|
| NEW_ORDER | 주문 생성 성공 후 | OrderResponse (전체 주문 정보) |
| ORDER_STATUS_CHANGED | 주문 상태 변경 후 | {orderId, tableId, newStatus} |
| ORDER_DELETED | 주문 삭제 후 | {orderId, tableId, deletedAmount} |
| SESSION_COMPLETED | 이용 완료 처리 후 | {tableId, sessionId} |
| HEARTBEAT | 30초 주기 (스케줄러) | {timestamp} |

### SSE 연결 관리
```
구독 (subscribe):
1. SseEmitter 생성 (timeout: 30분)
2. 매장별 emitter 목록에 추가 (ConcurrentHashMap<Long, List<SseEmitter>>)
3. onCompletion/onTimeout/onError 콜백 등록 → emitter 제거
4. 초기 연결 확인 이벤트 전송

이벤트 발행 (publishEvent):
1. 해당 storeId의 emitter 목록 조회
2. 각 emitter에 이벤트 전송
3. 전송 실패한 emitter는 목록에서 제거 (dead connection 정리)

Heartbeat (sendHeartbeat):
1. @Scheduled(fixedRate = 30000)
2. 모든 활성 emitter에 HEARTBEAT 이벤트 전송
3. 전송 실패 emitter 정리
```

---

## 7. 주문번호 생성 로직

### 매장별 일일 순번
```
generateOrderNumber(storeId):
1. 오늘 날짜 범위 계산 (00:00:00 ~ 23:59:59)
2. SELECT COUNT(*) FROM orders WHERE storeId = ? AND orderedAt BETWEEN ? AND ?
3. return count + 1
```

### 동시성 고려
- 동일 매장에서 동시 주문 시 중복 번호 가능성
- 해결: DB 레벨에서 (storeId, orderNumber, DATE(orderedAt)) UNIQUE 제약
- 충돌 시 재시도 (최대 3회)

---

## 8. 대시보드 초기 데이터 로직

### GET /api/admin/dashboard
```
1. storeId의 모든 테이블 조회
2. 각 테이블별:
   ├── 현재 ACTIVE 세션 조회
   ├── 세션의 주문 목록 조회 (최신순)
   └── 총 주문액 계산
3. DashboardResponse 구성:
   {
     tables: [{
       tableId, tableNumber,
       hasActiveSession: boolean,
       totalAmount: Integer,
       orders: [OrderSummary]
     }]
   }
```
