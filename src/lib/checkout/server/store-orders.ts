import { storeConfig } from "./env";
import type { CheckoutForm } from "../types";
import type { PricedCart } from "../pricing";

// The store backend's Admin GraphQL API: finds pack ids, checks for an existing order and
// creates the paid order (stock, order list and shipping are managed in the store admin).
// Server-only. The admin token needs the write_orders and read_products scopes.
// Verify on a test order before launch: the field names follow the 2026 order-create input.

type GqlError = { message: string };

async function admin<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const { domain, token, apiVersion } = storeConfig();
  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`[orders] store API ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: GqlError[] };
  if (json.errors?.length || !json.data)
    throw new Error(`[orders] ${json.errors?.map((e) => e.message).join("; ") ?? "no data"}`);
  return json.data;
}

/** Finds the store's id for a pack by product handle and pack title ("4 Pouches"). */
async function variantId(handle: string, variantTitle: string): Promise<string> {
  const data = await admin<{
    products: { nodes: { variants: { nodes: { id: string; title: string }[] } }[] };
  }>(
    `query Pack($q: String!) {
      products(first: 1, query: $q) { nodes { variants(first: 50) { nodes { id title } } } }
    }`,
    { q: `handle:${handle}` },
  );
  const variants = data.products.nodes[0]?.variants.nodes ?? [];
  // A product with one pack has a single variant whatever its title.
  const match =
    variants.find((v) => v.title.toLowerCase() === variantTitle.toLowerCase()) ??
    (variants.length === 1 ? variants[0] : undefined);
  if (!match) throw new Error(`[orders] no store variant for ${handle} / ${variantTitle}`);
  return match.id;
}

const tagFor = (paymentOrderId: string) => `rzp-${paymentOrderId}`;

/** An order already created for this payment (by the confirm call or the webhook). */
export async function findOrder(paymentOrderId: string): Promise<{ name: string } | null> {
  const data = await admin<{ orders: { nodes: { name: string }[] } }>(
    `query Existing($q: String!) { orders(first: 1, query: $q) { nodes { name } } }`,
    { q: `tag:"${tagFor(paymentOrderId)}"` },
  );
  return data.orders.nodes[0] ?? null;
}

const inr = (amount: number) => ({ shopMoney: { amount: amount.toFixed(2), currencyCode: "INR" } });

/** Creates the paid order. Returns the store's order name, e.g. "#1001". */
export async function createPaidOrder(args: {
  form: CheckoutForm;
  cart: PricedCart;
  paymentOrderId: string;
  paymentId: string;
  /** Amount actually paid, in rupees. */
  paid: number;
  method?: string | undefined;
}): Promise<string> {
  const { form, cart, paymentOrderId, paymentId } = args;
  const [firstName = "", ...rest] = form.name.split(/\s+/);
  const lastName = rest.join(" ") || firstName;
  const phone = `+91${form.phone}`;
  const address = {
    firstName,
    lastName,
    address1: form.address1,
    address2: form.address2 || null,
    city: form.city,
    provinceCode: form.state,
    countryCode: "IN",
    zip: form.pin,
    phone,
  };
  const lineItems = await Promise.all(
    cart.lines.map(async (l) => ({
      variantId: await variantId(l.handle, l.variantTitle),
      quantity: l.quantity,
      priceSet: inr(l.unitPrice),
    })),
  );
  const data = await admin<{
    orderCreate: {
      order: { name: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(
    `mutation Create($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
      orderCreate(order: $order, options: $options) {
        order { name }
        userErrors { field message }
      }
    }`,
    {
      order: {
        currency: "INR",
        email: form.email,
        phone,
        customer: { toUpsert: { email: form.email, firstName, lastName, phone } },
        lineItems,
        shippingAddress: address,
        billingAddress: address,
        shippingLines: [{ title: "Standard delivery", priceSet: inr(cart.shipping) }],
        financialStatus: "PAID",
        transactions: [
          {
            kind: "SALE",
            status: "SUCCESS",
            gateway: "Razorpay",
            authorizationCode: paymentId,
            amountSet: inr(args.paid),
          },
        ],
        tags: ["website", tagFor(paymentOrderId)],
        note: `Paid online. Razorpay payment ${paymentId}${args.method ? ` (${args.method})` : ""}, order ${paymentOrderId}.`,
      },
      options: { sendReceipt: true, inventoryBehaviour: "DECREMENT_OBEYING_POLICY" },
    },
  );
  const { order, userErrors } = data.orderCreate;
  if (!order) throw new Error(`[orders] ${userErrors.map((e) => e.message).join("; ")}`);
  return order.name;
}
