package com.tableorder.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String role;
    private final Long storeId;
}
