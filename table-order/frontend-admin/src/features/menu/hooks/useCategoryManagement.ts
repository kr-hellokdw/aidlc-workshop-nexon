import { useState, useEffect, useCallback } from 'react';
import { menuApi } from '../api/menuApi';
import { Category } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/common/components/Toast';

export const useCategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { storeInfo } = useAuth();
  const toast = useToast();

  const loadCategories = useCallback(async () => {
    if (!storeInfo) return;
    setLoading(true);
    try {
      const data = await menuApi.getCategories(storeInfo.storeId);
      setCategories(data);
    } catch {
      toast.error('카테고리 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [storeInfo, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(
    async (name: string) => {
      try {
        const newCat = await menuApi.createCategory({ name });
        setCategories((prev) => [...prev, newCat]);
        toast.success('카테고리가 추가되었습니다');
      } catch {
        toast.error('카테고리 추가에 실패했습니다');
      }
    },
    [toast],
  );

  const updateCategory = useCallback(
    async (categoryId: number, name: string) => {
      try {
        const updated = await menuApi.updateCategory(categoryId, { name });
        setCategories((prev) => prev.map((c) => (c.categoryId === categoryId ? updated : c)));
        toast.success('카테고리가 수정되었습니다');
      } catch {
        toast.error('카테고리 수정에 실패했습니다');
      }
    },
    [toast],
  );

  const deleteCategory = useCallback(
    async (categoryId: number) => {
      try {
        await menuApi.deleteCategory(categoryId);
        setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
        toast.success('카테고리가 삭제되었습니다');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        toast.error(
          axiosErr.response?.data?.error?.message || '카테고리 삭제에 실패했습니다',
        );
      }
    },
    [toast],
  );

  return { categories, loading, createCategory, updateCategory, deleteCategory, reload: loadCategories };
};
