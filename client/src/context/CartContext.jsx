import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'lch_cart_v1';

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: the cart still works for this visit */
    }
  }, [items]);

  const add = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i));
      }
      return [
        ...prev,
        { id: item.id, name: item.name, price: item.price, image: item.image, category: item.category, quantity: qty },
      ];
    });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, quantity) } : i))
    );
  }, []);

  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  /** Refresh prices/names from the live menu and drop items that were deleted. */
  const syncWithMenu = useCallback((menu) => {
    const byId = new Map(menu.map((m) => [m.id, m]));
    setItems((prev) => {
      const next = prev
        .filter((i) => byId.has(i.id))
        .map((i) => {
          const m = byId.get(i.id);
          return { ...i, name: m.name, price: m.price, image: m.image, category: m.category };
        });
      const same = next.length === prev.length && next.every((n, idx) => JSON.stringify(n) === JSON.stringify(prev[idx]));
      return same ? prev : next;
    });
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100;
    return { items, count, total, add, setQuantity, remove, clear, syncWithMenu };
  }, [items, add, setQuantity, remove, clear, syncWithMenu]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
