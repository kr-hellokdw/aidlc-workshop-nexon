package com.tableorder.table.repository;

import com.tableorder.table.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<RestaurantTable, Long> {

    List<RestaurantTable> findByStoreIdOrderByTableNumber(Long storeId);

    Optional<RestaurantTable> findByStoreIdAndTableNumber(Long storeId, Integer tableNumber);

    boolean existsByStoreIdAndTableNumber(Long storeId, Integer tableNumber);
}
