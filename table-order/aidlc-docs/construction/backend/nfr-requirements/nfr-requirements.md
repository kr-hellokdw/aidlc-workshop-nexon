# NFR Requirements - Backend API Server

---

## 1. 성능 요구사항 (Performance)

| ID | 요구사항 | 목표값 | 측정 방법 |
|----|----------|--------|-----------|
| PERF-01 | SSE 이벤트 전달 지연 | 2초 이내 | 주문 생성 → 관리자 수신 시간 |
| PERF-02 | 메뉴 조회 API 응답 | 1초 이내 | GET /api/stores/{id}/menus 응답 시간 |
| PERF-03 | 주문 생성 API 응답 | 2초 이내 | POST /api/orders 응답 시간 |
| PERF-04 | 일반 CRUD API 응답 | 500ms 이내 | 평균 응답 시간 |
| PERF-05 | 동시 접속 처리 | 테이블 20개 + 관리자 2명 | 동시 요청 처리 |

### 성능 설계 지침
- DB 쿼리 최적화: 필요한 인덱스 설정 (storeId, sessionId, orderedAt)
- N+1 문제 방지: JPA fetch join 활용
- SSE emitter 관리: 비동기 이벤트 발행

---

## 2. 보안 요구사항 (Security)

| ID | 요구사항 | 구현 방식 |
|----|----------|-----------|
| SEC-01 | 인증 | JWT 토큰 (Access 16h + Refresh 24h) |
| SEC-02 | 비밀번호 저장 | BCrypt 해싱 (strength 10) |
| SEC-03 | Brute-force 방지 | 5회 실패 → 15분 차단 |
| SEC-04 | SQL Injection 방지 | JPA Parameterized Query (직접 SQL 금지) |
| SEC-05 | 입력 검증 | Bean Validation + 서비스 레이어 검증 |
| SEC-06 | 매장 격리 | JWT storeId 기반 데이터 접근 제어 |
| SEC-07 | IDOR 방지 | 리소스 접근 시 소유권 검증 |
| SEC-08 | 에러 정보 노출 방지 | 프로덕션에서 스택 트레이스 숨김 |
| SEC-09 | 파일 업로드 보안 | Content-Type + 확장자 이중 검증, 크기 제한 |
| SEC-10 | CORS 설정 | 허용 Origin 명시적 설정 (와일드카드 금지) |
| SEC-11 | HTTPS 강제 | TLS 1.2+ (배포 환경에서 적용) |

---

## 3. 가용성 요구사항 (Availability)

| ID | 요구사항 | 설명 |
|----|----------|------|
| AVAIL-01 | 영업시간 안정성 | 매장 영업 시간 동안 무중단 서비스 |
| AVAIL-02 | SSE 재연결 | 연결 끊김 시 클라이언트 자동 재연결 (3초, 최대 5회) |
| AVAIL-03 | Heartbeat | 30초 주기 ping으로 연결 상태 확인 |
| AVAIL-04 | Graceful 에러 처리 | 개별 요청 실패가 전체 시스템에 영향 없음 |

---

## 4. 확장성 요구사항 (Scalability)

| ID | 요구사항 | 설명 |
|----|----------|------|
| SCAL-01 | 단일 매장 규모 | 테이블 20개 이하, 관리자 1~2명 |
| SCAL-02 | 단일 인스턴스 | 모노리스 단일 서버로 충분 |
| SCAL-03 | 데이터 증가 대응 | 인덱스 설계로 주문 누적 시에도 조회 성능 유지 |

---

## 5. 유지보수성 요구사항 (Maintainability)

| ID | 요구사항 | 구현 방식 |
|----|----------|-----------|
| MAINT-01 | 모듈 분리 | 도메인별 패키지 분리 (auth, store, table, menu, order, sse, file, common) |
| MAINT-02 | API 문서화 | SpringDoc OpenAPI 자동 생성 |
| MAINT-03 | 로깅 | SLF4J + Logback, 요청/응답 로깅 |
| MAINT-04 | 설정 분리 | application.yml (공통) + profile별 설정 (dev, prod) |
| MAINT-05 | 테스트 | 단위 테스트 + 통합 테스트 |

---

## 6. 데이터 무결성 요구사항

| ID | 요구사항 | 구현 방식 |
|----|----------|-----------|
| DATA-01 | 트랜잭션 관리 | @Transactional (서비스 레이어) |
| DATA-02 | 주문번호 유일성 | DB UNIQUE 제약 + 재시도 로직 |
| DATA-03 | 주문 가격 정합성 | 서버 DB 가격 기준 계산 (클라이언트 가격 무시) |
| DATA-04 | 스냅샷 보존 | OrderItem에 메뉴명/가격 스냅샷 저장 |
| DATA-05 | 참조 무결성 | FK 제약 + 메뉴 삭제 시 SET NULL |
