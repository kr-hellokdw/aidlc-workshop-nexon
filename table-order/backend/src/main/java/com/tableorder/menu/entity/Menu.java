package com.tableorder.menu.entity;

import com.tableorder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Menu extends BaseEntity {

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(length = 200)
    private String description;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean available;

    @Builder
    public Menu(Long storeId, Long categoryId, String name, Integer price,
                String description, String imageUrl, Integer displayOrder) {
        this.storeId = storeId;
        this.categoryId = categoryId;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.available = true;
    }

    public void update(String name, Integer price, String description,
                       Long categoryId, String imageUrl) {
        if (name != null) this.name = name;
        if (price != null) this.price = price;
        if (description != null) this.description = description;
        if (categoryId != null) this.categoryId = categoryId;
        if (imageUrl != null) this.imageUrl = imageUrl;
    }

    public void updateDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void clearImage() {
        this.imageUrl = null;
    }
}
