package com.tableorder.table.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardResponse {

    private final List<TableDashboardItem> tables;

    @Getter
    @Builder
    public static class TableDashboardItem {
        private final Long tableId;
        private final Integer tableNumber;
        private final boolean hasActiveSession;
        private final Integer totalAmount;
        private final List<OrderSummary> orders;
    }

    @Getter
    @Builder
    public static class OrderSummary {
        private final Long orderId;
        private final Integer orderNumber;
        private final String status;
        private final Integer totalAmount;
        private final String orderedAt;
    }
}
