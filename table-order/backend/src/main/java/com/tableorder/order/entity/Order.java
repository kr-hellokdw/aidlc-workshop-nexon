package com.tableorder.order.entity;

import com.tableorder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Builder
    public Order(Long storeId, Long tableId, Long sessionId, Integer orderNumber, Integer totalAmount) {
        this.storeId = storeId;
        this.tableId = tableId;
        this.sessionId = sessionId;
        this.orderNumber = orderNumber;
        this.status = OrderStatus.PENDING;
        this.totalAmount = totalAmount;
        this.orderedAt = LocalDateTime.now();
    }

    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
    }

    public void forceComplete() {
        this.status = OrderStatus.COMPLETED;
    }
}
