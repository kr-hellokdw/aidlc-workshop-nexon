# Backend API Server (Unit 1)

## 담당
개발자 A

## 기술 스택
- Java 17+
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0+
- SpringDoc OpenAPI (Swagger)
- Gradle

## 로컬 실행 방법
```bash
# 프로젝트 루트에서
cd backend

# MySQL 실행 (docker-compose 사용)
docker compose -f ../docker-compose.dev.yml up -d

# 애플리케이션 실행
./gradlew bootRun
```

## 포함 모듈
| 모듈 | 패키지 | 책임 |
|------|--------|------|
| Common | `com.tableorder.common` | 공통 유틸, 예외 처리, 보안 설정 |
| Auth | `com.tableorder.auth` | 인증/인가, JWT, 로그인 시도 제한 |
| Store | `com.tableorder.store` | 매장 정보 관리 |
| Table | `com.tableorder.table` | 테이블/세션 관리 |
| Menu | `com.tableorder.menu` | 메뉴/카테고리 CRUD |
| File | `com.tableorder.file` | 이미지 업로드/서빙 |
| Order | `com.tableorder.order` | 주문 생성/상태 관리 |
| SSE | `com.tableorder.sse` | 실시간 알림 (Server-Sent Events) |

## API 문서
- 실행 후 Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI 스펙은 `docs/api-spec/openapi.yml` 에도 공유

## 참고 문서
- 요구사항: `aidlc-docs/inception/requirements/requirements.md`
- 애플리케이션 설계: `aidlc-docs/inception/application-design/`
- 유닛 정의: `aidlc-docs/inception/application-design/unit-of-work.md`
