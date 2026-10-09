import { createContext, useContext } from "react";

export type CartItem = {
  key: string;
  name: string;
  image: string | null;
  packLabel: string;
  unitPrice: number;
  qty: number;
  subscribe: boolean;
};

export type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItem, opts?: { openDrawer?: boolean }) => void;
  setQty: (key: string, qty: number) => void;
  count: number;
  subtotal: number;
  toast: string | null;
};

export const CartContext = createContext<CartCtx | null>(null);

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
