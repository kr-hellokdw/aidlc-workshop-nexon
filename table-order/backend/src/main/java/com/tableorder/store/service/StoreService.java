package com.tableorder.store.service;

import com.tableorder.common.exception.ResourceNotFoundException;
import com.tableorder.store.dto.StoreResponse;
import com.tableorder.store.entity.Store;
import com.tableorder.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreResponse getStoreById(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
        return StoreResponse.from(store);
    }

    public Store validateStoreExists(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }
}
