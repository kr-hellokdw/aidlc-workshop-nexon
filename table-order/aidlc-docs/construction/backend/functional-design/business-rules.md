# Business Rules - Backend API Server

---

## 1. 입력 검증 규칙

### Auth 관련

| 엔드포인트 | 필드 | 규칙 |
|-----------|------|------|
| POST /api/auth/admin/login | storeId | NOT NULL, 양수 |
| | username | NOT NULL, 1~30자 |
| | password | NOT NULL, 1~100자 |
| POST /api/auth/table/login | storeId | NOT NULL, 양수 |
| | tableNumber | NOT NULL, 양수 |
| | password | NOT NULL, 1~100자 |

### Table 관련

| 엔드포인트 | 필드 | 규칙 |
|-----------|------|------|
| POST /api/admin/tables | tableNumber | NOT NULL, 양수, 매장 내 중복 불가 |
| | password | NOT NULL, 4~20자 |
| PUT /api/admin/tables/{tableId} | tableNumber | 양수 (변경 시), 매장 내 중복 불가 |
| | password | 4~20자 (변경 시) |

### Menu 관련

| 엔드포인트 | 필드 | 규칙 |
|-----------|------|------|
| POST /api/admin/menus | name | NOT NULL, 1~50자 |
| | price | NOT NULL, 0 이상 |
| | categoryId | NOT NULL, 존재하는 카테고리 |
| | description | NULL 허용, max 200자 |
| | imageUrl | NULL 허용, max 255자 |
| PUT /api/admin/menus/{menuId} | name | 1~50자 (변경 시) |
| | price | 0 이상 (변경 시) |

### Category 관련

| 엔드포인트 | 필드 | 규칙 |
|-----------|------|------|
| POST /api/admin/categories | name | NOT NULL, 1~30자, 매장 내 중복 불가 |
| PUT /api/admin/categories/{categoryId} | name | 1~30자, 매장 내 중복 불가 |

### Order 관련

| 엔드포인트 | 필드 | 규칙 |
|-----------|------|------|
| POST /api/orders | items | NOT NULL, 1개 이상 |
| | items[].menuId | NOT NULL, 양수, 존재하는 메뉴 |
| | items[].quantity | NOT NULL, 1 이상 |
| PUT /api/admin/orders/{orderId}/status | status | NOT NULL, 유효한 상태값 |

### File 관련

| 엔드포인트 | 필드 | 규칙 |
|-----------|------|------|
| POST /api/admin/files/upload | file | NOT NULL, 5MB 이하 |
| | | 허용 형식: jpg, jpeg, png, webp |

---

## 2. 상태 전이 규칙

### 주문 상태 (OrderStatus)

| 현재 | → 가능 | 설명 |
|------|--------|------|
| PENDING | PREPARING | 관리자가 주문 확인 |
| PREPARING | COMPLETED | 조리 완료 |
| COMPLETED | (없음) | 최종 상태 |

**위반 시**: InvalidOrderStatusTransitionException → 400 Bad Request

### 세션 상태 (SessionStatus)

| 현재 | → 가능 | 설명 |
|------|--------|------|
| ACTIVE | COMPLETED | 관리자 이용 완료 처리 |
| COMPLETED | (없음) | 최종 상태 |

**위반 시**: InvalidSessionStateException → 400 Bad Request

---

## 3. 권한 규칙 (Authorization)

### Role 기반 접근 제어

| 경로 패턴 | 허용 Role | 비고 |
|-----------|-----------|------|
| POST /api/auth/** | 인증 불필요 | 로그인/토큰 갱신 |
| GET /api/stores/{storeId}/menus | TABLE, ADMIN | 메뉴 조회 |
| GET /api/stores/{storeId}/categories | TABLE, ADMIN | 카테고리 조회 |
| POST /api/orders | TABLE | 주문 생성 (고객만) |
| GET /api/orders/current | TABLE | 현재 세션 주문 조회 |
| /api/admin/** | ADMIN | 관리자 전용 |
| GET /api/files/images/** | 인증 불필요 | 이미지 서빙 |

### 권한 위반 시
- 인증 없음 → 401 Unauthorized
- 권한 부족 → 403 Forbidden

---

## 4. 매장 격리 규칙 (Store Isolation)

### 원칙
모든 데이터 접근 시 JWT의 storeId로 필터링하여 다른 매장 데이터 접근 차단

### 적용 방식
```
1. JWT에서 storeId 추출 (JwtAuthenticationFilter)
2. Service 레이어에서 모든 조회/수정 시 storeId 조건 포함
3. 리소스 접근 시 해당 리소스의 storeId와 JWT storeId 일치 확인
```

### 검증 대상
| 리소스 | 검증 방법 |
|--------|-----------|
| Table | table.storeId == jwt.storeId |
| Menu | menu.storeId == jwt.storeId |
| Category | category.storeId == jwt.storeId |
| Order | order.storeId == jwt.storeId |
| TableSession | session.storeId == jwt.storeId |

### 위반 시
- AccessDeniedException → 403 Forbidden
- 로그에 위반 시도 기록 (보안 감사)

---

## 5. 에러 처리 규칙

### 예외 → HTTP 상태 매핑

| 예외 클래스 | HTTP 상태 | 설명 |
|------------|-----------|------|
| MethodArgumentNotValidException | 400 | Bean Validation 실패 |
| InvalidOrderStatusTransitionException | 400 | 잘못된 상태 전이 |
| InvalidOrderException | 400 | 잘못된 주문 요청 |
| MenuNotAvailableException | 400 | 판매 불가 메뉴 |
| CategoryHasMenusException | 400 | 메뉴 있는 카테고리 삭제 시도 |
| InvalidFileException | 400 | 파일 검증 실패 |
| AuthenticationException | 401 | 인증 실패 |
| BadCredentialsException | 401 | 잘못된 자격 증명 |
| AccessDeniedException | 403 | 권한 부족 / 매장 격리 위반 |
| AccountLockedException | 403 | 로그인 시도 초과 차단 |
| ResourceNotFoundException | 404 | 리소스 미존재 |
| MenuNotFoundException | 404 | 메뉴 미존재 |
| NoActiveSessionException | 404 | 활성 세션 없음 |
| DuplicateResourceException | 409 | 중복 리소스 (테이블번호, 카테고리명) |
| MaxUploadSizeExceededException | 413 | 파일 크기 초과 |
| Exception (기타) | 500 | 서버 내부 오류 |

### 표준 에러 응답 형식
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_ORDER_STATUS_TRANSITION",
    "message": "Cannot transition from COMPLETED to PREPARING"
  },
  "timestamp": "2026-05-06T12:00:00Z"
}
```

### 검증 에러 응답 (400, 다중 필드)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "입력값 검증에 실패했습니다",
    "fields": [
      { "field": "name", "message": "메뉴명은 필수입니다" },
      { "field": "price", "message": "가격은 0 이상이어야 합니다" }
    ]
  },
  "timestamp": "2026-05-06T12:00:00Z"
}
```

### 프로덕션 보안 규칙
- 스택 트레이스 절대 노출 금지
- 500 에러 시 일반적 메시지만 반환 ("서버 내부 오류가 발생했습니다")
- 상세 에러는 서버 로그에만 기록

---

## 6. 파일 업로드 규칙

### 검증 규칙
| 항목 | 규칙 |
|------|------|
| 파일 크기 | 최대 5MB |
| 허용 형식 | jpg, jpeg, png, webp |
| 파일명 | UUID + 원본 확장자 (예: `a1b2c3d4.jpg`) |
| 저장 경로 | 설정 가능 (application.yml의 file.upload-dir) |

### 처리 플로우
```
1. 파일 존재 확인 (null/empty 체크)
2. 크기 검증 (5MB 이하)
3. Content-Type 검증 (image/jpeg, image/png, image/webp)
4. 확장자 검증 (이중 확인)
5. UUID 파일명 생성
6. 파일 저장
7. 접근 URL 반환 (/api/files/images/{filename})
```

---

## 7. 주문 삭제 규칙

### 처리 플로우
```
1. 주문 존재 + 매장 소속 확인
2. 주문 + OrderItems 물리 삭제
3. SSE 이벤트 발행 (ORDER_DELETED, {orderId, tableId, deletedAmount})
4. 응답 반환
```

### 제약
- ADMIN role만 삭제 가능
- 어떤 상태의 주문이든 삭제 가능 (PENDING, PREPARING, COMPLETED)

---

## 8. 과거 주문 내역 조회 규칙

### 조회 조건
```
- tableId: 특정 테이블
- 세션 상태: COMPLETED (종료된 세션의 주문만)
- 날짜 필터: from ~ to (선택적)
- 정렬: 시간 역순 (최신 먼저)
```

### 응답 구조
```
세션 단위로 그룹핑:
[
  {
    sessionId, startedAt, completedAt,
    orders: [{ orderNumber, status, totalAmount, items, orderedAt }]
  }
]
```
