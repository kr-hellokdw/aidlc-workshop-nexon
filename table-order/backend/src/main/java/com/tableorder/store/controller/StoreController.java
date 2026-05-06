package com.tableorder.store.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.store.dto.StoreResponse;
import com.tableorder.store.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreResponse>> getStore(@PathVariable Long storeId) {
        StoreResponse response = storeService.getStoreById(storeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
