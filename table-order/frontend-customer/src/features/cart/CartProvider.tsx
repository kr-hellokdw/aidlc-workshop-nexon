import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { CartItem, Menu } from '../../common/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menu: Menu; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { menuId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { menuId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  addItem: (menu: Menu, quantity: number) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menu, quantity } = action.payload;
      const existing = state.items.find((item) => item.menuId === menu.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.menuId === menu.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            menuId: menu.id,
            menuName: menu.name,
            price: menu.price,
            quantity,
            imageUrl: menu.imageUrl,
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((item) => item.menuId !== action.payload.menuId) };
    case 'UPDATE_QUANTITY': {
      const { menuId, quantity } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.menuId !== menuId) };
      }
      return {
        items: state.items.map((item) =>
          item.menuId === menuId ? { ...item, quantity: Math.min(quantity, 99) } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'LOAD_CART':
      return { items: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (menu: Menu, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { menu, quantity } });
  };

  const removeItem = (menuId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { menuId } });
  };

  const updateQuantity = (menuId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalAmount, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}
