// Dev-server-only sample data (see isMockMode). Lives in memory for the life of the dev
// server, so adding or editing addresses persists across page loads while you design.
import { FEATURED_PRODUCT_HANDLE, localProducts } from "@/data/content";
import type {
  Address,
  AddressInput,
  Customer,
  MutationResult,
  OrderDetail,
  OrdersPage,
  Overview,
} from "../types";

const inr = (amount: number) => ({ amount: amount.toFixed(2), currencyCode: "INR" });
const tea = localProducts.find((p) => p.handle === FEATURED_PRODUCT_HANDLE) ?? localProducts[0]!;
const pouch = tea.featuredImage;

const state: { customer: Customer; addresses: Address[]; nextId: number } = {
  customer: {
    firstName: "Ananya",
    lastName: "Rao",
    email: "ananya.rao@example.com",
    marketingSubscribed: true,
  },
  addresses: [
    {
      id: "gid://shopify/CustomerAddress/9001",
      firstName: "Ananya",
      lastName: "Rao",
      address1: "Flat 402, Sea Breeze Apartments, Carter Road",
      address2: "Bandra West",
      city: "Mumbai",
      zoneCode: "MH",
      zip: "400050",
      phoneNumber: "+919876543210",
      isDefault: true,
    },
    {
      id: "gid://shopify/CustomerAddress/9002",
      firstName: "Ananya",
      lastName: "Rao",
      address1: "12, 4th Cross, Indiranagar",
      address2: "",
      city: "Bengaluru",
      zoneCode: "KA",
      zip: "560038",
      phoneNumber: "+919845012345",
      isDefault: false,
    },
  ],
  nextId: 9003,
};

const v = (i: number) => tea.variants[i] ?? tea.variants[0]!;

function makeOrder(n: number): OrderDetail {
  // Newest first: order n has number 1000 + n.
  const variant = v(n % 3);
  const qty = (n % 2) + 1;
  const unit = Number(variant.price.amount);
  const lines = [
    {
      id: `gid://shopify/LineItem/${n}1`,
      title: tea.title,
      variantTitle: variant.title,
      variantId: variant.id,
      quantity: qty,
      image: pouch,
      price: inr(unit),
      totalPrice: inr(unit * qty),
    },
    ...(n % 3 === 0
      ? [
          {
            id: `gid://shopify/LineItem/${n}2`,
            title: "Calm Night Blend",
            variantTitle: "1 Pouch",
            variantId: "local-variant:calm-night:1",
            quantity: 1,
            image: null,
            price: inr(599),
            totalPrice: inr(599),
          },
        ]
      : []),
  ];
  const subtotal = lines.reduce((s, l) => s + Number(l.totalPrice.amount), 0);
  const shipping = subtotal >= 699 ? 0 : 60;
  const statuses = [
    { f: "FULFILLED", p: "PAID" },
    { f: "IN_PROGRESS", p: "PAID" },
    { f: "UNFULFILLED", p: "PENDING" },
    { f: "FULFILLED", p: "PARTIALLY_REFUNDED" },
  ] as const;
  const st = statuses[n % statuses.length]!;
  const date = new Date(Date.UTC(2026, 9, 6) - n * 9 * 86400000);
  return {
    id: String(5000 + n),
    name: `#${1000 + n}`,
    processedAt: date.toISOString(),
    financialStatus: st.p,
    fulfillmentStatus: st.f,
    cancelled: false,
    totalPrice: inr(subtotal + shipping),
    thumbnails: lines.map((l) => ({ id: l.id, title: l.title, image: l.image })),
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: inr(subtotal),
    shipping: inr(shipping),
    tax: inr(0),
    shippingAddress: state.addresses[0] ?? null,
    lines,
    tracking:
      st.f === "FULFILLED"
        ? [{ company: "Delhivery", number: `DLV${700000 + n}`, url: "https://www.delhivery.com/" }]
        : [],
    statusPageUrl: null,
  };
}

const ordersFor = (count: number) => Array.from({ length: count }, (_, i) => makeOrder(count - i)); // newest first

export const mock = {
  overview(count: number): Overview {
    const orders = ordersFor(count);
    return {
      customer: { ...state.customer },
      latestOrder: orders[0] ?? null,
      defaultAddress: state.addresses.find((a) => a.isDefault) ?? null,
    };
  },
  customer: (): Customer => ({ ...state.customer }),
  orders(count: number, after: string | null, first = 10): OrdersPage {
    const all = ordersFor(count);
    const start = after ? Number(after) : 0;
    const page = all.slice(start, start + first);
    const next = start + first;
    return {
      orders: page,
      hasNextPage: next < all.length,
      endCursor: next < all.length ? String(next) : null,
    };
  },
  order: (count: number, id: string) => ordersFor(count).find((o) => o.id === id) ?? null,
  addresses: () => state.addresses.map((a) => ({ ...a })),
  saveAddress(id: string | null, input: AddressInput, makeDefault: boolean): MutationResult {
    if (input.zip === "000000") return { ok: false, errors: { zip: "This PIN code isn't valid." } };
    const existing = id ? state.addresses.find((a) => a.id === id) : null;
    if (id && !existing) return { ok: false, errors: { form: "This address no longer exists." } };
    const first = state.addresses.length === 0;
    const saved: Address = {
      ...input,
      id: existing?.id ?? `gid://shopify/CustomerAddress/${state.nextId++}`,
      isDefault: existing?.isDefault ?? first,
    };
    state.addresses = existing
      ? state.addresses.map((a) => (a.id === saved.id ? saved : a))
      : [...state.addresses, saved];
    if (makeDefault) mock.setDefault(saved.id);
    return { ok: true };
  },
  setDefault(id: string): MutationResult {
    if (!state.addresses.some((a) => a.id === id))
      return { ok: false, errors: { form: "Address not found." } };
    state.addresses = state.addresses
      .map((a) => ({ ...a, isDefault: a.id === id }))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return { ok: true };
  },
  deleteAddress(id: string): MutationResult {
    const target = state.addresses.find((a) => a.id === id);
    if (!target) return { ok: false, errors: { form: "Address not found." } };
    state.addresses = state.addresses.filter((a) => a.id !== id);
    if (target.isDefault && state.addresses[0]) state.addresses[0].isDefault = true;
    return { ok: true };
  },
  updateDetails(
    input: { firstName: string; lastName: string },
    marketing: boolean,
  ): MutationResult {
    state.customer = { ...state.customer, ...input, marketingSubscribed: marketing };
    return { ok: true };
  },
};
