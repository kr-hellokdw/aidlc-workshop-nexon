package com.tableorder.order.repository;

import com.tableorder.order.entity.Order;
import com.tableorder.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.sessionId = :sessionId ORDER BY o.orderedAt DESC")
    List<Order> findBySessionIdWithItems(@Param("sessionId") Long sessionId);

    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.tableId = :tableId AND o.sessionId IN " +
            "(SELECT s.id FROM TableSession s WHERE s.tableId = :tableId AND s.status = 'ACTIVE') ORDER BY o.orderedAt DESC")
    List<Order> findActiveOrdersByTableId(@Param("tableId") Long tableId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.storeId = :storeId AND o.orderedAt BETWEEN :start AND :end")
    int countByStoreIdAndOrderedAtBetween(@Param("storeId") Long storeId,
                                          @Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    List<Order> findBySessionIdAndStatusNot(Long sessionId, OrderStatus status);

    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.tableId = :tableId AND o.sessionId IN " +
            "(SELECT s.id FROM TableSession s WHERE s.tableId = :tableId AND s.status = 'COMPLETED' " +
            "AND s.completedAt BETWEEN :from AND :to) ORDER BY o.orderedAt DESC")
    List<Order> findOrderHistory(@Param("tableId") Long tableId,
                                @Param("from") LocalDateTime from,
                                @Param("to") LocalDateTime to);
}
