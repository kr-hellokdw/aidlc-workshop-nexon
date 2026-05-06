package com.tableorder.menu.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.common.exception.DuplicateResourceException;
import com.tableorder.common.exception.ResourceNotFoundException;
import com.tableorder.menu.dto.CategoryCreateRequest;
import com.tableorder.menu.dto.CategoryResponse;
import com.tableorder.menu.dto.OrderUpdateRequest;
import com.tableorder.menu.entity.Category;
import com.tableorder.menu.repository.CategoryRepository;
import com.tableorder.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MenuRepository menuRepository;

    public List<CategoryResponse> getCategoriesByStore(Long storeId) {
        return categoryRepository.findByStoreIdOrderByDisplayOrder(storeId).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(Long storeId, CategoryCreateRequest request) {
        if (categoryRepository.existsByStoreIdAndName(storeId, request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        int nextOrder = categoryRepository.findTopByStoreIdOrderByDisplayOrderDesc(storeId)
                .map(c -> c.getDisplayOrder() + 1)
                .orElse(0);

        Category category = Category.builder()
                .storeId(storeId)
                .name(request.getName())
                .displayOrder(nextOrder)
                .build();

        category = categoryRepository.save(category);
        return CategoryResponse.from(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, Long storeId, CategoryCreateRequest request) {
        Category category = findCategoryByIdAndStore(categoryId, storeId);

        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByStoreIdAndName(storeId, request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        category.update(request.getName());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId, Long storeId) {
        Category category = findCategoryByIdAndStore(categoryId, storeId);

        if (menuRepository.existsByCategoryId(categoryId)) {
            throw new BusinessException("CATEGORY_HAS_MENUS", "메뉴가 있는 카테고리는 삭제할 수 없습니다");
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public void updateCategoryOrder(Long storeId, OrderUpdateRequest request) {
        List<Category> categories = categoryRepository.findAllById(
                request.getItems().stream().map(OrderUpdateRequest.OrderItem::getId).toList()
        );

        for (Category category : categories) {
            if (!category.getStoreId().equals(storeId)) {
                throw new AccessDeniedException("Access denied");
            }
            request.getItems().stream()
                    .filter(item -> item.getId().equals(category.getId()))
                    .findFirst()
                    .ifPresent(item -> category.updateDisplayOrder(item.getDisplayOrder()));
        }
    }

    private Category findCategoryByIdAndStore(Long categoryId, Long storeId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        if (!category.getStoreId().equals(storeId)) {
            throw new AccessDeniedException("Access denied");
        }
        return category;
    }
}
