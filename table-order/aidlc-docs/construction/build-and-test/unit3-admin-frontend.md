# Unit 3: Admin Frontend - Build and Test 지침

---

## 1. 사전 요구사항

| 도구 | 최소 버전 | 확인 명령 |
|------|-----------|-----------|
| Node.js | 18.x+ | `node --version` |
| npm | 9.x+ | `npm --version` |

---

## 2. 프로젝트 설정

```bash
cd table-order/frontend-admin

# 의존성 설치
npm install
```

---

## 3. 개발 서버 실행

### Mock 모드 (Backend 없이 독립 개발)
```bash
npm run dev
```
- URL: http://localhost:3001
- MSW가 모든 API 요청을 가로채서 Mock 응답 반환
- Mock 로그인: username=`admin`, password=`password`, storeId=아무 숫자

### Backend 연동 모드
```bash
VITE_API_URL=http://localhost:8080 VITE_ENABLE_MOCKS=false npm run dev
```

---

## 4. 테스트 실행

### 전체 테스트 (단일 실행)
```bash
npm run test
```

### Watch 모드 (개발 중)
```bash
npm run test:watch
```

### 커버리지 리포트
```bash
npm run test:coverage
```

---

## 5. 테스트 파일 목록

| 테스트 파일 | 대상 | 유형 |
|-------------|------|------|
| `src/common/utils/__tests__/validators.test.ts` | 입력 검증 유틸 | 단위 |
| `src/common/utils/__tests__/formatters.test.ts` | 포맷터 유틸 | 단위 |
| `src/features/auth/__tests__/authReducer.test.ts` | 인증 상태 관리 | 단위 |
| `src/features/dashboard/__tests__/dashboardReducer.test.ts` | 대시보드 상태 관리 | 단위 |

---

## 6. 빌드

### 프로덕션 빌드
```bash
npm run build
```
- 출력: `dist/` 폴더
- 코드 분할: 라우트별 chunk 자동 생성

### 타입 체크 (빌드 없이)
```bash
npm run type-check
```

### 린트
```bash
npm run lint
```

---

## 7. 빌드 검증 체크리스트

- [ ] `npm install` 에러 없이 완료
- [ ] `npm run type-check` 타입 에러 없음
- [ ] `npm run lint` 린트 에러 없음
- [ ] `npm run test` 모든 테스트 통과
- [ ] `npm run build` 빌드 성공
- [ ] `npm run dev` 개발 서버 정상 실행
- [ ] Mock 모드에서 로그인 → 대시보드 → 테이블관리 → 메뉴관리 화면 전환 정상

---

## 8. 수동 테스트 시나리오

### 시나리오 1: 로그인 플로우
1. http://localhost:3001 접속
2. `/login` 페이지 표시 확인
3. storeId: `1`, username: `admin`, password: `password` 입력
4. 로그인 성공 → `/dashboard` 이동 확인
5. 잘못된 비밀번호 입력 → 에러 메시지 표시 확인

### 시나리오 2: 대시보드 실시간 모니터링
1. 로그인 후 대시보드 진입
2. 테이블 카드 6개 표시 확인 (4개 이용중, 2개 빈자리)
3. 테이블 카드 클릭 → 주문 상세 모달 표시
4. 주문 상태 드롭다운 변경 → Toast 알림
5. 주문 삭제 → 확인 다이얼로그 → 삭제 완료
6. 이용 완료 → 확인 다이얼로그 → 테이블 리셋

### 시나리오 3: 테이블 관리
1. 사이드바 "테이블 관리" 클릭
2. 테이블 목록 표시 확인
3. "+ 테이블 추가" → 폼 입력 → 저장
4. 빈 테이블 "수정" → 수정 → 저장
5. 빈 테이블 "삭제" → 확인 → 삭제
6. 이용중 테이블 "내역" → 과거 주문 내역 모달

### 시나리오 4: 메뉴 관리
1. 사이드바 "메뉴 관리" 클릭
2. 카테고리 탭 전환 → 필터링 확인
3. "+ 메뉴 추가" → 폼 입력 → 저장
4. 메뉴 수정 (✏) → 수정 → 저장
5. 메뉴 삭제 (🗑) → 확인 → 삭제
6. ↑↓ 버튼으로 순서 변경
7. "⚙ 카테고리" → 카테고리 추가/수정/삭제

### 시나리오 5: 접근성
1. Tab 키로 모든 인터랙티브 요소 접근 가능 확인
2. 모달 열림 시 포커스 이동 확인
3. ESC로 모달 닫기 확인
4. 에러 메시지에 role="alert" 확인 (개발자 도구)

---

## 9. Docker 빌드 (통합 테스트용)

```dockerfile
# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
    }
}
```

---

## 10. 알려진 제한사항

- SSE Mock: 개발 모드에서 실제 EventSource 연결은 시뮬레이션되지 않음 (MSW는 SSE 미지원). 실제 SSE 테스트는 Backend 연동 시 수행.
- 이미지 업로드: Mock 모드에서 실제 파일 저장 없음 (URL만 null 반환)
- 자동 로그아웃 타이머: Mock 토큰은 만료 시간이 없으므로 개발 모드에서 자동 로그아웃 미동작
