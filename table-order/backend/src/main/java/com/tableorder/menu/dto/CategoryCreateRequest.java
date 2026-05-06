package com.tableorder.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CategoryCreateRequest {

    @NotBlank(message = "카테고리명은 필수입니다")
    @Size(max = 30, message = "카테고리명은 30자 이하여야 합니다")
    private String name;
}
