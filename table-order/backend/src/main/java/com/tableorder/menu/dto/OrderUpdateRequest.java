package com.tableorder.menu.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class OrderUpdateRequest {

    @NotNull(message = "순서 목록은 필수입니다")
    private List<OrderItem> items;

    @Getter
    @NoArgsConstructor
    public static class OrderItem {
        @NotNull
        private Long id;
        @NotNull
        private Integer displayOrder;
    }
}
