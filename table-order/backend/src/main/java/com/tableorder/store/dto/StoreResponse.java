package com.tableorder.store.dto;

import com.tableorder.store.entity.Store;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StoreResponse {

    private final Long id;
    private final String name;

    public static StoreResponse from(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .build();
    }
}
