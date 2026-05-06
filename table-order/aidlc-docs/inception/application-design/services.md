# 서비스 정의 (Services)

---

## 1. 백엔드 서비스 레이어

### 아키텍처 패턴: Layered Architecture
```
Controller (API 진입점)
    ↓
Service (비즈니스 로직)
    ↓
Repository (데이터 접근)
    ↓
Database (MySQL)
```

---

### 1.1 AuthService
| 항목 | 내용 |
|------|------|
| **책임** | 인증/인가 비즈니스 로직 |
| **의존** | AdminRepository, TableRepository, JwtTokenProvider, PasswordEncoder |
| **오케스트레이션** | 로그인 요청 검증 → 비밀번호 확인 → 토큰 발급 → 로그인 시도 기록 |

### 1.2 StoreService
| 항목 | 내용 |
|------|------|
| **책임** | 매장 정보 관리 |
| **의존** | StoreRepository |
| **오케스트레이션** | 매장 조회 → 응답 변환 |

### 1.3 TableService
| 항목 | 내용 |
|------|------|
| **책임** | 테이블 및 세션 라이프사이클 관리 |
| **의존** | TableRepository, TableSessionRepository, OrderService |
| **오케스트레이션** | 세션 종료 시: 현재 주문 이력 이동 → 세션 종료 마킹 → 테이블 리셋 |

### 1.4 MenuService
| 항목 | 내용 |
|------|------|
| **책임** | 메뉴 CRUD 및 카테고리 관리 |
| **의존** | MenuRepository, CategoryRepository, FileService |
| **오케스트레이션** | 메뉴 생성 시: 입력 검증 → 이미지 처리 → 메뉴 저장 → 순서 할당 |

### 1.5 OrderService
| 항목 | 내용 |
|------|------|
| **책임** | 주문 생성, 상태 관리, 이력 관리 |
| **의존** | OrderRepository, OrderItemRepository, OrderHistoryRepository, TableService, SseService |
| **오케스트레이션** | 주문 생성 시: 입력 검증 → 주문 저장 → SSE 이벤트 발행 |

### 1.6 SseService
| 항목 | 내용 |
|------|------|
| **책임** | SSE 연결 관리 및 이벤트 발행 |
| **의존** | ConcurrentHashMap (emitter 저장) |
| **오케스트레이션** | 구독 시: emitter 생성 → 저장 → 타임아웃/에러 핸들링 등록 |

### 1.7 FileService
| 항목 | 내용 |
|------|------|
| **책임** | 파일 업로드/삭제 |
| **의존** | 파일 시스템 |
| **오케스트레이션** | 업로드 시: 파일 검증 → 고유 파일명 생성 → 저장 → URL 반환 |

---

## 2. 서비스 간 상호작용

### 주문 생성 플로우
```
OrderController.createOrder()
    → OrderService.createOrder()
        → TableService.getCurrentSession() [세션 확인]
        → OrderRepository.save() [주문 저장]
        → SseService.publishOrderEvent() [실시간 알림]
    → OrderResponse 반환
```

### 테이블 이용 완료 플로우
```
TableController.completeSession()
    → TableService.completeSession()
        → OrderService.moveOrdersToHistory() [주문 이력 이동]
        → TableSessionRepository.markCompleted() [세션 종료]
        → SseService.publishStatusChange() [상태 변경 알림]
    → 성공 응답
```

### 관리자 주문 상태 변경 플로우
```
OrderController.updateOrderStatus()
    → OrderService.updateOrderStatus()
        → OrderRepository.updateStatus() [상태 업데이트]
        → SseService.publishStatusChange() [실시간 알림]
    → OrderResponse 반환
```
