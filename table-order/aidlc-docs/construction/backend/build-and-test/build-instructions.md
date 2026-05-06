# Build Instructions - Backend API Server

## 사전 요구사항

| 항목 | 버전 | 비고 |
|------|------|------|
| JDK | 17+ | Eclipse Temurin 또는 Oracle JDK |
| MySQL | 8.0+ | Docker 사용 권장 |
| Docker | 최신 | docker-compose.dev.yml 사용 시 |
| Gradle | 8.x | Wrapper 포함 (별도 설치 불필요) |

## 환경 변수 (개발 환경)

개발 환경에서는 `application-dev.yml`에 기본값이 설정되어 있어 별도 환경 변수 불필요.

프로덕션 환경 변수:
```bash
export DB_URL=jdbc:mysql://your-host:3306/tableorder
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export JWT_SECRET=your-secret-key-minimum-32-characters-long
```

---

## 빌드 단계

### 1. MySQL 실행 (Docker)

프로젝트 루트에서:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

MySQL이 `localhost:3306`에서 실행됩니다.
- Database: `tableorder`
- Username: `root`
- Password: `root`

### 2. 의존성 설치 및 빌드

```bash
cd backend
./gradlew build
```

### 3. 애플리케이션 실행 (개발 모드)

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

서버: http://localhost:8080

### 4. 빌드 확인

```bash
# JAR 파일 생성 확인
ls build/libs/table-order-0.0.1-SNAPSHOT.jar

# Swagger UI 접속 확인
curl -s http://localhost:8080/swagger-ui/index.html | head -5
```

### 5. Docker 이미지 빌드 (선택)

```bash
docker build -t table-order-backend .
docker run -p 8080:8080 --env-file .env table-order-backend
```

---

## 빌드 산출물

| 산출물 | 경로 |
|--------|------|
| JAR 파일 | `build/libs/table-order-0.0.1-SNAPSHOT.jar` |
| 테스트 리포트 | `build/reports/tests/test/index.html` |
| Docker 이미지 | `table-order-backend:latest` |

---

## 트러블슈팅

### MySQL 연결 실패
```
원인: MySQL이 실행되지 않았거나 포트가 다름
해결:
1. docker ps 로 MySQL 컨테이너 확인
2. docker-compose -f docker-compose.dev.yml up -d 재실행
3. mysql -h localhost -P 3306 -u root -proot 로 접속 테스트
```

### Gradle 빌드 실패 (JDK 버전)
```
원인: JDK 17 미만 사용
해결:
1. java -version 으로 버전 확인
2. JDK 17+ 설치 후 JAVA_HOME 설정
```

### 포트 충돌 (8080)
```
원인: 다른 프로세스가 8080 포트 사용 중
해결:
1. lsof -i :8080 으로 프로세스 확인
2. 해당 프로세스 종료 또는 application-dev.yml에서 server.port 변경
```
