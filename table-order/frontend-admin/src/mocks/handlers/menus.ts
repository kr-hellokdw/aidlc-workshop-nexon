import { http, HttpResponse } from 'msw';
import { mockMenus, mockCategories } from '../data';

let menus = [...mockMenus];
let categories = [...mockCategories];
let nextMenuId = menus.length + 1;
let nextCatId = categories.length + 1;

export const menuHandlers = [
  http.get('/api/stores/:storeId/menus', () => {
    return HttpResponse.json({
      success: true,
      data: menus,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post('/api/admin/menus', async ({ request }) => {
    const formData = await request.formData();
    const newMenu = {
      menuId: nextMenuId++,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      description: (formData.get('description') as string) || '',
      imageUrl: '',
      categoryId: Number(formData.get('categoryId')),
      categoryName: categories.find((c) => c.categoryId === Number(formData.get('categoryId')))?.name || '',
      displayOrder: menus.length,
    };
    menus.push(newMenu);
    return HttpResponse.json({
      success: true,
      data: newMenu,
      timestamp: new Date().toISOString(),
    });
  }),

  http.put('/api/admin/menus/:menuId', async ({ params, request }) => {
    const menuId = Number(params.menuId);
    const formData = await request.formData();
    menus = menus.map((m) => {
      if (m.menuId !== menuId) return m;
      return {
        ...m,
        name: (formData.get('name') as string) || m.name,
        price: formData.get('price') ? Number(formData.get('price')) : m.price,
        description: (formData.get('description') as string) ?? m.description,
        categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : m.categoryId,
      };
    });
    return HttpResponse.json({
      success: true,
      data: menus.find((m) => m.menuId === menuId),
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete('/api/admin/menus/:menuId', ({ params }) => {
    menus = menus.filter((m) => m.menuId !== Number(params.menuId));
    return HttpResponse.json({ success: true, data: null, timestamp: new Date().toISOString() });
  }),

  http.put('/api/admin/menus/order', () => {
    return HttpResponse.json({ success: true, data: null, timestamp: new Date().toISOString() });
  }),

  http.get('/api/stores/:storeId/categories', () => {
    return HttpResponse.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    });
  }),

  http.post('/api/admin/categories', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    const newCat = {
      categoryId: nextCatId++,
      name: body.name,
      displayOrder: categories.length,
      menuCount: 0,
    };
    categories.push(newCat);
    return HttpResponse.json({
      success: true,
      data: newCat,
      timestamp: new Date().toISOString(),
    });
  }),

  http.put('/api/admin/categories/:categoryId', async ({ params, request }) => {
    const categoryId = Number(params.categoryId);
    const body = (await request.json()) as { name: string };
    categories = categories.map((c) =>
      c.categoryId === categoryId ? { ...c, name: body.name } : c,
    );
    return HttpResponse.json({
      success: true,
      data: categories.find((c) => c.categoryId === categoryId),
      timestamp: new Date().toISOString(),
    });
  }),

  http.delete('/api/admin/categories/:categoryId', ({ params }) => {
    const categoryId = Number(params.categoryId);
    const cat = categories.find((c) => c.categoryId === categoryId);
    if (cat && cat.menuCount > 0) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'CONFLICT', message: '메뉴가 있는 카테고리는 삭제할 수 없습니다' },
          timestamp: new Date().toISOString(),
        },
        { status: 409 },
      );
    }
    categories = categories.filter((c) => c.categoryId !== categoryId);
    return HttpResponse.json({ success: true, data: null, timestamp: new Date().toISOString() });
  }),
];
