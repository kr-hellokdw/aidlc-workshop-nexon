export interface MenuItem {
  menuId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
}

export interface Category {
  categoryId: number;
  name: string;
  displayOrder: number;
  menuCount: number;
}

export interface MenuCreateRequest {
  name: string;
  price: number;
  description: string;
  categoryId: number;
  image?: File;
}

export interface MenuUpdateRequest {
  name?: string;
  price?: number;
  description?: string;
  categoryId?: number;
  image?: File;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface CategoryUpdateRequest {
  name: string;
}
