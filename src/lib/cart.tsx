import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  name: string;
  image: string | null;
  packLabel: string;
  unitPrice: number;
  qty: number;
  subscribe: boolean;
};

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItem, opts?: { openDrawer?: boolean }) => void;
  setQty: (key: string, qty: number) => void;
  count: number;
  subtotal: number;
  toast: string | null;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      open,
      setOpen,
      toast,
      add: (item, opts) => {
        setItems((prev) => {
          const ex = prev.find((p) => p.key === item.key);
          if (ex)
            return prev.map((p) => (p.key === item.key ? { ...p, qty: p.qty + item.qty } : p));
          return [...prev, item];
        });
        if (opts?.openDrawer) setOpen(true);
        setToast(`Added to cart: ${item.name}`);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), 2600);
      },
      setQty: (key, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.key !== key)
            : prev.map((p) => (p.key === key ? { ...p, qty } : p)),
        ),
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
    }),
    [items, open, toast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const rs = (n: number) => "Rs. " + Math.round(n).toLocaleString("en-IN");
