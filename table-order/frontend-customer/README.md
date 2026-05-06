# Customer Frontend (Unit 2)

## 담당
개발자 B

## 기술 스택
- React 18+
- TypeScript
- Vite
- Axios
- React Context + useReducer
- MSW (Mock Service Worker) - Backend 없이 독립 개발용

## 로컬 실행 방법
```bash
cd frontend-customer

# 의존성 설치
npm install

# 개발 서버 실행 (Mock API 모드)
npm run dev

# 실제 Backend 연동 모드
VITE_API_URL=http://localhost:8080 npm run dev
```

## 포함 기능
| Feature | 경로 | 책임 |
|---------|------|------|
| Auth | `src/features/auth/` | 태블릿 자동 로그인, 세션 관리 |
| Menu | `src/features/menu/` | 메뉴 조회, 카테고리 탐색 |
| Cart | `src/features/cart/` | 장바구니 (localStorage 영속화) |
| Order | `src/features/order/` | 주문 생성, 주문 내역 조회 |
| Common | `src/common/` | 공통 UI, API 클라이언트, 타입 |

## Mock API
- `src/mocks/` 폴더에 MSW 핸들러 정의
- Backend 없이도 전체 UI 개발/테스트 가능
- API 스펙은 `docs/api-spec/openapi.yml` 참조

## 참고 문서
- 요구사항: `aidlc-docs/inception/requirements/requirements.md`
- 유저 스토리 (고객): US-C01 ~ US-C05 (`aidlc-docs/inception/user-stories/stories.md`)
- 애플리케이션 설계: `aidlc-docs/inception/application-design/`
