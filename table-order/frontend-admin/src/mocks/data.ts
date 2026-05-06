import { TableDashboardItem } from '@/features/dashboard/types';

export const mockDashboardData: TableDashboardItem[] = [
  {
    tableId: 1,
    tableNumber: 1,
    sessionStatus: 'ACTIVE',
    totalAmount: 45000,
    orders: [
      {
        orderId: 1,
        orderNumber: '001',
        items: [
          { menuName: '김치찌개', quantity: 2, price: 9000 },
          { menuName: '콜라', quantity: 1, price: 2000 },
        ],
        totalAmount: 20000,
        status: 'PENDING',
        createdAt: '2026-05-06T12:30:00',
      },
      {
        orderId: 2,
        orderNumber: '002',
        items: [{ menuName: '된장찌개', quantity: 1, price: 9000 }],
        totalAmount: 9000,
        status: 'PREPARING',
        createdAt: '2026-05-06T12:45:00',
      },
    ],
  },
  {
    tableId: 2,
    tableNumber: 2,
    sessionStatus: 'EMPTY',
    totalAmount: 0,
    orders: [],
  },
  {
    tableId: 3,
    tableNumber: 3,
    sessionStatus: 'ACTIVE',
    totalAmount: 12000,
    orders: [
      {
        orderId: 3,
        orderNumber: '003',
        items: [{ menuName: '비빔밥', quantity: 1, price: 8000 }],
        totalAmount: 8000,
        status: 'COMPLETED',
        createdAt: '2026-05-06T11:00:00',
      },
    ],
  },
  {
    tableId: 4,
    tableNumber: 4,
    sessionStatus: 'ACTIVE',
    totalAmount: 28000,
    orders: [
      {
        orderId: 4,
        orderNumber: '004',
        items: [
          { menuName: '불고기', quantity: 2, price: 12000 },
          { menuName: '공기밥', quantity: 2, price: 1000 },
        ],
        totalAmount: 26000,
        status: 'PENDING',
        createdAt: '2026-05-06T13:00:00',
      },
    ],
  },
  {
    tableId: 5,
    tableNumber: 5,
    sessionStatus: 'ACTIVE',
    totalAmount: 8000,
    orders: [
      {
        orderId: 5,
        orderNumber: '005',
        items: [{ menuName: '비빔밥', quantity: 1, price: 8000 }],
        totalAmount: 8000,
        status: 'PREPARING',
        createdAt: '2026-05-06T13:15:00',
      },
    ],
  },
  {
    tableId: 6,
    tableNumber: 6,
    sessionStatus: 'EMPTY',
    totalAmount: 0,
    orders: [],
  },
];

export const mockTables = [
  { tableId: 1, tableNumber: 1, sessionStatus: 'ACTIVE' as const, createdAt: '2026-05-01T09:00:00' },
  { tableId: 2, tableNumber: 2, sessionStatus: 'EMPTY' as const, createdAt: '2026-05-01T09:00:00' },
  { tableId: 3, tableNumber: 3, sessionStatus: 'ACTIVE' as const, createdAt: '2026-05-01T09:00:00' },
  { tableId: 4, tableNumber: 4, sessionStatus: 'ACTIVE' as const, createdAt: '2026-05-01T09:00:00' },
  { tableId: 5, tableNumber: 5, sessionStatus: 'ACTIVE' as const, createdAt: '2026-05-01T09:00:00' },
  { tableId: 6, tableNumber: 6, sessionStatus: 'EMPTY' as const, createdAt: '2026-05-01T09:00:00' },
];

export const mockCategories = [
  { categoryId: 1, name: '한식', displayOrder: 0, menuCount: 4 },
  { categoryId: 2, name: '음료', displayOrder: 1, menuCount: 3 },
  { categoryId: 3, name: '디저트', displayOrder: 2, menuCount: 2 },
];

export const mockMenus = [
  { menuId: 1, name: '김치찌개', price: 9000, description: '돼지고기와 신김치로 끓인 얼큰한 찌개', imageUrl: null, categoryId: 1, categoryName: '한식', displayOrder: 0 },
  { menuId: 2, name: '된장찌개', price: 9000, description: '구수한 된장찌개', imageUrl: null, categoryId: 1, categoryName: '한식', displayOrder: 1 },
  { menuId: 3, name: '비빔밥', price: 8000, description: '신선한 야채와 고추장 비빔밥', imageUrl: null, categoryId: 1, categoryName: '한식', displayOrder: 2 },
  { menuId: 4, name: '불고기', price: 12000, description: '달콤한 양념 불고기', imageUrl: null, categoryId: 1, categoryName: '한식', displayOrder: 3 },
  { menuId: 5, name: '콜라', price: 2000, description: '', imageUrl: null, categoryId: 2, categoryName: '음료', displayOrder: 0 },
  { menuId: 6, name: '사이다', price: 2000, description: '', imageUrl: null, categoryId: 2, categoryName: '음료', displayOrder: 1 },
  { menuId: 7, name: '아이스티', price: 3000, description: '복숭아 아이스티', imageUrl: null, categoryId: 2, categoryName: '음료', displayOrder: 2 },
  { menuId: 8, name: '아이스크림', price: 4000, description: '바닐라 아이스크림', imageUrl: null, categoryId: 3, categoryName: '디저트', displayOrder: 0 },
  { menuId: 9, name: '떡', price: 5000, description: '찰떡', imageUrl: null, categoryId: 3, categoryName: '디저트', displayOrder: 1 },
];
