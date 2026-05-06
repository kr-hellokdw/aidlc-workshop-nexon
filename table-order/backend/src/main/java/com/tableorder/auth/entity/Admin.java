package com.tableorder.auth.entity;

import com.tableorder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"store_id", "username"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Admin extends BaseEntity {

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(nullable = false, length = 30)
    private String username;

    @Column(nullable = false)
    private String password;

    @Builder
    public Admin(Long storeId, String username, String password) {
        this.storeId = storeId;
        this.username = username;
        this.password = password;
    }
}
