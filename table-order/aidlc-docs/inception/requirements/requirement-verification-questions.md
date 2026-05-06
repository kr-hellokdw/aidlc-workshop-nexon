# 요구사항 확인 질문

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

## Question 1
백엔드 프레임워크로 어떤 기술을 사용하시겠습니까?

A) Node.js + Express (JavaScript/TypeScript)
B) Node.js + NestJS (TypeScript)
C) Spring Boot (Java/Kotlin)
D) Python + FastAPI
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
프론트엔드 프레임워크로 어떤 기술을 사용하시겠습니까?

A) React (JavaScript/TypeScript)
B) Vue.js
C) Next.js (React 기반 풀스택)
D) Angular
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
데이터베이스로 어떤 기술을 사용하시겠습니까?

A) PostgreSQL (관계형)
B) MySQL (관계형)
C) MongoDB (NoSQL Document)
D) SQLite (경량 관계형, 개발/소규모 운영용)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
배포 환경은 어떻게 계획하고 계십니까?

A) AWS (EC2, ECS, Lambda 등)
B) 로컬/온프레미스 서버
C) Docker 컨테이너 기반 (배포 환경 미정)
D) Vercel/Netlify (프론트) + 별도 백엔드 서버
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
동시 접속 매장 수 및 규모를 어떻게 예상하십니까?

A) 소규모 - 단일 매장 (1개 매장, 테이블 20개 이하)
B) 중소규모 - 소수 매장 (2~10개 매장)
C) 중규모 - 다수 매장 (10~50개 매장)
D) 대규모 - 프랜차이즈 수준 (50개 이상 매장)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 앱에서 라우팅으로 분리 (모노리스 프론트엔드)
B) 고객용과 관리자용을 별도 프론트엔드 앱으로 분리
C) 관리자용은 별도 앱, 고객용은 단순 웹페이지로 구성
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
메뉴 이미지 저장 방식은 어떻게 하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 호스팅 사용)
B) 서버에 파일 업로드 후 로컬 저장
C) 클라우드 스토리지 업로드 (S3, GCS 등)
D) 이미지 기능은 MVP에서 제외 (텍스트만)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8
프로젝트 구조를 어떻게 구성하시겠습니까?

A) 모노레포 (프론트엔드 + 백엔드를 하나의 저장소에서 관리)
B) 멀티레포 (프론트엔드와 백엔드를 별도 저장소로 분리)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
테이블 태블릿의 자동 로그인에서 "테이블 비밀번호"는 어떤 용도입니까?

A) 매장 관리자가 태블릿 초기 설정 시 사용하는 인증 수단 (고객은 비밀번호를 모름)
B) 고객이 테이블에 앉을 때 입력하는 인증 수단
C) 태블릿 기기 자체의 보안 잠금용
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 10: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 차단 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 모든 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 11: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스팅(PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 차단 제약으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 라운드트립에만 PBT 규칙 적용 (제한된 알고리즘 복잡성을 가진 프로젝트에 적합)
C) No — 모든 PBT 규칙 건너뛰기 (단순 CRUD 애플리케이션, UI 전용 프로젝트에 적합)
D) Other (please describe after [Answer]: tag below)

[Answer]: B
