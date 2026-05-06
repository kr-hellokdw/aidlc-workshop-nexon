import { useState } from 'react';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import { MenuForm } from './MenuForm';
import { CategoryManager } from './CategoryManager';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { MenuItem, MenuCreateRequest } from '../types';
import { formatCurrency } from '@/common/utils/formatters';

export const MenuManagementPage = () => {
  const { menus, loading, createMenu, updateMenu, deleteMenu, reorderMenus } = useMenuManagement();
  const categoryMgmt = useCategoryManagement();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const filteredMenus = selectedCategoryId
    ? menus.filter((m) => m.categoryId === selectedCategoryId)
    : menus;

  const handleCreate = async (data: MenuCreateRequest) => {
    await createMenu(data);
    setShowMenuForm(false);
  };

  const handleUpdate = async (data: MenuCreateRequest) => {
    if (editTarget) {
      await updateMenu(editTarget.menuId, data);
      setEditTarget(null);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteMenu(deleteTarget.menuId);
      setDeleteTarget(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...filteredMenus];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    reorderMenus(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === filteredMenus.length - 1) return;
    const reordered = [...filteredMenus];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    reorderMenus(reordered);
  };

  if (loading) {
    return (
      <div className="page-loading" role="status" aria-label="로딩 중">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="menu-management-page">
      <header className="page-header">
        <h1>메뉴 관리</h1>
      </header>

      <div className="category-tabs">
        <button
          className={`tab ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => setSelectedCategoryId(null)}
        >
          전체
        </button>
        {categoryMgmt.categories.map((cat) => (
          <button
            key={cat.categoryId}
            className={`tab ${selectedCategoryId === cat.categoryId ? 'active' : ''}`}
            onClick={() => setSelectedCategoryId(cat.categoryId)}
          >
            {cat.name}
          </button>
        ))}
        <button
          className="tab tab-settings"
          onClick={() => setShowCategoryManager(true)}
          aria-label="카테고리 관리"
        >
          ⚙ 카테고리
        </button>
      </div>

      <div className="menu-actions">
        <button onClick={() => setShowMenuForm(true)} className="btn btn-primary">
          + 메뉴 추가
        </button>
      </div>

      <div className="menu-list" role="list">
        {filteredMenus.length === 0 ? (
          <p className="empty-message">등록된 메뉴가 없습니다</p>
        ) : (
          filteredMenus.map((menu, index) => (
            <div key={menu.menuId} className="menu-list-item" role="listitem">
              <div className="menu-order-controls" aria-label={`${menu.name} 순서 변경`}>
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label="위로 이동"
                  className="btn-icon"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === filteredMenus.length - 1}
                  aria-label="아래로 이동"
                  className="btn-icon"
                >
                  ↓
                </button>
              </div>

              <div className="menu-image-cell">
                {menu.imageUrl ? (
                  <img src={menu.imageUrl} alt={menu.name} className="menu-thumb" loading="lazy" />
                ) : (
                  <div className="menu-thumb-placeholder" aria-label={`${menu.name} 이미지 없음`} />
                )}
              </div>

              <div className="menu-info">
                <span className="menu-name">{menu.name}</span>
                <span className="menu-category">{menu.categoryName}</span>
              </div>

              <div className="menu-price">{formatCurrency(menu.price)}</div>

              <div className="menu-item-actions">
                <button onClick={() => setEditTarget(menu)} className="btn btn-sm btn-secondary" aria-label={`${menu.name} 수정`}>
                  ✏
                </button>
                <button onClick={() => setDeleteTarget(menu)} className="btn btn-sm btn-danger" aria-label={`${menu.name} 삭제`}>
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="menu-hint">💡 ↑↓ 버튼으로 메뉴 순서를 변경할 수 있습니다</p>

      {(showMenuForm || editTarget) && (
        <MenuForm
          categories={categoryMgmt.categories}
          initialData={editTarget || undefined}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowMenuForm(false);
            setEditTarget(null);
          }}
          title={editTarget ? '메뉴 수정' : '메뉴 등록'}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categoryMgmt.categories}
          onCreate={categoryMgmt.createCategory}
          onUpdate={categoryMgmt.updateCategory}
          onDelete={categoryMgmt.deleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="메뉴 삭제"
        message={`"${deleteTarget?.name}" 메뉴를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
};
