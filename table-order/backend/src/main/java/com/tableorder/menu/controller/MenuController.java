package com.tableorder.menu.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.common.dto.UserPrincipal;
import com.tableorder.menu.dto.*;
import com.tableorder.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/api/stores/{storeId}/menus")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusByStore(@PathVariable Long storeId) {
        List<MenuResponse> response = menuService.getMenusByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/admin/menus")
    public ResponseEntity<ApiResponse<MenuResponse>> createMenu(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MenuCreateRequest request) {
        MenuResponse response = menuService.createMenu(principal.getStoreId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/api/admin/menus/{menuId}")
    public ResponseEntity<ApiResponse<MenuResponse>> updateMenu(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long menuId,
            @Valid @RequestBody MenuUpdateRequest request) {
        MenuResponse response = menuService.updateMenu(menuId, principal.getStoreId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/api/admin/menus/{menuId}")
    public ResponseEntity<Void> deleteMenu(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long menuId) {
        menuService.deleteMenu(menuId, principal.getStoreId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/admin/menus/order")
    public ResponseEntity<Void> updateMenuOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderUpdateRequest request) {
        menuService.updateMenuOrder(principal.getStoreId(), request);
        return ResponseEntity.noContent().build();
    }
}
