package com.tableorder.menu.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MenuCreateRequest {

    @NotBlank(message = "메뉴명은 필수입니다")
    @Size(max = 50, message = "메뉴명은 50자 이하여야 합니다")
    private String name;

    @NotNull(message = "가격은 필수입니다")
    @Min(value = 0, message = "가격은 0 이상이어야 합니다")
    private Integer price;

    @NotNull(message = "카테고리 ID는 필수입니다")
    private Long categoryId;

    @Size(max = 200, message = "설명은 200자 이하여야 합니다")
    private String description;

    private String imageUrl;
}
