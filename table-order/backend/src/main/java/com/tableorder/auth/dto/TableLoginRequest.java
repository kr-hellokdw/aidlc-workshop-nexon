package com.tableorder.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TableLoginRequest {

    @NotNull(message = "매장 ID는 필수입니다")
    @Positive(message = "매장 ID는 양수여야 합니다")
    private Long storeId;

    @NotNull(message = "테이블 번호는 필수입니다")
    @Positive(message = "테이블 번호는 양수여야 합니다")
    private Integer tableNumber;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
