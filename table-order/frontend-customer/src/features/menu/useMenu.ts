import { useState, useEffect } from 'react';
import apiClient from '../../common/api/client';
import type { Menu, Category, ApiResponse } from '../../common/types';

export function useMenu(storeId: number) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, menuRes] = await Promise.all([
          apiClient.get<ApiResponse<Category[]>>(`/stores/${storeId}/categories`),
          apiClient.get<ApiResponse<Menu[]>>(`/stores/${storeId}/menus`),
        ]);
        setCategories(catRes.data.data.sort((a, b) => a.displayOrder - b.displayOrder));
        setMenus(menuRes.data.data.sort((a, b) => a.displayOrder - b.displayOrder));
      } catch {
        setError('메뉴를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  return { menus, categories, loading, error };
}
