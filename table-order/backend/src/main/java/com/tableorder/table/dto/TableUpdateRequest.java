package com.tableorder.table.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TableUpdateRequest {

    @Positive(message = "테이블 번호는 양수여야 합니다")
    private Integer tableNumber;

    @Size(min = 4, max = 20, message = "비밀번호는 4~20자여야 합니다")
    private String password;
}
