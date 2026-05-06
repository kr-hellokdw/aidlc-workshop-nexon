package com.tableorder.menu.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.common.dto.UserPrincipal;
import com.tableorder.menu.dto.CategoryCreateRequest;
import com.tableorder.menu.dto.CategoryResponse;
import com.tableorder.menu.dto.OrderUpdateRequest;
import com.tableorder.menu.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/api/stores/{storeId}/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@PathVariable Long storeId) {
        List<CategoryResponse> response = categoryService.getCategoriesByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/admin/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(principal.getStoreId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/api/admin/categories/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.updateCategory(categoryId, principal.getStoreId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/api/admin/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId, principal.getStoreId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/admin/categories/order")
    public ResponseEntity<Void> updateCategoryOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderUpdateRequest request) {
        categoryService.updateCategoryOrder(principal.getStoreId(), request);
        return ResponseEntity.noContent().build();
    }
}
