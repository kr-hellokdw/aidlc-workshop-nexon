package com.tableorder.menu.entity;

import com.tableorder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "category", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"store_id", "name"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category extends BaseEntity {

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Builder
    public Category(Long storeId, String name, Integer displayOrder) {
        this.storeId = storeId;
        this.name = name;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public void update(String name) {
        if (name != null) this.name = name;
    }

    public void updateDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
