package com.tableorder.order.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "menu_name", nullable = false, length = 50)
    private String menuName;

    @Column(name = "menu_price", nullable = false)
    private Integer menuPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer subtotal;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public OrderItem(Long menuId, String menuName, Integer menuPrice, Integer quantity) {
        this.menuId = menuId;
        this.menuName = menuName;
        this.menuPrice = menuPrice;
        this.quantity = quantity;
        this.subtotal = menuPrice * quantity;
    }

    void setOrder(Order order) {
        this.order = order;
    }
}
