import { createContext, useContext } from "react";
import type { Money, Product, ProductVariant, ShopifyImage } from "@/lib/shopify/types";

// Cart shapes mirror the Shopify Cart API (Cart, CartLine, merchandise) so the local store
// and a future Shopify store return the same thing.
export type CartLine = {
  id: string; // local: variant id. Shopify: "gid://shopify/CartLine/..."
  quantity: number;
  merchandise: {
    id: string; // variant id, what Shopify's cartLinesAdd expects as merchandiseId
    title: string; // variant title, e.g. "2 Pouches"
    price: Money;
    image: ShopifyImage | null;
    product: { handle: string; title: string };
  };
};

export type Cart = {
  id: string | null; // Shopify cart id, null for the local cart
  lines: CartLine[];
  checkoutUrl: string | null; // Shopify hosted checkout, null for the local cart
};

export type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  checkoutUrl: string | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
    opts?: { openDrawer?: boolean },
  ) => void;
  setQty: (lineId: string, quantity: number) => void;
  toast: string | null;
};

export const CartContext = createContext<CartCtx | null>(null);

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
