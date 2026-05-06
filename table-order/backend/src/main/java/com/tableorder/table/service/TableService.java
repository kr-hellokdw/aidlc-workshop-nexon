package com.tableorder.table.service;

import com.tableorder.common.exception.DuplicateResourceException;
import com.tableorder.common.exception.ResourceNotFoundException;
import com.tableorder.order.entity.Order;
import com.tableorder.order.repository.OrderRepository;
import com.tableorder.table.dto.*;
import com.tableorder.table.entity.RestaurantTable;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableService {

    private final TableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public TableResponse createTable(Long storeId, TableCreateRequest request) {
        if (tableRepository.existsByStoreIdAndTableNumber(storeId, request.getTableNumber())) {
            throw new DuplicateResourceException("Table", "tableNumber", request.getTableNumber());
        }

        RestaurantTable table = RestaurantTable.builder()
                .storeId(storeId)
                .tableNumber(request.getTableNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        table = tableRepository.save(table);
        return TableResponse.from(table);
    }

    public List<TableResponse> getTablesByStore(Long storeId) {
        return tableRepository.findByStoreIdOrderByTableNumber(storeId).stream()
                .map(TableResponse::from)
                .toList();
    }

    public TableResponse getTableById(Long tableId, Long storeId) {
        RestaurantTable table = findTableByIdAndStore(tableId, storeId);
        return TableResponse.from(table);
    }

    @Transactional
    public TableResponse updateTable(Long tableId, Long storeId, TableUpdateRequest request) {
        RestaurantTable table = findTableByIdAndStore(tableId, storeId);

        if (request.getTableNumber() != null && !request.getTableNumber().equals(table.getTableNumber())) {
            if (tableRepository.existsByStoreIdAndTableNumber(storeId, request.getTableNumber())) {
                throw new DuplicateResourceException("Table", "tableNumber", request.getTableNumber());
            }
        }

        String encodedPassword = request.getPassword() != null
                ? passwordEncoder.encode(request.getPassword())
                : null;

        table.update(request.getTableNumber(), encodedPassword);
        return TableResponse.from(table);
    }

    @Transactional
    public void deleteTable(Long tableId, Long storeId) {
        RestaurantTable table = findTableByIdAndStore(tableId, storeId);
        tableRepository.delete(table);
    }

    private RestaurantTable findTableByIdAndStore(Long tableId, Long storeId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table", tableId));
        if (!table.getStoreId().equals(storeId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return table;
    }

    public DashboardResponse getDashboardData(Long storeId) {
        List<RestaurantTable> tables = tableRepository.findByStoreIdOrderByTableNumber(storeId);

        List<DashboardResponse.TableDashboardItem> items = tables.stream().map(table -> {
            Optional<TableSession> activeSession = tableSessionRepository.findByTableIdAndStatus(
                    table.getId(), TableSession.SessionStatus.ACTIVE);

            List<DashboardResponse.OrderSummary> orderSummaries = Collections.emptyList();
            int totalAmount = 0;

            if (activeSession.isPresent()) {
                List<Order> orders = orderRepository.findBySessionIdWithItems(activeSession.get().getId());
                totalAmount = orders.stream().mapToInt(Order::getTotalAmount).sum();
                orderSummaries = orders.stream().map(order -> DashboardResponse.OrderSummary.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .status(order.getStatus().name())
                        .totalAmount(order.getTotalAmount())
                        .orderedAt(order.getOrderedAt().toString())
                        .build()
                ).toList();
            }

            return DashboardResponse.TableDashboardItem.builder()
                    .tableId(table.getId())
                    .tableNumber(table.getTableNumber())
                    .hasActiveSession(activeSession.isPresent())
                    .totalAmount(totalAmount)
                    .orders(orderSummaries)
                    .build();
        }).toList();

        return DashboardResponse.builder().tables(items).build();
    }
}
