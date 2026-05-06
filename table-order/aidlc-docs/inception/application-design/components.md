# 컴포넌트 정의 (Components)

---

## 1. 백엔드 컴포넌트 (Spring Boot - Java)

### 1.1 Auth Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.auth` |
| **책임** | 인증/인가 처리, JWT 토큰 관리, 세션 관리 |
| **주요 기능** | 관리자 로그인, 테이블 태블릿 인증, 토큰 발급/검증 |

### 1.2 Store Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.store` |
| **책임** | 매장 정보 관리 |
| **주요 기능** | 매장 조회, 매장 설정 |

### 1.3 Table Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.table` |
| **책임** | 테이블 관리, 테이블 세션 라이프사이클 |
| **주요 기능** | 테이블 설정, 세션 시작/종료, 이용 완료 처리 |

### 1.4 Menu Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.menu` |
| **책임** | 메뉴 및 카테고리 CRUD, 이미지 관리 |
| **주요 기능** | 메뉴 등록/수정/삭제/조회, 카테고리 관리, 순서 조정 |

### 1.5 Order Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.order` |
| **책임** | 주문 생성, 상태 관리, 주문 내역 조회 |
| **주요 기능** | 주문 생성, 상태 변경, 주문 삭제, 과거 내역 조회 |

### 1.6 SSE Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.sse` |
| **책임** | Server-Sent Events 기반 실시간 알림 |
| **주요 기능** | SSE 연결 관리, 주문 이벤트 발행, 상태 변경 알림 |

### 1.7 File Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.file` |
| **책임** | 파일 업로드/다운로드 관리 |
| **주요 기능** | 이미지 업로드, 파일 서빙, 파일 삭제 |

### 1.8 Common Module
| 항목 | 내용 |
|------|------|
| **패키지** | `com.tableorder.common` |
| **책임** | 공통 유틸리티, 예외 처리, 보안 설정 |
| **주요 기능** | 글로벌 예외 핸들러, 보안 필터, 공통 DTO, 검증 유틸 |

---

## 2. 고객용 프론트엔드 컴포넌트 (React - TypeScript)

### 2.1 Auth (인증)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/auth/` |
| **책임** | 태블릿 자동 로그인, 세션 관리 |
| **주요 컴포넌트** | `TableSetup`, `AutoLogin` |

### 2.2 Menu (메뉴)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/menu/` |
| **책임** | 메뉴 조회 및 탐색 |
| **주요 컴포넌트** | `MenuList`, `MenuCard`, `CategoryTabs` |

### 2.3 Cart (장바구니)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/cart/` |
| **책임** | 장바구니 관리, 로컬 저장 |
| **주요 컴포넌트** | `CartView`, `CartItem`, `CartSummary` |

### 2.4 Order (주문)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/order/` |
| **책임** | 주문 생성, 주문 내역 조회 |
| **주요 컴포넌트** | `OrderConfirm`, `OrderSuccess`, `OrderHistory` |

### 2.5 Common (공통)
| 항목 | 내용 |
|------|------|
| **경로** | `src/common/` |
| **책임** | 공통 UI, API 클라이언트, 레이아웃 |
| **주요 컴포넌트** | `Layout`, `Loading`, `ErrorMessage`, `api client` |

---

## 3. 관리자용 프론트엔드 컴포넌트 (React - TypeScript)

### 3.1 Auth (인증)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/auth/` |
| **책임** | 관리자 로그인, 세션 관리 |
| **주요 컴포넌트** | `LoginForm`, `AuthGuard` |

### 3.2 Dashboard (대시보드)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/dashboard/` |
| **책임** | 실시간 주문 모니터링, 테이블별 그리드 |
| **주요 컴포넌트** | `DashboardGrid`, `TableCard`, `OrderDetail` |

### 3.3 Table Management (테이블 관리)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/table/` |
| **책임** | 테이블 설정, 세션 관리, 과거 내역 |
| **주요 컴포넌트** | `TableSetup`, `SessionControl`, `OrderHistory` |

### 3.4 Menu Management (메뉴 관리)
| 항목 | 내용 |
|------|------|
| **경로** | `src/features/menu/` |
| **책임** | 메뉴 CRUD, 카테고리 관리 |
| **주요 컴포넌트** | `MenuList`, `MenuForm`, `CategoryManager`, `MenuOrderEditor` |

### 3.5 Common (공통)
| 항목 | 내용 |
|------|------|
| **경로** | `src/common/` |
| **책임** | 공통 UI, API 클라이언트, SSE 연결 |
| **주요 컴포넌트** | `Layout`, `Sidebar`, `ConfirmDialog`, `SSEClient`, `api client` |
