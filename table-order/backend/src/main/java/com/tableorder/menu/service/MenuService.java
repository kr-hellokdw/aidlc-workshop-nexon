package com.tableorder.menu.service;

import com.tableorder.common.exception.ResourceNotFoundException;
import com.tableorder.file.service.FileService;
import com.tableorder.menu.dto.*;
import com.tableorder.menu.entity.Category;
import com.tableorder.menu.entity.Menu;
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
public class MenuService {

    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final FileService fileService;

    public List<MenuResponse> getMenusByStore(Long storeId) {
        return menuRepository.findByStoreIdAndAvailableTrueOrderByDisplayOrder(storeId).stream()
                .map(MenuResponse::from)
                .toList();
    }

    public List<MenuResponse> getAllMenusByStore(Long storeId) {
        return menuRepository.findByStoreIdOrderByDisplayOrder(storeId).stream()
                .map(MenuResponse::from)
                .toList();
    }

    @Transactional
    public MenuResponse createMenu(Long storeId, MenuCreateRequest request) {
        validateCategoryBelongsToStore(request.getCategoryId(), storeId);

        int nextOrder = menuRepository.findTopByStoreIdAndCategoryIdOrderByDisplayOrderDesc(storeId, request.getCategoryId())
                .map(m -> m.getDisplayOrder() + 1)
                .orElse(0);

        Menu menu = Menu.builder()
                .storeId(storeId)
                .categoryId(request.getCategoryId())
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(nextOrder)
                .build();

        menu = menuRepository.save(menu);
        return MenuResponse.from(menu);
    }

    @Transactional
    public MenuResponse updateMenu(Long menuId, Long storeId, MenuUpdateRequest request) {
        Menu menu = findMenuByIdAndStore(menuId, storeId);

        if (request.getCategoryId() != null) {
            validateCategoryBelongsToStore(request.getCategoryId(), storeId);
        }

        menu.update(request.getName(), request.getPrice(), request.getDescription(),
                request.getCategoryId(), request.getImageUrl());

        return MenuResponse.from(menu);
    }

    @Transactional
    public void deleteMenu(Long menuId, Long storeId) {
        Menu menu = findMenuByIdAndStore(menuId, storeId);

        if (menu.getImageUrl() != null) {
            String filename = extractFilename(menu.getImageUrl());
            fileService.deleteImage(filename);
        }

        menuRepository.delete(menu);
    }

    @Transactional
    public void updateMenuOrder(Long storeId, OrderUpdateRequest request) {
        List<Menu> menus = menuRepository.findAllById(
                request.getItems().stream().map(OrderUpdateRequest.OrderItem::getId).toList()
        );

        for (Menu menu : menus) {
            if (!menu.getStoreId().equals(storeId)) {
                throw new AccessDeniedException("Access denied");
            }
            request.getItems().stream()
                    .filter(item -> item.getId().equals(menu.getId()))
                    .findFirst()
                    .ifPresent(item -> menu.updateDisplayOrder(item.getDisplayOrder()));
        }
    }

    private Menu findMenuByIdAndStore(Long menuId, Long storeId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", menuId));
        if (!menu.getStoreId().equals(storeId)) {
            throw new AccessDeniedException("Access denied");
        }
        return menu;
    }

    private void validateCategoryBelongsToStore(Long categoryId, Long storeId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        if (!category.getStoreId().equals(storeId)) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private String extractFilename(String imageUrl) {
        return imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    }
}
