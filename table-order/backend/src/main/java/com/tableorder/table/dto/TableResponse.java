package com.tableorder.table.dto;

import com.tableorder.table.entity.RestaurantTable;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TableResponse {

    private final Long id;
    private final Integer tableNumber;
    private final Long storeId;

    public static TableResponse from(RestaurantTable table) {
        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .storeId(table.getStoreId())
                .build();
    }
}
