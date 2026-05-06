# SSE 이벤트 정의

Backend(개발자 A)가 발행하는 SSE 이벤트 형식입니다.
Admin Frontend(개발자 C)가 이 형식에 맞춰 수신 처리합니다.

## 연결
```
GET /api/admin/sse/subscribe
Header: Authorization: Bearer <ADMIN_TOKEN>
```

## 이벤트 타입

### NEW_ORDER
신규 주문 발생 시
```json
event: NEW_ORDER
data: {"tableId": 1, "tableNumber": 5, "order": {"orderId": 123, "orderNumber": "001", "items": [{"menuName": "김치찌개", "quantity": 2, "price": 9000}], "totalAmount": 18000, "status": "PENDING", "createdAt": "2026-05-06T12:30:00"}}
```

### ORDER_STATUS_CHANGED
주문 상태 변경 시
```json
event: ORDER_STATUS_CHANGED
data: {"tableId": 1, "orderId": 123, "previousStatus": "PENDING", "newStatus": "PREPARING"}
```

### ORDER_DELETED
주문 삭제 시
```json
event: ORDER_DELETED
data: {"tableId": 1, "orderId": 123, "newTableTotal": 27000}
```

### SESSION_COMPLETED
테이블 이용 완료 시
```json
event: SESSION_COMPLETED
data: {"tableId": 1, "tableNumber": 5, "completedAt": "2026-05-06T14:00:00"}
```

### HEARTBEAT
연결 유지 (30초 주기)
```json
event: HEARTBEAT
data: {"timestamp": "2026-05-06T12:30:30"}
```
