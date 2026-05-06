export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  displayOrder: number;
}

export interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface Order {
  id: number;
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
  orderedAt: string;
}

export interface OrderItem {
  menuName: string;
  quantity: number;
  menuPrice: number;
  subtotal: number;
}

export interface TableInfo {
  storeId: number;
  tableId: number;
  tableNumber: number;
  sessionId: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface TokenResponse {
  accessToken: string;
  tableId: number;
  tableNumber: number;
  storeId: number;
  sessionId: number | null;
}
