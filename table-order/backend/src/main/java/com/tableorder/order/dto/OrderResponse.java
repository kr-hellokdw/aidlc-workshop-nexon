package com.tableorder.order.dto;

import com.tableorder.order.entity.Order;
import com.tableorder.order.entity.OrderItem;
import com.tableorder.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private final Long id;
    private final Integer orderNumber;
    private final Long tableId;
    private final OrderStatus status;
    private final Integer totalAmount;
    private final LocalDateTime orderedAt;
    private final List<OrderItemResponse> items;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableId(order.getTableId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .orderedAt(order.getOrderedAt())
                .items(order.getOrderItems().stream()
                        .map(OrderItemResponse::from)
                        .toList())
                .build();
    }

    @Getter
    @Builder
    public static class OrderItemResponse {
        private final Long id;
        private final Long menuId;
        private final String menuName;
        private final Integer menuPrice;
        private final Integer quantity;
        private final Integer subtotal;

        public static OrderItemResponse from(OrderItem item) {
            return OrderItemResponse.builder()
                    .id(item.getId())
                    .menuId(item.getMenuId())
                    .menuName(item.getMenuName())
                    .menuPrice(item.getMenuPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .build();
        }
    }
}
