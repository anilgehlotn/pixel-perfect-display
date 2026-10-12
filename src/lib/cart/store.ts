import { localProducts } from "@/data/content";
import { storefrontFetch } from "@/lib/shopify/client";
import type { ShopifyImage } from "@/lib/shopify/types";
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

/* ---------------------------------------------------------------------------
   Shopify cart (Storefront API Cart). Used when the VITE_SHOPIFY_* variables are set.
   The cart lives in Shopify; only its id is kept in localStorage. Shopify keeps prices,
   stock and discounts right, and checkoutUrl is its hosted checkout (Razorpay / COD).
--------------------------------------------------------------------------- */

const CART_ID_KEY = "skinfusion-shopify-cart-id";

const SHOPIFY_CART_FIELDS = `
  id checkoutUrl
  lines(first: 100) {
    nodes {
      id quantity
      merchandise {
        ... on ProductVariant {
          id title
          price { amount currencyCode }
          image { url altText width height }
          product { handle title featuredImage { url altText width height } }
        }
      }
    }
  }
`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: CartLine["merchandise"]["price"];
        image: ShopifyImage | null;
        product: { handle: string; title: string; featuredImage: ShopifyImage | null };
      };
    }[];
  };
};

const cartId = {
  get: () => {
    try {
      return localStorage.getItem(CART_ID_KEY);
    } catch {
      return null;
    }
  },
  set: (id: string) => {
    try {
      localStorage.setItem(CART_ID_KEY, id);
    } catch {
      // Private mode: the cart still works for this visit.
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(CART_ID_KEY);
    } catch {
      // ignore
    }
  },
};

// The site's own product photo when Shopify has none yet.
const siteImage = (handle: string) =>
  localProducts.find((p) => p.handle === handle)?.featuredImage ?? null;

function toCart(raw: RawCart): Cart {
  cartId.set(raw.id);
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    lines: raw.lines.nodes.map((l) => ({
      id: l.id,
      quantity: l.quantity,
      merchandise: {
        id: l.merchandise.id,
        title: l.merchandise.title === "Default Title" ? "1 Pouch" : l.merchandise.title,
        price: l.merchandise.price,
        image:
          l.merchandise.image ??
          l.merchandise.product.featuredImage ??
          siteImage(l.merchandise.product.handle),
        product: { handle: l.merchandise.product.handle, title: l.merchandise.product.title },
      },
    })),
  };
}

type UserErrors = { userErrors: { message: string }[] };
function cartFrom<K extends string>(data: Record<K, { cart: RawCart | null } & UserErrors>, key: K) {
  const result = data[key];
  if (result.userErrors.length) throw new Error(result.userErrors.map((e) => e.message).join("; "));
  if (!result.cart) throw new Error("Shopify returned no cart");
  return toCart(result.cart);
}

async function createCart(merchandiseId: string, quantity: number) {
  const data = await storefrontFetch<{ cartCreate: { cart: RawCart | null } & UserErrors }>(
    `mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) { cart { ${SHOPIFY_CART_FIELDS} } userErrors { message } }
    }`,
    { input: { lines: [{ merchandiseId, quantity }] } },
  );
  return cartFrom(data, "cartCreate");
}

function assertShopifyVariant(id: string) {
  if (!id.startsWith("gid://shopify/ProductVariant/"))
    throw new Error(`Not a Shopify variant: ${id}`);
}

export const shopifyCartStore: CartStore = {
  async load() {
    const id = cartId.get();
    if (!id) return emptyCart;
    try {
      const data = await storefrontFetch<{ cart: RawCart | null }>(
        `query Cart($id: ID!) { cart(id: $id) { ${SHOPIFY_CART_FIELDS} } }`,
        { id },
      );
      // null: the cart expired or was turned into an order. Start fresh next time.
      if (!data.cart) {
        cartId.clear();
        return emptyCart;
      }
      return toCart(data.cart);
    } catch {
      return emptyCart;
    }
  },
  async add(cart, merchandise, quantity) {
    assertShopifyVariant(merchandise.id);
    if (!cart.id) return createCart(merchandise.id, quantity);
    try {
      const data = await storefrontFetch<{ cartLinesAdd: { cart: RawCart | null } & UserErrors }>(
        `mutation CartLinesAdd($id: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $id, lines: $lines) { cart { ${SHOPIFY_CART_FIELDS} } userErrors { message } }
        }`,
        { id: cart.id, lines: [{ merchandiseId: merchandise.id, quantity }] },
      );
      return cartFrom(data, "cartLinesAdd");
    } catch {
      // The saved cart expired or was already checked out: start a new one.
      cartId.clear();
      return createCart(merchandise.id, quantity);
    }
  },
  async update(cart, lineId, quantity) {
    if (!cart.id) return cart;
    if (quantity <= 0) {
      const data = await storefrontFetch<{ cartLinesRemove: { cart: RawCart | null } & UserErrors }>(
        `mutation CartLinesRemove($id: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ${SHOPIFY_CART_FIELDS} } userErrors { message } }
        }`,
        { id: cart.id, lineIds: [lineId] },
      );
      return cartFrom(data, "cartLinesRemove");
    }
    const data = await storefrontFetch<{ cartLinesUpdate: { cart: RawCart | null } & UserErrors }>(
      `mutation CartLinesUpdate($id: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${SHOPIFY_CART_FIELDS} } userErrors { message } }
      }`,
      { id: cart.id, lines: [{ id: lineId, quantity }] },
    );
    return cartFrom(data, "cartLinesUpdate");
  },
};
