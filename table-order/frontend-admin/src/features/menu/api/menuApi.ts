import { apiClient } from '@/common/api/apiClient';
import { ApiResponse } from '@/common/types';
import { MenuItem, Category, MenuCreateRequest, MenuUpdateRequest } from '../types';

interface BackendMenuResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  displayOrder: number;
  available: boolean;
}

interface BackendCategoryResponse {
  id: number;
  name: string;
  displayOrder: number;
}

function mapMenu(m: BackendMenuResponse, categoryName?: string): MenuItem {
  return {
    menuId: m.id,
    name: m.name,
    price: m.price,
    description: m.description || '',
    imageUrl: m.imageUrl,
    categoryId: m.categoryId,
    categoryName: categoryName || '',
    displayOrder: m.displayOrder,
  };
}

function mapCategory(c: BackendCategoryResponse): Category {
  return {
    categoryId: c.id,
    name: c.name,
    displayOrder: c.displayOrder,
    menuCount: 0,
  };
}

export const menuApi = {
  getMenus: async (storeId: number): Promise<MenuItem[]> => {
    const [menuRes, catRes] = await Promise.all([
      apiClient.get<ApiResponse<BackendMenuResponse[]>>(`/api/stores/${storeId}/menus`),
      apiClient.get<ApiResponse<BackendCategoryResponse[]>>(`/api/stores/${storeId}/categories`),
    ]);
    const catMap = new Map(catRes.data.data.map(c => [c.id, c.name]));
    return menuRes.data.data.map(m => mapMenu(m, catMap.get(m.categoryId)));
  },

  createMenu: async (request: MenuCreateRequest): Promise<MenuItem> => {
    const { data } = await apiClient.post<ApiResponse<BackendMenuResponse>>('/api/admin/menus', {
      name: request.name,
      price: request.price,
      description: request.description,
      categoryId: request.categoryId,
    });
    return mapMenu(data.data);
  },

  updateMenu: async (menuId: number, request: MenuUpdateRequest): Promise<MenuItem> => {
    const { data } = await apiClient.put<ApiResponse<BackendMenuResponse>>(
      `/api/admin/menus/${menuId}`,
      {
        name: request.name,
        price: request.price,
        description: request.description,
        categoryId: request.categoryId,
      },
    );
    return mapMenu(data.data);
  },

  deleteMenu: async (menuId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/menus/${menuId}`);
  },

  updateMenuOrder: async (items: { menuId: number; displayOrder: number }[]): Promise<void> => {
    await apiClient.put('/api/admin/menus/order', {
      items: items.map(i => ({ id: i.menuId, displayOrder: i.displayOrder })),
    });
  },

  getCategories: async (storeId: number): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<BackendCategoryResponse[]>>(
      `/api/stores/${storeId}/categories`,
    );
    return data.data.map(mapCategory);
  },

  createCategory: async (request: { name: string }): Promise<Category> => {
    const { data } = await apiClient.post<ApiResponse<BackendCategoryResponse>>('/api/admin/categories', request);
    return mapCategory(data.data);
  },

  updateCategory: async (categoryId: number, request: { name: string }): Promise<Category> => {
    const { data } = await apiClient.put<ApiResponse<BackendCategoryResponse>>(
      `/api/admin/categories/${categoryId}`,
      request,
    );
    return mapCategory(data.data);
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${categoryId}`);
  },

  updateCategoryOrder: async (items: { categoryId: number; displayOrder: number }[]): Promise<void> => {
    await apiClient.put('/api/admin/categories/order', {
      items: items.map(i => ({ id: i.categoryId, displayOrder: i.displayOrder })),
    });
  },
};
