# Integration Test Instructions - Backend API Server

## 목적
백엔드 API 서버의 모듈 간 상호작용을 검증합니다.

---

## 테스트 환경 설정

### 1. 테스트 DB 실행
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 애플리케이션 실행
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=dev'
```

---

## 통합 테스트 시나리오

### Scenario 1: 고객 주문 전체 플로우

**설명**: 테이블 로그인 → 메뉴 조회 → 주문 생성 → 주문 조회

```bash
# 1. 테이블 로그인
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/table/login \
  -H "Content-Type: application/json" \
  -d '{"storeId": 1, "tableNumber": 1, "password": "1234"}' \
  | jq -r '.data.accessToken')

echo "Table Token: $TOKEN"

# 2. 메뉴 조회
curl -s http://localhost:8080/api/stores/1/menus \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# 3. 주문 생성
ORDER=$(curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"menuId": 1, "quantity": 2}, {"menuId": 7, "quantity": 1}]}')

echo "Order: $ORDER" | jq '.data'

# 4. 현재 주문 조회
curl -s http://localhost:8080/api/orders/current \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

**예상 결과**:
- 로그인 성공 (200, accessToken 반환)
- 메뉴 9개 조회
- 주문 생성 성공 (201, orderNumber=1, totalAmount=20000)
- 현재 주문 1건 조회

---

### Scenario 2: 관리자 주문 관리 플로우

**설명**: 관리자 로그인 → 대시보드 → 주문 상태 변경 → 이용 완료

```bash
# 1. 관리자 로그인
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"storeId": 1, "username": "admin", "password": "admin123"}' \
  | jq -r '.data.accessToken')

# 2. 대시보드 조회
curl -s http://localhost:8080/api/admin/tables/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data'

# 3. 주문 상태 변경 (PENDING → PREPARING)
curl -s -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "PREPARING"}' | jq '.data'

# 4. 주문 상태 변경 (PREPARING → COMPLETED)
curl -s -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "COMPLETED"}' | jq '.data'

# 5. 이용 완료
curl -s -X POST http://localhost:8080/api/admin/tables/1/complete-session \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
```

**예상 결과**:
- 대시보드에 테이블 5개 표시, 테이블 1에 주문 있음
- 상태 전이 성공 (PENDING → PREPARING → COMPLETED)
- 이용 완료 성공 (세션 종료)

---

### Scenario 3: SSE 실시간 알림

**설명**: SSE 구독 → 주문 생성 → 이벤트 수신 확인

```bash
# 터미널 1: SSE 구독 (관리자)
curl -N http://localhost:8080/api/admin/sse/subscribe \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 터미널 2: 주문 생성 (고객)
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"menuId": 3, "quantity": 1}]}'
```

**예상 결과**:
- 터미널 1에서 CONNECTED 이벤트 수신
- 주문 생성 후 터미널 1에서 NEW_ORDER 이벤트 수신
- 30초마다 HEARTBEAT 이벤트 수신

---

### Scenario 4: 보안 검증

```bash
# 1. 인증 없이 관리자 API 접근 → 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/admin/tables

# 2. TABLE 토큰으로 관리자 API 접근 → 403
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/admin/tables \
  -H "Authorization: Bearer $TOKEN"

# 3. 잘못된 비밀번호 5회 → 차단
for i in {1..5}; do
  curl -s -X POST http://localhost:8080/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"storeId": 1, "username": "admin", "password": "wrong"}'
done

# 6번째 시도 → 403 (차단)
curl -s http://localhost:8080/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"storeId": 1, "username": "admin", "password": "admin123"}' | jq '.'
```

**예상 결과**:
- 인증 없음: 401
- 권한 부족: 403
- 5회 실패 후: 403 (ACCOUNT_LOCKED)

---

### Scenario 5: 비즈니스 규칙 검증

```bash
# 1. 잘못된 상태 전이 (PENDING → COMPLETED) → 400
curl -s -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "COMPLETED"}' | jq '.'

# 2. 메뉴 있는 카테고리 삭제 → 400
curl -s -X DELETE http://localhost:8080/api/admin/categories/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# 3. 판매 불가 메뉴 주문 → 400
# (먼저 메뉴를 비활성화한 후 주문 시도)
```

**예상 결과**:
- 잘못된 상태 전이: 400 (INVALID_ORDER_STATUS_TRANSITION)
- 카테고리 삭제 차단: 400 (CATEGORY_HAS_MENUS)

---

## 정리

```bash
# 테스트 후 DB 초기화 (필요 시)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```
