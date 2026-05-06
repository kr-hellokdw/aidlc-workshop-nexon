# 서비스 정의 (Services)

---

## 1. 백엔드 서비스 레이어

### 아키텍처 패턴: Layered Architecture
```
Controller (API 진입점 + 입력 검증)
    |
    v
Service (비즈니스 로직 + 트랜잭션 관리)
    |
    v
Repository (데이터 접근 - Spring Data JPA)
    |
    v
Database (MySQL)
```

### 횡단 관심사 (Cross-Cutting Concerns)
```
+-- Security Filter (JWT 검증, 인가) --------+
|                                             |
|  +-- Request Logging Filter --------+      |
|  |                                   |      |
|  |  Controller → Service → Repo     |      |
|  |                                   |      |
|  +-- Global Exception Handler ------+      |
|                                             |
+-- Rate Limiting (로그인 시도 제한) ---------+
```

---

### 1.1 AuthService
| 항목 | 내용 |
|------|------|
| **책임** | 인증/인가 비즈니스 로직, 로그인 시도 제한 |
| **의존** | AdminRepository, TableRepository, JwtTokenProvider, PasswordEncoder, LoginAttemptService |
| **트랜잭션** | 읽기 전용 (인증은 상태 변경 없음, 시도 기록은 별도) |

**오케스트레이션 - 관리자 로그인:**
```
1. LoginAttemptService.isBlocked() → 차단 여부 확인
2. AdminRepository.findByStoreIdAndUsername() → 계정 조회
3. PasswordEncoder.matches() → 비밀번호 검증
4. [실패 시] LoginAttemptService.recordFailedAttempt()
5. [성공 시] LoginAttemptService.resetAttempts()
6. JwtTokenProvider.generateToken() → 토큰 발급
7. TokenResponse 반환
```

### 1.2 StoreService
| 항목 | 내용 |
|------|------|
| **책임** | 매장 정보 조회 |
| **의존** | StoreRepository |
| **트랜잭션** | 읽기 전용 |

### 1.3 TableService
| 항목 | 내용 |
|------|------|
| **책임** | 테이블 CRUD, 대시보드 데이터 조합 |
| **의존** | TableRepository, TableSessionService, OrderService |
| **트랜잭션** | 읽기/쓰기 |

**오케스트레이션 - 대시보드 데이터:**
```
1. TableRepository.findByStoreId() → 전체 테이블 목록
2. 각 테이블별 OrderService.getActiveOrdersByTable() → 활성 주문
3. 각 테이블별 OrderService.calculateTableTotal() → 총 주문액
4. DashboardResponse 조합 반환
```

### 1.4 TableSessionService (신규 - 순환 의존 해소)
| 항목 | 내용 |
|------|------|
| **책임** | 테이블 세션 라이프사이클 전담 |
| **의존** | TableSessionRepository, SseService |
| **트랜잭션** | 쓰기 |
| **설계 근거** | OrderService와 TableService 간 순환 의존을 방지하기 위해 세션 로직을 독립 서비스로 분리 |

**오케스트레이션 - 세션 시작 (첫 주문 시 자동):**
```
1. TableSessionRepository.findActiveByTableId() → 활성 세션 확인
2. [없으면] 새 TableSession 생성 (status=ACTIVE, startedAt=now)
3. TableSession 반환
```

**오케스트레이션 - 이용 완료:**
```
1. TableSessionRepository.findActiveByTableId() → 활성 세션 조회
2. session.complete() → 상태 COMPLETED, completedAt=now
3. SseService.publishEvent(SESSION_COMPLETED) → 실시간 알림
```

### 1.5 MenuService
| 항목 | 내용 |
|------|------|
| **책임** | 메뉴 CRUD |
| **의존** | MenuRepository, CategoryRepository, FileService |
| **트랜잭션** | 읽기/쓰기 |

**오케스트레이션 - 메뉴 생성:**
```
1. 입력 검증 (필수 필드, 가격 범위)
2. CategoryRepository.findById() → 카테고리 존재 확인
3. [이미지 있으면] FileService.uploadImage() → 이미지 저장
4. Menu 엔티티 생성 + displayOrder 할당
5. MenuRepository.save() → 저장
6. MenuResponse 반환
```

### 1.6 CategoryService (신규)
| 항목 | 내용 |
|------|------|
| **책임** | 카테고리 CRUD |
| **의존** | CategoryRepository, MenuRepository |
| **트랜잭션** | 읽기/쓰기 |

**오케스트레이션 - 카테고리 삭제:**
```
1. MenuRepository.countByCategoryId() → 소속 메뉴 확인
2. [메뉴 있으면] 예외 발생 (메뉴가 있는 카테고리는 삭제 불가)
3. CategoryRepository.delete() → 삭제
```

### 1.7 OrderService
| 항목 | 내용 |
|------|------|
| **책임** | 주문 생성, 상태 관리, 이력 조회 |
| **의존** | OrderRepository, OrderItemRepository, TableSessionService, MenuRepository, SseService |
| **트랜잭션** | 쓰기 |

**오케스트레이션 - 주문 생성:**
```
1. 입력 검증 (메뉴 존재, 수량 > 0)
2. TableSessionService.getOrCreateSession() → 세션 확보 (첫 주문 시 자동 생성)
3. MenuRepository.findAllById() → 메뉴 정보 조회 (가격 확인)
4. Order 엔티티 생성 (status=PENDING, sessionId)
5. OrderItem 엔티티 목록 생성
6. OrderRepository.save() → 저장
7. SseService.publishEvent(NEW_ORDER) → 실시간 알림
8. OrderResponse 반환
```

**오케스트레이션 - 주문 상태 변경:**
```
1. OrderRepository.findById() → 주문 조회
2. 상태 전이 검증 (PENDING→PREPARING→COMPLETED만 허용)
3. order.updateStatus() → 상태 변경
4. SseService.publishEvent(ORDER_STATUS_CHANGED) → 실시간 알림
5. OrderResponse 반환
```

### 1.8 SseService
| 항목 | 내용 |
|------|------|
| **책임** | SSE 연결 관리, 이벤트 브로드캐스트 |
| **의존** | ConcurrentHashMap\<Long, List\<SseEmitter\>\> (매장별 emitter 목록) |
| **트랜잭션** | 없음 (비트랜잭션) |

**오케스트레이션 - 구독:**
```
1. SseEmitter 생성 (timeout: 30분)
2. emitter.onCompletion() → removeEmitter() 등록
3. emitter.onTimeout() → removeEmitter() 등록
4. emitter.onError() → removeEmitter() 등록
5. 매장별 emitter 목록에 추가
6. 초기 연결 확인 이벤트 전송
7. SseEmitter 반환
```

**Heartbeat (스케줄러 - 30초 주기):**
```
1. 모든 활성 emitter에 HEARTBEAT 이벤트 전송
2. 전송 실패한 emitter 제거
```

### 1.9 FileService
| 항목 | 내용 |
|------|------|
| **책임** | 파일 업로드/삭제, 검증 |
| **의존** | 파일 시스템 (설정된 업로드 디렉토리) |
| **트랜잭션** | 없음 |

---

## 2. 서비스 간 핵심 플로우

### 주문 생성 (고객 → 관리자 실시간 전달)
```
[고객 태블릿] POST /api/orders
    |
    v
OrderController.createOrder()
    |
    v
OrderService.createOrder()
    |--- TableSessionService.getOrCreateSession() → 세션 확보
    |--- MenuRepository.findAllById() → 메뉴/가격 검증
    |--- OrderRepository.save() → DB 저장
    |--- SseService.publishEvent(NEW_ORDER, orderData) → 실시간 알림
    |
    v
OrderResponse → [고객 태블릿]
                                    동시에
                    SseService → [관리자 브라우저] (SSE push)
```

### 이용 완료 (관리자)
```
[관리자 브라우저] POST /api/admin/tables/{id}/complete-session
    |
    v
TableController.completeSession()
    |
    v
TableSessionService.completeSession()
    |--- session.complete() → 세션 상태 COMPLETED
    |--- SseService.publishEvent(SESSION_COMPLETED) → 실시간 알림
    |
    v
성공 응답 → [관리자 브라우저]
```

### 관리자 대시보드 초기 로드 + 실시간 업데이트
```
[관리자 브라우저]
    |
    |--- (1) GET /api/admin/dashboard → 현재 전체 상태 로드 (REST)
    |--- (2) GET /api/admin/sse/subscribe → SSE 연결 수립
    |
    v
이후 모든 변경사항은 SSE로 실시간 수신
    → NEW_ORDER: 테이블 카드에 주문 추가
    → ORDER_STATUS_CHANGED: 주문 상태 업데이트
    → ORDER_DELETED: 주문 제거 + 총액 재계산
    → SESSION_COMPLETED: 테이블 리셋
```
