package com.tableorder.menu.repository;

import com.tableorder.menu.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByStoreIdAndAvailableTrueOrderByDisplayOrder(Long storeId);

    List<Menu> findByStoreIdOrderByDisplayOrder(Long storeId);

    boolean existsByCategoryId(Long categoryId);

    Optional<Menu> findTopByStoreIdAndCategoryIdOrderByDisplayOrderDesc(Long storeId, Long categoryId);

    List<Menu> findAllByIdIn(List<Long> ids);
}
