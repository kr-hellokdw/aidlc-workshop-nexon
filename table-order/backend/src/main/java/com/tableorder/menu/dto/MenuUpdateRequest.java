package com.tableorder.menu.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MenuUpdateRequest {

    @Size(max = 50, message = "메뉴명은 50자 이하여야 합니다")
    private String name;

    @Min(value = 0, message = "가격은 0 이상이어야 합니다")
    private Integer price;

    private Long categoryId;

    @Size(max = 200, message = "설명은 200자 이하여야 합니다")
    private String description;

    private String imageUrl;
}
