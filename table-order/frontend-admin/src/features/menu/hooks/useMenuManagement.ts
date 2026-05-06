import { useState, useEffect, useCallback } from 'react';
import { menuApi } from '../api/menuApi';
import { MenuItem, MenuCreateRequest, MenuUpdateRequest } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/common/components/Toast';

export const useMenuManagement = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { storeInfo } = useAuth();
  const toast = useToast();

  const loadMenus = useCallback(async () => {
    if (!storeInfo) return;
    setLoading(true);
    try {
      const data = await menuApi.getMenus(storeInfo.storeId);
      setMenus(data);
    } catch {
      toast.error('메뉴 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [storeInfo, toast]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const createMenu = useCallback(
    async (request: MenuCreateRequest) => {
      try {
        const newMenu = await menuApi.createMenu(request);
        setMenus((prev) => [...prev, newMenu]);
        toast.success('메뉴가 등록되었습니다');
      } catch {
        toast.error('메뉴 등록에 실패했습니다');
        throw new Error('메뉴 등록 실패');
      }
    },
    [toast],
  );

  const updateMenu = useCallback(
    async (menuId: number, request: MenuUpdateRequest) => {
      try {
        const updated = await menuApi.updateMenu(menuId, request);
        setMenus((prev) => prev.map((m) => (m.menuId === menuId ? updated : m)));
        toast.success('메뉴가 수정되었습니다');
      } catch {
        toast.error('메뉴 수정에 실패했습니다');
        throw new Error('메뉴 수정 실패');
      }
    },
    [toast],
  );

  const deleteMenu = useCallback(
    async (menuId: number) => {
      try {
        await menuApi.deleteMenu(menuId);
        setMenus((prev) => prev.filter((m) => m.menuId !== menuId));
        toast.success('메뉴가 삭제되었습니다');
      } catch {
        toast.error('메뉴 삭제에 실패했습니다');
      }
    },
    [toast],
  );

  const reorderMenus = useCallback(
    async (reordered: MenuItem[]) => {
      setMenus(reordered);
      const orderData = reordered.map((m, idx) => ({ menuId: m.menuId, displayOrder: idx }));
      try {
        await menuApi.updateMenuOrder(orderData);
      } catch {
        toast.error('순서 변경에 실패했습니다');
        loadMenus(); // 롤백
      }
    },
    [toast, loadMenus],
  );

  return { menus, loading, createMenu, updateMenu, deleteMenu, reorderMenus, reload: loadMenus };
};
