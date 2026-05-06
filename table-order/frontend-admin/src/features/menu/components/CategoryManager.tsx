import { useState } from 'react';
import { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (categoryId: number, name: string) => Promise<void>;
  onDelete: (categoryId: number) => Promise<void>;
  onClose: () => void;
}

export const CategoryManager = ({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: CategoryManagerProps) => {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName('');
  };

  const handleUpdate = async (categoryId: number) => {
    if (!editName.trim()) return;
    await onUpdate(categoryId, editName.trim());
    setEditId(null);
    setEditName('');
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.categoryId);
    setEditName(cat.name);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="category-manager-title">카테고리 관리</h2>
          <button onClick={onClose} className="modal-close" aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="category-list">
            {categories.map((cat) => (
              <div key={cat.categoryId} className="category-item">
                {editId === cat.categoryId ? (
                  <div className="category-edit">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.categoryId)}
                      aria-label="카테고리 이름 수정"
                    />
                    <button onClick={() => handleUpdate(cat.categoryId)} className="btn btn-sm btn-primary">
                      저장
                    </button>
                    <button onClick={() => setEditId(null)} className="btn btn-sm btn-secondary">
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="category-name">
                      {cat.name} ({cat.menuCount}개 메뉴)
                    </span>
                    <div className="category-actions">
                      <button
                        onClick={() => startEdit(cat)}
                        className="btn btn-sm btn-secondary"
                        aria-label={`${cat.name} 수정`}
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => onDelete(cat.categoryId)}
                        className="btn btn-sm btn-danger"
                        disabled={cat.menuCount > 0}
                        aria-label={`${cat.name} 삭제`}
                        title={cat.menuCount > 0 ? '메뉴가 있는 카테고리는 삭제 불가' : ''}
                      >
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {categories.some((c) => c.menuCount > 0) && (
            <p className="category-hint">⚠ 메뉴가 있는 카테고리는 삭제할 수 없습니다</p>
          )}

          <div className="category-add">
            <label htmlFor="new-category" className="sr-only">새 카테고리 이름</label>
            <input
              id="new-category"
              type="text"
              placeholder="새 카테고리 이름"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button onClick={handleCreate} className="btn btn-primary" disabled={!newName.trim()}>
              추가
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
