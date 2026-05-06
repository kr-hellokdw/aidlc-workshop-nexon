export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export interface OrderSummary {
  orderId: number;
  orderNumber: string;
  items: OrderItemSummary[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItemSummary {
  menuName: string;
  quantity: number;
  price: number;
}
