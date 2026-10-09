import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { money } from "@/lib/shopify/types";
import { CartContext, type Cart, type CartCtx } from "./context";
import { localCartStore } from "./store";

const store = localCartStore;

export function CartProvider({ children }: { children: ReactNode }) {
  // Starts empty on the server and first client render, then loads the saved cart after
  // hydration so server and client HTML match.
  const [cart, setCart] = useState<Cart>({ id: null, lines: [], checkoutUrl: null });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Operations run one after another so each sees the cart the previous one produced.
  const queue = useRef<Promise<Cart> | null>(null);

  const run = (op: (current: Cart) => Promise<Cart>) => {
    const prev = queue.current ?? Promise.resolve(cart);
    const next = prev.then(op).catch((error: unknown) => {
      console.error(error);
      return prev;
    });
    queue.current = next;
    void next.then(setCart);
  };

  useEffect(() => {
    queue.current = store.load();
    void queue.current.then(setCart);
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      lines: cart.lines,
      count: cart.lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: cart.lines.reduce((s, l) => s + l.quantity * money(l.merchandise.price), 0),
      checkoutUrl: cart.checkoutUrl,
      open,
      setOpen,
      toast,
      add: (product, variant, quantity = 1, opts) => {
        run((c) =>
          store.add(
            c,
            {
              id: variant.id,
              title: variant.title,
              price: variant.price,
              image: product.featuredImage,
              product: { handle: product.handle, title: product.title },
            },
            quantity,
          ),
        );
        if (opts?.openDrawer) setOpen(true);
        setToast(`Added to cart: ${product.title}`);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), 2600);
      },
      addLines: (lines, opts) => {
        if (!lines.length) return;
        run(async (c) => {
          let next = c;
          for (const l of lines) next = await store.add(next, l.merchandise, l.quantity);
          return next;
        });
        if (opts?.openDrawer) setOpen(true);
        const count = lines.reduce((n, l) => n + l.quantity, 0);
        setToast(`Added ${count} ${count === 1 ? "item" : "items"} to your cart`);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), 2600);
      },
      setQty: (lineId, quantity) => run((c) => store.update(c, lineId, quantity)),
    }),
    // run reads refs only; cart is listed so the memo stays in step with renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, open, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
