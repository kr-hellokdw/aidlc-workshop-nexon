package com.tableorder.table.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.common.dto.UserPrincipal;
import com.tableorder.order.service.OrderService;
import com.tableorder.sse.SseEventType;
import com.tableorder.sse.service.SseService;
import com.tableorder.table.dto.*;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.service.TableService;
import com.tableorder.table.service.TableSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;
    private final TableSessionService tableSessionService;
    private final OrderService orderService;
    private final SseService sseService;

    @PostMapping
    public ResponseEntity<ApiResponse<TableResponse>> createTable(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TableCreateRequest request) {
        TableResponse response = tableService.createTable(principal.getStoreId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTables(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TableResponse> response = tableService.getTablesByStore(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{tableId}")
    public ResponseEntity<ApiResponse<TableResponse>> getTable(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tableId) {
        TableResponse response = tableService.getTableById(tableId, principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{tableId}")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tableId,
            @Valid @RequestBody TableUpdateRequest request) {
        TableResponse response = tableService.updateTable(tableId, principal.getStoreId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{tableId}")
    public ResponseEntity<Void> deleteTable(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tableId) {
        tableService.deleteTable(tableId, principal.getStoreId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tableId}/complete-session")
    public ResponseEntity<ApiResponse<Void>> completeSession(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tableId) {
        // 미완료 주문 강제 완료
        tableSessionService.getCurrentSession(tableId)
                .ifPresent(session -> orderService.forceCompleteOrders(session.getId()));

        // 세션 종료
        TableSession session = tableSessionService.completeSession(tableId);

        // SSE 이벤트 발행
        sseService.publishEvent(principal.getStoreId(), SseEventType.SESSION_COMPLETED,
                Map.of("tableId", tableId, "sessionId", session.getId()));

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardResponse response = tableService.getDashboardData(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
