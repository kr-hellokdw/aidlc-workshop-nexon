# Build and Test Summary - Backend API Server

## 빌드 정보

| 항목 | 내용 |
|------|------|
| 빌드 도구 | Gradle 8.x |
| 언어 | Java 17 |
| 프레임워크 | Spring Boot 3.2.5 |
| 산출물 | `build/libs/table-order-0.0.1-SNAPSHOT.jar` |
| Docker | `table-order-backend:latest` |

---

## 테스트 전략 요약

### Unit Tests (단위 테스트)
| 대상 | 방식 | 예상 테스트 수 |
|------|------|---------------|
| Service Layer | Mockito + JUnit 5 | ~40개 |
| Controller Layer | @WebMvcTest + MockMvc | ~20개 |
| Repository Layer | @DataJpaTest + H2 | ~10개 |
| Utility (JWT, LoginAttempt) | JUnit 5 | ~10개 |
| **합계** | | **~80개** |

### Integration Tests (통합 테스트)
| 시나리오 | 검증 내용 |
|----------|-----------|
| 고객 주문 플로우 | 로그인 → 메뉴 조회 → 주문 → 조회 |
| 관리자 관리 플로우 | 로그인 → 대시보드 → 상태 변경 → 이용 완료 |
| SSE 실시간 알림 | 구독 → 주문 생성 → 이벤트 수신 |
| 보안 검증 | 인증/인가, 로그인 차단, 매장 격리 |
| 비즈니스 규칙 | 상태 전이, 카테고리 삭제 차단 |

### Performance Tests (성능 테스트)
| 항목 | 목표 | 예상 결과 |
|------|------|-----------|
| 메뉴 조회 p95 | < 1초 | < 100ms |
| 주문 생성 p95 | < 2초 | < 300ms |
| SSE 전달 | < 2초 | < 500ms |
| 동시 접속 20 | 에러 0% | PASS |

---

## 생성된 문서

| 파일 | 내용 |
|------|------|
| `build-instructions.md` | 빌드 환경 설정 및 실행 방법 |
| `unit-test-instructions.md` | 단위 테스트 실행 및 작성 가이드 |
| `integration-test-instructions.md` | 통합 테스트 시나리오 (curl 스크립트) |
| `performance-test-instructions.md` | 성능 테스트 (k6 스크립트) |
| `build-and-test-summary.md` | 이 문서 |

---

## 실행 명령 요약

```bash
# 1. DB 실행
docker-compose -f docker-compose.dev.yml up -d

# 2. 빌드
cd backend && ./gradlew build

# 3. 단위 테스트
./gradlew test

# 4. 애플리케이션 실행
./gradlew bootRun --args='--spring.profiles.active=dev'

# 5. 통합 테스트 (수동 - curl 스크립트)
# integration-test-instructions.md 참조

# 6. 성능 테스트 (선택)
# k6 run basic-load.js
```

---

## 전체 상태

| 단계 | 상태 |
|------|------|
| 코드 생성 | ✅ Complete |
| 빌드 설정 | ✅ Complete |
| 단위 테스트 가이드 | ✅ Complete |
| 통합 테스트 가이드 | ✅ Complete |
| 성능 테스트 가이드 | ✅ Complete |
| **Unit 1 (Backend) 전체** | **✅ Ready** |
