import { useState, FormEvent } from 'react';
import { validators } from '@/common/utils/validators';
import { Category, MenuItem, MenuCreateRequest } from '../types';

interface MenuFormProps {
  categories: Category[];
  initialData?: MenuItem;
  onSubmit: (data: MenuCreateRequest) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export const MenuForm = ({ categories, initialData, onSubmit, onCancel, title }: MenuFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validators.required(name);
    if (nameErr) newErrors.name = nameErr;

    const priceNum = Number(price);
    if (!price) newErrors.price = '필수 입력 항목입니다';
    else {
      const posErr = validators.positiveNumber(priceNum);
      if (posErr) newErrors.price = posErr;
      const maxErr = validators.maxPrice(priceNum);
      if (maxErr) newErrors.price = maxErr;
    }

    if (!categoryId) newErrors.categoryId = '카테고리를 선택해주세요';

    if (image) {
      const imgErr = validators.imageFile(image);
      if (imgErr) newErrors.image = imgErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      const err = validators.imageFile(file);
      if (err) {
        setErrors((prev) => ({ ...prev, image: err }));
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => {
        const { image: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data: MenuCreateRequest = {
        name,
        price: Number(price),
        description,
        categoryId: Number(categoryId),
        image: image || undefined,
      };
      await onSubmit(data);
    } catch {
      // 에러는 상위에서 toast로 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="menu-form-title">{title}</h2>
          <button onClick={onCancel} className="modal-close" aria-label="닫기">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="menu-name">메뉴명 *</label>
              <input
                id="menu-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <span id="name-error" className="field-error" role="alert">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="menu-price">가격 (원) *</label>
              <input
                id="menu-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={submitting}
                min="1"
                max="1000000"
                aria-describedby={errors.price ? 'price-error' : undefined}
              />
              {errors.price && <span id="price-error" className="field-error" role="alert">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="menu-description">설명</label>
              <textarea
                id="menu-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="menu-category">카테고리 *</label>
              <select
                id="menu-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={submitting}
                aria-describedby={errors.categoryId ? 'category-error' : undefined}
              >
                <option value="">선택해주세요</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span id="category-error" className="field-error" role="alert">{errors.categoryId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="menu-image">이미지</label>
              <input
                id="menu-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                disabled={submitting}
                aria-describedby={errors.image ? 'image-error' : 'image-hint'}
              />
              <span id="image-hint" className="field-hint">jpg, png, webp / 최대 5MB</span>
              {errors.image && <span id="image-error" className="field-error" role="alert">{errors.image}</span>}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="미리보기" />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
