import { createContext, useContext } from "react";
import type { Money, Product, ProductVariant, ProductPhoto } from "@/lib/catalog/types";

// Cart shapes shared by the cart store, the provider and the cart drawer.
export type CartLine = {
  id: string; // the variant id
  quantity: number;
  merchandise: {
    id: string; // variant id
    title: string; // variant title, e.g. "2 Pouches"
    price: Money;
    image: ProductPhoto | null;
    product: { handle: string; title: string };
  };
};

export type Cart = {
  id: string | null; // null for the browser cart
  lines: CartLine[];
};

export type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
    opts?: { openDrawer?: boolean },
  ) => void;
  setQty: (lineId: string, quantity: number) => void;
  /** Empties the cart (after a successful payment). */
  clear: () => void;
  toast: string | null;
};

export const CartContext = createContext<CartCtx | null>(null);

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
