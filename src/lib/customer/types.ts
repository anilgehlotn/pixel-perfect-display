// Shapes the account pages work with. The server maps Customer Account API (2026-10)
// responses, or mock data in development, to these types.
import type { Money, ShopifyImage } from "@/lib/shopify/types";

export type AccountSession = {
  signedIn: boolean;
  firstName: string | null;
  /** Dev server only: sample data instead of Shopify (see server/env.ts). */
  mock: boolean;
};

export type Address = {
  id: string; // Shopify gid
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zoneCode: string; // Indian state / UT code, e.g. "MH"
  zip: string;
  phoneNumber: string; // E.164, e.g. "+919876543210"
  isDefault: boolean;
};

export type AddressInput = Omit<Address, "id" | "isDefault">;

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  marketingSubscribed: boolean;
};

export type FinancialStatus =
  | "AUTHORIZED"
  | "EXPIRED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "PARTIALLY_REFUNDED"
  | "PENDING"
  | "REFUNDED"
  | "VOIDED";

export type FulfillmentStatus =
  | "FULFILLED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "OPEN"
  | "PARTIALLY_FULFILLED"
  | "PENDING_FULFILLMENT"
  | "RESTOCKED"
  | "SCHEDULED"
  | "UNFULFILLED";

export type OrderLine = {
  id: string;
  title: string;
  variantTitle: string | null;
  variantId: string | null;
  quantity: number;
  image: ShopifyImage | null;
  price: Money | null; // unit price
  totalPrice: Money | null;
};

export type OrderSummary = {
  id: string; // numeric part of the Shopify gid, used in URLs
  name: string; // "#1003"
  processedAt: string; // ISO date
  financialStatus: FinancialStatus | null;
  fulfillmentStatus: FulfillmentStatus;
  cancelled: boolean;
  totalPrice: Money;
  thumbnails: { id: string; title: string; image: ShopifyImage | null }[];
  itemCount: number;
};

export type Tracking = { company: string | null; number: string | null; url: string | null };

export type OrderDetail = OrderSummary & {
  subtotal: Money | null;
  shipping: Money;
  tax: Money | null;
  shippingAddress: Address | null;
  lines: OrderLine[];
  tracking: Tracking[];
  statusPageUrl: string | null;
};

export type OrdersPage = { orders: OrderSummary[]; endCursor: string | null; hasNextPage: boolean };

export type Overview = {
  customer: Customer;
  latestOrder: OrderSummary | null;
  defaultAddress: Address | null;
};

/** Field errors keyed by form field name, plus a general message. */
export type FormErrors = Partial<Record<string, string>> & { form?: string };

export type MutationResult = { ok: true } | { ok: false; errors: FormErrors };
