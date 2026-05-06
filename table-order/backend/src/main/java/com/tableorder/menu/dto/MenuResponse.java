package com.tableorder.menu.dto;

import com.tableorder.menu.entity.Menu;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MenuResponse {

    private final Long id;
    private final String name;
    private final Integer price;
    private final String description;
    private final String imageUrl;
    private final Long categoryId;
    private final Integer displayOrder;
    private final Boolean available;

    public static MenuResponse from(Menu menu) {
        return MenuResponse.builder()
                .id(menu.getId())
                .name(menu.getName())
                .price(menu.getPrice())
                .description(menu.getDescription())
                .imageUrl(menu.getImageUrl())
                .categoryId(menu.getCategoryId())
                .displayOrder(menu.getDisplayOrder())
                .available(menu.getAvailable())
                .build();
    }
}
