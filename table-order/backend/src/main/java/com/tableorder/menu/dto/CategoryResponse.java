package com.tableorder.menu.dto;

import com.tableorder.menu.entity.Category;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {

    private final Long id;
    private final String name;
    private final Integer displayOrder;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .displayOrder(category.getDisplayOrder())
                .build();
    }
}
