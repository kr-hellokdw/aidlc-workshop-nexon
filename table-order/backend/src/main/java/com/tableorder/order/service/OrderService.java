package com.tableorder.order.service;

import com.tableorder.common.dto.UserPrincipal;
import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.InvalidOrderStatusTransitionException;
import com.tableorder.common.exception.ResourceNotFoundException;
import com.tableorder.menu.entity.Menu;
import com.tableorder.menu.repository.MenuRepository;
import com.tableorder.order.dto.OrderCreateRequest;
import com.tableorder.order.dto.OrderResponse;
import com.tableorder.order.dto.OrderStatusUpdateRequest;
import com.tableorder.order.entity.Order;
import com.tableorder.order.entity.OrderItem;
import com.tableorder.order.entity.OrderStatus;
import com.tableorder.order.repository.OrderRepository;
import com.tableorder.sse.SseEventType;
import com.tableorder.sse.service.SseService;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.service.TableSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final TableSessionService tableSessionService;
    private final SseService sseService;

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, UserPrincipal principal) {
        Long storeId = principal.getStoreId();
        Long tableId = principal.getId();

        // 세션 확보 (없으면 생성)
        TableSession session = tableSessionService.getOrCreateSession(tableId, storeId);

        // 메뉴 검증 및 조회
        List<Long> menuIds = request.getItems().stream()
                .map(OrderCreateRequest.OrderItemRequest::getMenuId)
                .toList();

        List<Menu> menus = menuRepository.findAllByIdIn(menuIds);
        Map<Long, Menu> menuMap = menus.stream()
                .collect(Collectors.toMap(Menu::getId, Function.identity()));

        // 모든 메뉴 존재 및 매장 소속 확인
        for (Long menuId : menuIds) {
            Menu menu = menuMap.get(menuId);
            if (menu == null) {
                throw new ResourceNotFoundException("Menu", menuId);
            }
            if (!menu.getStoreId().equals(storeId)) {
                throw new AccessDeniedException("Access denied");
            }
            if (!menu.getAvailable()) {
                throw new BusinessException("MENU_NOT_AVAILABLE",
                        String.format("메뉴 '%s'은(는) 현재 판매 불가합니다", menu.getName()));
            }
        }

        // 주문번호 생성
        int orderNumber = generateOrderNumber(storeId);

        // 주문 생성
        Order order = Order.builder()
                .storeId(storeId)
                .tableId(tableId)
                .sessionId(session.getId())
                .orderNumber(orderNumber)
                .totalAmount(0)
                .build();

        // 주문 항목 생성 (서버 가격 기준)
        int totalAmount = 0;
        for (OrderCreateRequest.OrderItemRequest itemRequest : request.getItems()) {
            Menu menu = menuMap.get(itemRequest.getMenuId());
            OrderItem orderItem = OrderItem.builder()
                    .menuId(menu.getId())
                    .menuName(menu.getName())
                    .menuPrice(menu.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .build();
            order.addOrderItem(orderItem);
            totalAmount += orderItem.getSubtotal();
        }

        // totalAmount 설정을 위해 리플렉션 대신 빌더 재생성
        order = Order.builder()
                .storeId(storeId)
                .tableId(tableId)
                .sessionId(session.getId())
                .orderNumber(orderNumber)
                .totalAmount(totalAmount)
                .build();

        for (OrderCreateRequest.OrderItemRequest itemRequest : request.getItems()) {
            Menu menu = menuMap.get(itemRequest.getMenuId());
            OrderItem orderItem = OrderItem.builder()
                    .menuId(menu.getId())
                    .menuName(menu.getName())
                    .menuPrice(menu.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .build();
            order.addOrderItem(orderItem);
        }

        order = orderRepository.save(order);

        // SSE 이벤트 발행
        OrderResponse response = OrderResponse.from(order);
        sseService.publishEvent(storeId, SseEventType.NEW_ORDER, response);

        return response;
    }

    public List<OrderResponse> getOrdersBySession(Long sessionId) {
        return orderRepository.findBySessionIdWithItems(sessionId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    public List<OrderResponse> getActiveOrdersByTable(Long tableId, Long storeId) {
        return orderRepository.findActiveOrdersByTableId(tableId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Long storeId, OrderStatusUpdateRequest request) {
        Order order = findOrderByIdAndStore(orderId, storeId);

        if (!order.getStatus().canTransitionTo(request.getStatus())) {
            throw new InvalidOrderStatusTransitionException(
                    order.getStatus().name(), request.getStatus().name());
        }

        order.updateStatus(request.getStatus());

        // SSE 이벤트 발행
        sseService.publishEvent(storeId, SseEventType.ORDER_STATUS_CHANGED,
                Map.of("orderId", orderId, "tableId", order.getTableId(), "newStatus", request.getStatus()));

        return OrderResponse.from(order);
    }

    @Transactional
    public void deleteOrder(Long orderId, Long storeId) {
        Order order = findOrderByIdAndStore(orderId, storeId);
        Long tableId = order.getTableId();
        Integer deletedAmount = order.getTotalAmount();

        orderRepository.delete(order);

        // SSE 이벤트 발행
        sseService.publishEvent(storeId, SseEventType.ORDER_DELETED,
                Map.of("orderId", orderId, "tableId", tableId, "deletedAmount", deletedAmount));
    }

    public List<OrderResponse> getOrderHistory(Long tableId, Long storeId, LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(LocalTime.MAX);

        return orderRepository.findOrderHistory(tableId, fromDateTime, toDateTime).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public void forceCompleteOrders(Long sessionId) {
        List<Order> pendingOrders = orderRepository.findBySessionIdAndStatusNot(sessionId, OrderStatus.COMPLETED);
        for (Order order : pendingOrders) {
            order.forceComplete();
        }
    }

    private Order findOrderByIdAndStore(Long orderId, Long storeId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getStoreId().equals(storeId)) {
            throw new AccessDeniedException("Access denied");
        }
        return order;
    }

    private int generateOrderNumber(Long storeId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        int count = orderRepository.countByStoreIdAndOrderedAtBetween(storeId, startOfDay, endOfDay);
        return count + 1;
    }
}
