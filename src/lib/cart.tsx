import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartProduct = {
  id: string;
  name: string;
  team: string;
  season: string;
  kit: string;
  price: number;
  image_url: string | null;
};

export type CartItem = { product: CartProduct; size: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: CartProduct, size: string) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("bearkits-cart") : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("bearkits-cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const add: CartCtx["add"] = (p, size) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.product.id === p.id && it.size === size);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...prev, { product: p, size, qty: 1 }];
    });
    setOpen(true);
  };
  const remove: CartCtx["remove"] = (id, size) =>
    setItems((p) => p.filter((it) => !(it.product.id === id && it.size === size)));
  const setQty: CartCtx["setQty"] = (id, size, qty) =>
    setItems((p) => p.map((it) => (it.product.id === id && it.size === size ? { ...it, qty: Math.max(1, qty) } : it)));
  const clear = () => setItems([]);

  const { total, count } = useMemo(() => ({
    total: items.reduce((s, it) => s + it.product.price * it.qty, 0),
    count: items.reduce((s, it) => s + it.qty, 0),
  }), [items]);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
