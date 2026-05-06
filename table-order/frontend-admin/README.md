# Admin Frontend (Unit 3)

## 담당
개발자 C

## 기술 스택
- React 18+
- TypeScript
- Vite
- Axios
- React Context + useReducer
- MSW (Mock Service Worker) - Backend 없이 독립 개발용
- EventSource (SSE 클라이언트)

## 로컬 실행 방법
```bash
cd frontend-admin

# 의존성 설치
npm install

# 개발 서버 실행 (Mock API + Mock SSE 모드)
npm run dev

# 실제 Backend 연동 모드
VITE_API_URL=http://localhost:8080 npm run dev
```

## 포함 기능
| Feature | 경로 | 책임 |
|---------|------|------|
| Auth | `src/features/auth/` | 관리자 로그인 (16시간 세션) |
| Dashboard | `src/features/dashboard/` | 실시간 주문 모니터링 (SSE) |
| Table | `src/features/table/` | 테이블 설정, 세션 관리, 과거 내역 |
| Menu | `src/features/menu/` | 메뉴/카테고리 CRUD, 이미지 업로드 |
| Common | `src/common/` | 공통 UI, API/SSE 클라이언트, 타입 |

## Mock API / Mock SSE
- `src/mocks/` 폴더에 MSW 핸들러 + SSE Mock 정의
- Backend 없이도 전체 UI 개발/테스트 가능
- API 스펙은 `docs/api-spec/openapi.yml` 참조
- SSE 이벤트 형식은 `docs/sse-events.md` 참조

## 참고 문서
- 요구사항: `aidlc-docs/inception/requirements/requirements.md`
- 유저 스토리 (관리자): US-A01 ~ US-A07 (`aidlc-docs/inception/user-stories/stories.md`)
- 애플리케이션 설계: `aidlc-docs/inception/application-design/`
