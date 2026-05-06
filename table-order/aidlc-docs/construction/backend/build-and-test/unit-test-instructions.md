# Unit Test Instructions - Backend API Server

## 테스트 환경

| 항목 | 기술 |
|------|------|
| 프레임워크 | JUnit 5 |
| Mock | Mockito |
| Assertion | AssertJ |
| DB (테스트) | H2 In-Memory |
| Spring 테스트 | @SpringBootTest, @WebMvcTest, @DataJpaTest |

---

## 테스트 실행

### 전체 테스트 실행
```bash
cd backend
./gradlew test
```

### 특정 모듈 테스트
```bash
# Auth 모듈만
./gradlew test --tests "com.tableorder.auth.*"

# Order 모듈만
./gradlew test --tests "com.tableorder.order.*"
```

### 테스트 리포트 확인
```bash
open build/reports/tests/test/index.html
```

---

## 테스트 대상 및 전략

### Service Layer (단위 테스트 - Mockito)

| 서비스 | 테스트 케이스 |
|--------|--------------|
| AuthService | 관리자 로그인 성공/실패, 테이블 로그인 성공/실패, 로그인 차단 |
| TableService | 테이블 CRUD, 중복 번호 검증, 매장 격리 |
| TableSessionService | 세션 생성, 세션 종료, 활성 세션 조회 |
| MenuService | 메뉴 CRUD, 카테고리 소속 검증, 이미지 삭제 연동 |
| CategoryService | 카테고리 CRUD, 중복 이름 검증, 메뉴 있는 카테고리 삭제 차단 |
| OrderService | 주문 생성, 상태 전이 검증, 주문 삭제, 이력 조회 |
| FileService | 파일 업로드 검증 (크기, 형식), 삭제 |
| LoginAttemptService | 실패 기록, 차단 확인, 리셋 |

### Controller Layer (슬라이스 테스트 - @WebMvcTest)

| 컨트롤러 | 테스트 케이스 |
|----------|--------------|
| AuthController | 로그인 요청 검증, 성공/실패 응답 |
| TableController | CRUD API, 권한 검증 (ADMIN만) |
| MenuController | CRUD API, 입력 검증 |
| OrderController | 주문 생성 (TABLE만), 상태 변경 (ADMIN만) |
| SseController | SSE 구독 응답 타입 확인 |

### Repository Layer (통합 테스트 - @DataJpaTest)

| 리포지토리 | 테스트 케이스 |
|-----------|--------------|
| OrderRepository | 세션별 주문 조회, 일일 주문 수 카운트, 이력 조회 |
| TableSessionRepository | 테이블별 활성 세션 조회 |
| MenuRepository | 매장별 메뉴 조회, 카테고리별 존재 확인 |

---

## 테스트 작성 가이드

### Service 단위 테스트 예시
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private MenuRepository menuRepository;
    @Mock private TableSessionService tableSessionService;
    @Mock private SseService sseService;
    @InjectMocks private OrderService orderService;

    @Test
    void createOrder_성공() { ... }

    @Test
    void createOrder_메뉴없음_예외() { ... }

    @Test
    void updateOrderStatus_잘못된전이_예외() { ... }
}
```

### Controller 슬라이스 테스트 예시
```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private OrderService orderService;
    @MockBean private TableSessionService tableSessionService;

    @Test
    @WithMockUser(roles = "TABLE")
    void createOrder_성공_201() { ... }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createOrder_권한없음_403() { ... }
}
```

---

## 예상 결과

- **총 테스트 수**: 약 60~80개
- **통과율**: 100%
- **커버리지 목표**: Service Layer 80%+, Controller Layer 70%+
