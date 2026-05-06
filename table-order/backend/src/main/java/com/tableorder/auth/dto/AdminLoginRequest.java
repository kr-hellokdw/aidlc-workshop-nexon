package com.tableorder.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminLoginRequest {

    @NotNull(message = "매장 ID는 필수입니다")
    @Positive(message = "매장 ID는 양수여야 합니다")
    private Long storeId;

    @NotBlank(message = "사용자명은 필수입니다")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
