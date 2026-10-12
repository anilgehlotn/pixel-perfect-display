import type { Cart, CartLine } from "./context";

// Where the cart lives. The provider only talks to this interface, so switching to Shopify
// means writing a shopifyCartStore with the same methods:
//   load   -> read the saved cart id from localStorage, then query `cart(id:)`
//   add    -> `cartCreate` (no cart yet) or `cartLinesAdd`
//   update -> `cartLinesUpdate` (quantity 0 removes the line)
// and its Cart.checkoutUrl is where the Checkout button sends the shopper.
export type CartStore = {
  load: () => Promise<Cart>;
  add: (cart: Cart, merchandise: CartLine["merchandise"], quantity: number) => Promise<Cart>;
  update: (cart: Cart, lineId: string, quantity: number) => Promise<Cart>;
};

const STORAGE_KEY = "skinfusion-cart-v1";
const emptyCart: Cart = { id: null, lines: [], checkoutUrl: null };

function save(cart: Cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.lines));
  } catch {
    // Private mode or storage full: the cart still works for this visit.
  }
}

// Browser-only cart saved in localStorage so it survives a refresh.
export const localCartStore: CartStore = {
  async load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const lines = raw ? (JSON.parse(raw) as CartLine[]) : [];
      return Array.isArray(lines) ? { ...emptyCart, lines } : emptyCart;
    } catch {
      return emptyCart;
    }
  },
  async add(cart, merchandise, quantity) {
    const existing = cart.lines.find((l) => l.merchandise.id === merchandise.id);
    const lines = existing
      ? cart.lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + quantity } : l))
      : [...cart.lines, { id: merchandise.id, quantity, merchandise }];
    const next = { ...cart, lines };
    save(next);
    return next;
  },
  async update(cart, lineId, quantity) {
    const lines =
      quantity <= 0
        ? cart.lines.filter((l) => l.id !== lineId)
        : cart.lines.map((l) => (l.id === lineId ? { ...l, quantity } : l));
    const next = { ...cart, lines };
    save(next);
    return next;
  },
};
