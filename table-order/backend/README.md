# Table Order - Backend API Server

Spring Boot 기반 테이블오더 백엔드 API 서버입니다.

## 기술 스택

- Java 17+
- Spring Boot 3.2.x
- Spring Data JPA + Hibernate
- Spring Security + JWT
- MySQL 8.0+
- Gradle

## 사전 요구사항

- JDK 17+
- MySQL 8.0+ (또는 Docker)

## 실행 방법

### 1. MySQL 실행 (Docker)

프로젝트 루트에서:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 백엔드 실행

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=dev'
```

서버가 `http://localhost:8080`에서 실행됩니다.

### 3. API 문서 확인

Swagger UI: http://localhost:8080/swagger-ui/index.html

## 빌드

```bash
./gradlew build
```

## 테스트

```bash
./gradlew test
```

## 프로젝트 구조

```
src/main/java/com/tableorder/
├── TableOrderApplication.java
├── common/          # 공통 (설정, 예외, DTO)
├── auth/            # 인증/인가 (JWT, 로그인)
├── store/           # 매장 관리
├── table/           # 테이블 + 세션 관리
├── menu/            # 메뉴 + 카테고리 CRUD
├── order/           # 주문 생성/관리
├── sse/             # 실시간 알림 (SSE)
└── file/            # 파일 업로드
```

## API 엔드포인트 요약

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | /api/auth/admin/login | 관리자 로그인 | 공개 |
| POST | /api/auth/table/login | 테이블 로그인 | 공개 |
| GET | /api/stores/{id}/menus | 메뉴 조회 | TABLE, ADMIN |
| GET | /api/stores/{id}/categories | 카테고리 조회 | TABLE, ADMIN |
| POST | /api/orders | 주문 생성 | TABLE |
| GET | /api/orders/current | 현재 주문 조회 | TABLE |
| GET | /api/admin/tables | 테이블 목록 | ADMIN |
| POST | /api/admin/tables | 테이블 생성 | ADMIN |
| POST | /api/admin/tables/{id}/complete-session | 이용 완료 | ADMIN |
| GET | /api/admin/tables/dashboard | 대시보드 | ADMIN |
| PUT | /api/admin/orders/{id}/status | 주문 상태 변경 | ADMIN |
| DELETE | /api/admin/orders/{id} | 주문 삭제 | ADMIN |
| GET | /api/admin/tables/{id}/history | 주문 이력 | ADMIN |
| POST | /api/admin/menus | 메뉴 생성 | ADMIN |
| PUT | /api/admin/menus/{id} | 메뉴 수정 | ADMIN |
| DELETE | /api/admin/menus/{id} | 메뉴 삭제 | ADMIN |
| POST | /api/admin/categories | 카테고리 생성 | ADMIN |
| POST | /api/admin/files/upload | 이미지 업로드 | ADMIN |
| GET | /api/admin/sse/subscribe | SSE 구독 | ADMIN |

## 시드 데이터 (개발용)

- 매장: "맛있는 식당" (id: 1)
- 관리자: username=`admin`, password=`admin123`
- 테이블: 1~5번, password=`1234`
- 카테고리: 메인 메뉴, 사이드, 음료
- 메뉴: 김치찌개, 된장찌개, 비빔밥, 불고기, 계란말이, 김치전, 콜라, 사이다, 맥주
