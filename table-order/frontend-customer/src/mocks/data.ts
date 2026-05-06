import type { Category, Menu, Order } from '../common/types';

export const mockCategories: Category[] = [
  { id: 1, name: '한식', displayOrder: 1 },
  { id: 2, name: '음료', displayOrder: 2 },
  { id: 3, name: '사이드', displayOrder: 3 },
  { id: 4, name: '디저트', displayOrder: 4 },
];

export const mockMenus: Menu[] = [
  { id: 1, name: '김치찌개', price: 9000, description: '깊은 맛의 전통 김치찌개', imageUrl: 'https://images.unsplash.com/photo-1583187855209-de1e2ac1a74e?w=400&h=300&fit=crop', categoryId: 1, displayOrder: 1 },
  { id: 2, name: '된장찌개', price: 8500, description: '구수한 된장의 깊은 풍미', imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop', categoryId: 1, displayOrder: 2 },
  { id: 3, name: '불고기', price: 13000, description: '달콤한 양념의 소불고기', imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop', categoryId: 1, displayOrder: 3 },
  { id: 4, name: '비빔밥', price: 10000, description: '신선한 야채와 고추장', imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', categoryId: 1, displayOrder: 4 },
  { id: 5, name: '제육볶음', price: 11000, description: '매콤한 돼지고기 볶음', imageUrl: 'https://images.unsplash.com/photo-1632709810780-b5a4343cebec?w=400&h=300&fit=crop', categoryId: 1, displayOrder: 5 },
  { id: 6, name: '콜라', price: 2000, description: '시원한 탄산음료 355ml', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', categoryId: 2, displayOrder: 1 },
  { id: 7, name: '사이다', price: 2000, description: '청량한 레몬라임 355ml', imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=300&fit=crop', categoryId: 2, displayOrder: 2 },
  { id: 8, name: '생맥주', price: 5000, description: '신선한 생맥주 500ml', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop', categoryId: 2, displayOrder: 3 },
  { id: 9, name: '소주', price: 5000, description: '참이슬 360ml', imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop', categoryId: 2, displayOrder: 4 },
  { id: 10, name: '계란말이', price: 7000, description: '부드러운 계란말이', imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop', categoryId: 3, displayOrder: 1 },
  { id: 11, name: '감자튀김', price: 6000, description: '바삭한 감자튀김', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', categoryId: 3, displayOrder: 2 },
  { id: 12, name: '아이스크림', price: 3000, description: '바닐라 아이스크림', imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop', categoryId: 4, displayOrder: 1 },
];

let orderCounter = 0;
export const mockOrders: Order[] = [
  {
    id: 1, orderNumber: '001',
    items: [{ menuName: '김치찌개', quantity: 2, price: 9000 }, { menuName: '콜라', quantity: 1, price: 2000 }],
    totalAmount: 20000, status: 'PREPARING', createdAt: '2026-05-06T12:30:00',
  },
  {
    id: 2, orderNumber: '002',
    items: [{ menuName: '불고기', quantity: 1, price: 13000 }],
    totalAmount: 13000, status: 'PENDING', createdAt: '2026-05-06T12:45:00',
  },
];

export function createMockOrder(items: { menuId: number; quantity: number }[]) {
  orderCounter++;
  const orderNumber = String(mockOrders.length + orderCounter).padStart(3, '0');
  const orderItems = items.map((item) => {
    const menu = mockMenus.find((m) => m.id === item.menuId)!;
    return { menuName: menu.name, quantity: item.quantity, price: menu.price };
  });
  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order: Order = {
    id: mockOrders.length + orderCounter,
    orderNumber,
    items: orderItems,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  mockOrders.push(order);
  return order;
}
