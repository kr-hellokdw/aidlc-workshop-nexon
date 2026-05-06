package com.tableorder.common.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserPrincipal {

    private final Long id;
    private final Long storeId;
    private final String role;
    private final Integer tableNumber;

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isTable() {
        return "TABLE".equals(role);
    }
}
