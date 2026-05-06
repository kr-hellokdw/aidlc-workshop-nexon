package com.tableorder.order.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.common.dto.UserPrincipal;
import com.tableorder.order.dto.OrderCreateRequest;
import com.tableorder.order.dto.OrderResponse;
import com.tableorder.order.dto.OrderStatusUpdateRequest;
import com.tableorder.order.service.OrderService;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.service.TableSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final TableSessionService tableSessionService;

    @PostMapping("/api/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/api/orders/current")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCurrentOrders(
            @AuthenticationPrincipal UserPrincipal principal) {
        return tableSessionService.getCurrentSession(principal.getId())
                .map(session -> {
                    List<OrderResponse> orders = orderService.getOrdersBySession(session.getId());
                    return ResponseEntity.ok(ApiResponse.success(orders));
                })
                .orElse(ResponseEntity.ok(ApiResponse.success(Collections.emptyList())));
    }

    @GetMapping("/api/admin/tables/{tableId}/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrdersByTable(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tableId) {
        List<OrderResponse> response = orderService.getActiveOrdersByTable(tableId, principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/api/admin/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(orderId, principal.getStoreId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/api/admin/orders/{orderId}")
    public ResponseEntity<Void> deleteOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId) {
        orderService.deleteOrder(orderId, principal.getStoreId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/tables/{tableId}/history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tableId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<OrderResponse> response = orderService.getOrderHistory(tableId, principal.getStoreId(), from, to);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
