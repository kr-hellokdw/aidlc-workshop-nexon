import { apiClient } from '@/common/api/apiClient';
import { ApiResponse } from '@/common/types';
import { MenuItem, Category, MenuCreateRequest, MenuUpdateRequest } from '../types';

export const menuApi = {
  getMenus: async (storeId: number): Promise<MenuItem[]> => {
    const { data } = await apiClient.get<ApiResponse<MenuItem[]>>(
      `/api/stores/${storeId}/menus`,
    );
    return data.data;
  },

  createMenu: async (request: MenuCreateRequest): Promise<MenuItem> => {
    const formData = new FormData();
    formData.append('name', request.name);
    formData.append('price', request.price.toString());
    formData.append('description', request.description);
    formData.append('categoryId', request.categoryId.toString());
    if (request.image) {
      formData.append('image', request.image);
    }

    const { data } = await apiClient.post<ApiResponse<MenuItem>>('/api/admin/menus', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  updateMenu: async (menuId: number, request: MenuUpdateRequest): Promise<MenuItem> => {
    const formData = new FormData();
    if (request.name) formData.append('name', request.name);
    if (request.price !== undefined) formData.append('price', request.price.toString());
    if (request.description !== undefined) formData.append('description', request.description);
    if (request.categoryId) formData.append('categoryId', request.categoryId.toString());
    if (request.image) formData.append('image', request.image);

    const { data } = await apiClient.put<ApiResponse<MenuItem>>(
      `/api/admin/menus/${menuId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  deleteMenu: async (menuId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/menus/${menuId}`);
  },

  updateMenuOrder: async (items: { menuId: number; displayOrder: number }[]): Promise<void> => {
    await apiClient.put('/api/admin/menus/order', items);
  },

  getCategories: async (storeId: number): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>(
      `/api/stores/${storeId}/categories`,
    );
    return data.data;
  },

  createCategory: async (request: { name: string }): Promise<Category> => {
    const { data } = await apiClient.post<ApiResponse<Category>>('/api/admin/categories', request);
    return data.data;
  },

  updateCategory: async (categoryId: number, request: { name: string }): Promise<Category> => {
    const { data } = await apiClient.put<ApiResponse<Category>>(
      `/api/admin/categories/${categoryId}`,
      request,
    );
    return data.data;
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${categoryId}`);
  },

  updateCategoryOrder: async (
    items: { categoryId: number; displayOrder: number }[],
  ): Promise<void> => {
    await apiClient.put('/api/admin/categories/order', items);
  },
};
