package com.tableorder.table.entity;

import com.tableorder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurant_table", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"store_id", "table_number"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RestaurantTable extends BaseEntity {

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    @Column(nullable = false)
    private String password;

    @Builder
    public RestaurantTable(Long storeId, Integer tableNumber, String password) {
        this.storeId = storeId;
        this.tableNumber = tableNumber;
        this.password = password;
    }

    public void update(Integer tableNumber, String password) {
        if (tableNumber != null) this.tableNumber = tableNumber;
        if (password != null) this.password = password;
    }
}
