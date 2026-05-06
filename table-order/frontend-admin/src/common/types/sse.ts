import { OrderSummary, OrderStatus } from './order';

export type SseEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'SESSION_COMPLETED'
  | 'HEARTBEAT';

export interface NewOrderEvent {
  tableId: number;
  tableNumber: number;
  order: OrderSummary;
}

export interface OrderStatusChangedEvent {
  tableId: number;
  orderId: number;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
}

export interface OrderDeletedEvent {
  tableId: number;
  orderId: number;
  newTableTotal: number;
}

export interface SessionCompletedEvent {
  tableId: number;
  tableNumber: number;
  completedAt: string;
}

export interface HeartbeatEvent {
  timestamp: string;
}
