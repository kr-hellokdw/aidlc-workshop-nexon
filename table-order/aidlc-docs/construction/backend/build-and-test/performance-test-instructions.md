# Performance Test Instructions - Backend API Server

## 성능 요구사항

| 항목 | 목표 |
|------|------|
| SSE 이벤트 전달 | 2초 이내 |
| 메뉴 조회 API | 1초 이내 |
| 주문 생성 API | 2초 이내 |
| 일반 CRUD API | 500ms 이내 |
| 동시 접속 | 테이블 20개 + 관리자 2명 |

---

## 테스트 도구

- **Apache JMeter** 또는 **k6** (권장)
- 설치: `brew install k6` (macOS)

---

## k6 성능 테스트 스크립트

### 기본 부하 테스트 (basic-load.js)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // 20 VU로 증가
    { duration: '1m', target: 20 },   // 1분간 유지
    { duration: '10s', target: 0 },   // 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% 요청이 1초 이내
    http_req_failed: ['rate<0.01'],     // 에러율 1% 미만
  },
};

const BASE_URL = 'http://localhost:8080';

export function setup() {
  // 테이블 로그인 토큰 획득
  const loginRes = http.post(`${BASE_URL}/api/auth/table/login`, JSON.stringify({
    storeId: 1, tableNumber: 1, password: '1234'
  }), { headers: { 'Content-Type': 'application/json' } });

  return { token: JSON.parse(loginRes.body).data.accessToken };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // 메뉴 조회
  const menuRes = http.get(`${BASE_URL}/api/stores/1/menus`, { headers });
  check(menuRes, { 'menu 200': (r) => r.status === 200 });

  sleep(1);

  // 주문 생성
  const orderRes = http.post(`${BASE_URL}/api/orders`, JSON.stringify({
    items: [{ menuId: 1, quantity: 1 }]
  }), { headers });
  check(orderRes, { 'order 201': (r) => r.status === 201 });

  sleep(2);
}
```

### 실행
```bash
k6 run basic-load.js
```

---

## 수동 성능 확인

### 응답 시간 측정
```bash
# 메뉴 조회 응답 시간
time curl -s http://localhost:8080/api/stores/1/menus \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# 주문 생성 응답 시간
time curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"menuId": 1, "quantity": 1}]}' > /dev/null
```

### SSE 이벤트 전달 시간 측정
```bash
# 터미널 1: SSE 구독 (타임스탬프 확인)
curl -N http://localhost:8080/api/admin/sse/subscribe \
  -H "Authorization: Bearer $ADMIN_TOKEN" | ts '[%Y-%m-%d %H:%M:%S]'

# 터미널 2: 주문 생성 (타임스탬프 기록)
date && curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"menuId": 1, "quantity": 1}]}'
```

---

## 예상 결과 (단일 매장, 테이블 20개)

| 항목 | 예상 결과 | 판정 |
|------|-----------|------|
| 메뉴 조회 p95 | < 100ms | PASS |
| 주문 생성 p95 | < 300ms | PASS |
| SSE 전달 | < 500ms | PASS |
| 동시 20 VU | 에러 0% | PASS |

> 단일 매장 소규모 서비스이므로 성능 병목 가능성은 매우 낮습니다.
> DB 인덱스가 적절히 설정되어 있으면 모든 요구사항을 충족합니다.
