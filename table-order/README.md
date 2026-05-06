# Table Order Service (테이블오더)

디지털 주문 시스템 - 고객 주문 + 매장 관리자 운영 플랫폼

## 프로젝트 구조

```
table-order/
├── backend/              ← [개발자 A] Spring Boot API 서버
├── frontend-customer/    ← [개발자 B] 고객용 React 앱
├── frontend-admin/       ← [개발자 C] 관리자용 React 앱
├── docs/                 ← 공유 문서 (API 스펙, SSE 이벤트 등)
├── aidlc-docs/           ← 설계 문서 (요구사항, 아키텍처 등)
├── docker-compose.yml    ← 통합 실행
└── docker-compose.dev.yml ← 개발용 (MySQL만)
```

## 개발 방식
- **단일 브랜치(main)** 에서 폴더별 작업 영역 분리
- 각 개발자는 자신의 폴더만 수정 → 충돌 없음
- `docs/` 폴더: 개발자 A가 API 스펙 작성, B/C가 참조

## 빠른 시작

### 개발자 A (Backend)
```bash
docker compose -f docker-compose.dev.yml up -d  # MySQL
cd backend && ./gradlew bootRun
```

### 개발자 B (Customer Frontend)
```bash
cd frontend-customer && npm install && npm run dev
```

### 개발자 C (Admin Frontend)
```bash
cd frontend-admin && npm install && npm run dev
```

### 통합 실행
```bash
docker compose up -d  # 전체 (Backend + FE 2개 + MySQL)
```

## 기술 스택
| 영역 | 기술 |
|------|------|
| Backend | Java 17, Spring Boot 3, MySQL 8, JWT |
| Frontend | React 18, TypeScript, Vite, Axios |
| 실시간 | Server-Sent Events (SSE) |
| 배포 | Docker, AWS |

## 설계 문서
- 요구사항: `aidlc-docs/inception/requirements/`
- 아키텍처: `aidlc-docs/inception/application-design/`
- 유저 스토리: `aidlc-docs/inception/user-stories/`
