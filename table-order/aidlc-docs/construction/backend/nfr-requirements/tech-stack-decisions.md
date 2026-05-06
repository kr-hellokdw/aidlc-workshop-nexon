# Tech Stack Decisions - Backend API Server

---

## 1. 핵심 기술 스택

| 영역 | 기술 | 버전 | 선택 근거 |
|------|------|------|-----------|
| **언어** | Java | 17+ | LTS, 안정적, Spring Boot 호환 |
| **프레임워크** | Spring Boot | 3.x | 자동 설정, 풍부한 생태계, SSE 지원 |
| **빌드 도구** | Gradle (Groovy DSL) | 8.x | 빠른 빌드, 유연한 설정 |
| **데이터베이스** | MySQL | 8.0+ | 관계형, 안정적, AWS RDS 지원 |
| **ORM** | Spring Data JPA + Hibernate | - | 생산성, 타입 안전 쿼리 |

---

## 2. Spring Boot 의존성

| 의존성 | 용도 |
|--------|------|
| `spring-boot-starter-web` | REST API, 내장 Tomcat |
| `spring-boot-starter-data-jpa` | JPA + Hibernate |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-validation` | Bean Validation (Jakarta) |
| `mysql-connector-j` | MySQL JDBC 드라이버 |
| `jjwt-api` + `jjwt-impl` + `jjwt-jackson` | JWT 토큰 생성/검증 (io.jsonwebtoken) |
| `springdoc-openapi-starter-webmvc-ui` | Swagger UI + OpenAPI 자동 생성 |
| `lombok` | 보일러플레이트 코드 제거 |

### 테스트 의존성
| 의존성 | 용도 |
|--------|------|
| `spring-boot-starter-test` | JUnit 5, Mockito, AssertJ |
| `spring-security-test` | Security 테스트 유틸 |
| `h2` (test scope) | 인메모리 DB (테스트용) |

---

## 3. 보안 기술 결정

| 항목 | 결정 | 대안 고려 | 선택 이유 |
|------|------|-----------|-----------|
| 인증 방식 | JWT (Stateless) | Session 기반 | 확장성, 프론트엔드 분리 환경에 적합 |
| JWT 라이브러리 | jjwt (io.jsonwebtoken) | Spring Security OAuth2 | 경량, 직접 제어 가능 |
| 비밀번호 해싱 | BCrypt (strength 10) | Argon2, SCrypt | Spring Security 기본 지원, 충분한 보안 |
| CORS | 명시적 Origin 설정 | 와일드카드 | 보안 (Security Baseline 준수) |

---

## 4. 실시간 통신 기술 결정

| 항목 | 결정 | 대안 고려 | 선택 이유 |
|------|------|-----------|-----------|
| 프로토콜 | SSE (Server-Sent Events) | WebSocket, Long Polling | 단방향 충분, HTTP 기반 단순, 자동 재연결 |
| 구현 | Spring SseEmitter | Reactor Flux | 전통적 MVC 호환, 단순 구현 |
| 연결 관리 | ConcurrentHashMap | Redis Pub/Sub | 단일 인스턴스, 외부 의존성 불필요 |
| Heartbeat | @Scheduled (30초) | 클라이언트 ping | 서버 주도 연결 확인 |

---

## 5. 데이터 접근 기술 결정

| 항목 | 결정 | 선택 이유 |
|------|------|-----------|
| ORM | Spring Data JPA | Repository 자동 생성, 생산성 |
| 쿼리 방식 | JPQL + 메서드 이름 쿼리 | 타입 안전, 간결 |
| DDL 관리 | Hibernate ddl-auto (dev) + SQL 스크립트 (prod) | 개발 편의 + 프로덕션 안전 |
| 커넥션 풀 | HikariCP (Spring Boot 기본) | 고성능, 기본 내장 |

---

## 6. 파일 관리 기술 결정

| 항목 | 결정 | 대안 고려 | 선택 이유 |
|------|------|-----------|-----------|
| 저장소 | 서버 로컬 파일 시스템 | AWS S3 | MVP 단순성, 외부 의존성 최소화 |
| 서빙 | Spring 정적 리소스 매핑 | Nginx | 단일 서버, 별도 웹서버 불필요 |
| 파일명 | UUID + 확장자 | 타임스탬프 | 충돌 방지, 예측 불가 |

---

## 7. 개발 환경 설정

### application.yml (공통)
```yaml
spring:
  application:
    name: table-order
  jpa:
    hibernate:
      ddl-auto: validate  # prod
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB

server:
  port: 8080

file:
  upload-dir: ./uploads/images
```

### application-dev.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tableorder?useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    com.tableorder: DEBUG
    org.hibernate.SQL: DEBUG
```

### application-prod.yml
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

logging:
  level:
    com.tableorder: INFO
```

---

## 8. 프로젝트 구조 (Gradle)

```
backend/
├── build.gradle
├── settings.gradle
├── src/
│   ├── main/
│   │   ├── java/com/tableorder/
│   │   │   ├── TableOrderApplication.java
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── store/
│   │   │   ├── table/
│   │   │   ├── menu/
│   │   │   ├── order/
│   │   │   ├── sse/
│   │   │   └── file/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── application-prod.yml
│   └── test/
│       └── java/com/tableorder/
├── Dockerfile
└── README.md
```
