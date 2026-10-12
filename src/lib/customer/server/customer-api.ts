// Customer Account API (2026-10) GraphQL client and the queries the account pages use.
// The customer is always identified by the access token from the httpOnly cookie, never by
// an ID sent from the browser.
import type { Money, ShopifyImage } from "@/lib/shopify/types";
import type {
  Address,
  AddressInput,
  Customer,
  FinancialStatus,
  FormErrors,
  FulfillmentStatus,
  MutationResult,
  OrderDetail,
  OrderLine,
  OrderSummary,
  OrdersPage,
  Overview,
} from "../types";
import { customerAccountConfig } from "./env";
import { discover } from "./oauth";

export class CustomerApiError extends Error {}
export class UnauthorizedError extends Error {}

async function gql<T>(token: string, query: string, variables: Record<string, unknown> = {}) {
  const { api } = await discover();
  const res = await fetch(api.graphql_api, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: token,
      "user-agent": "SkinFusion Storefront (+customer-accounts)",
      origin: new URL(customerAccountConfig().appBaseUrl).origin,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 401) throw new UnauthorizedError("Customer session expired");
  if (!res.ok) throw new CustomerApiError(`Customer Account API ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new CustomerApiError(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new CustomerApiError("Customer Account API returned no data");
  return json.data;
}

const ADDRESS = `fragment Address on CustomerAddress {
  id firstName lastName address1 address2 city zoneCode zip phoneNumber
}`;
const ORDER_SUMMARY = `fragment OrderSummary on Order {
  id name processedAt financialStatus fulfillmentStatus cancelledAt
  totalPrice { amount currencyCode }
  lineItems(first: 4) { nodes { id title quantity image { url altText width height } } }
}`;

type RawImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
} | null;
type RawAddress = Omit<Address, "isDefault"> & { [k: string]: unknown };
type RawSummary = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: FinancialStatus | null;
  fulfillmentStatus: FulfillmentStatus;
  cancelledAt: string | null;
  totalPrice: Money;
  lineItems: { nodes: { id: string; title: string; quantity: number; image: RawImage }[] };
};

const image = (i: RawImage): ShopifyImage | null =>
  i ? { url: i.url, altText: i.altText, width: i.width ?? 800, height: i.height ?? 800 } : null;

const address = (a: RawAddress | null, defaultId?: string | null): Address | null =>
  a
    ? {
        id: a.id,
        firstName: a.firstName ?? "",
        lastName: a.lastName ?? "",
        address1: a.address1 ?? "",
        address2: a.address2 ?? "",
        city: a.city ?? "",
        zoneCode: a.zoneCode ?? "",
        zip: a.zip ?? "",
        phoneNumber: a.phoneNumber ?? "",
        isDefault: a.id === defaultId,
      }
    : null;

const numericId = (gid: string) => gid.split("/").pop()?.split("?")[0] ?? gid;

const summary = (o: RawSummary): OrderSummary => ({
  id: numericId(o.id),
  name: o.name,
  processedAt: o.processedAt,
  financialStatus: o.financialStatus,
  fulfillmentStatus: o.fulfillmentStatus,
  cancelled: Boolean(o.cancelledAt),
  totalPrice: o.totalPrice,
  thumbnails: o.lineItems.nodes.map((l) => ({ id: l.id, title: l.title, image: image(l.image) })),
  itemCount: o.lineItems.nodes.reduce((n, l) => n + l.quantity, 0),
});

const userErrors = (
  errs: { field: string[] | null; message: string }[] | undefined,
): FormErrors | null => {
  if (!errs?.length) return null;
  const out: FormErrors = {};
  for (const e of errs) {
    const field = e.field?.at(-1);
    const key =
      field === "phoneNumber"
        ? "phone"
        : field === "zip"
          ? "zip"
          : field === "zoneCode"
            ? "zoneCode"
            : field;
    if (
      key &&
      ["phone", "zip", "zoneCode", "address1", "city", "firstName", "lastName"].includes(key)
    )
      out[key] = e.message;
    else out.form = e.message;
  }
  return out;
};

export async function getCustomerBasics(token: string) {
  const data = await gql<{ customer: { firstName: string | null } }>(
    token,
    `query FirstName { customer { firstName } }`,
  );
  return { firstName: data.customer.firstName };
}

type RawCustomer = {
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string | null; marketingState: string } | null;
};
const customer = (c: RawCustomer): Customer => ({
  firstName: c.firstName ?? "",
  lastName: c.lastName ?? "",
  email: c.emailAddress?.emailAddress ?? "",
  marketingSubscribed: ["SUBSCRIBED", "PENDING"].includes(c.emailAddress?.marketingState ?? ""),
});

export async function getOverview(token: string): Promise<Overview> {
  const data = await gql<{
    customer: RawCustomer & { defaultAddress: RawAddress | null; orders: { nodes: RawSummary[] } };
  }>(
    token,
    `${ADDRESS} ${ORDER_SUMMARY}
    query Overview {
      customer {
        firstName lastName emailAddress { emailAddress marketingState }
        defaultAddress { ...Address }
        orders(first: 1, sortKey: PROCESSED_AT, reverse: true) { nodes { ...OrderSummary } }
      }
    }`,
  );
  const c = data.customer;
  return {
    customer: customer(c),
    latestOrder: c.orders.nodes[0] ? summary(c.orders.nodes[0]) : null,
    defaultAddress: address(c.defaultAddress, c.defaultAddress?.id),
  };
}

export async function getCustomer(token: string): Promise<Customer> {
  const data = await gql<{ customer: RawCustomer }>(
    token,
    `query Details { customer { firstName lastName emailAddress { emailAddress marketingState } } }`,
  );
  return customer(data.customer);
}

export async function getOrders(
  token: string,
  after: string | null,
  first = 10,
): Promise<OrdersPage> {
  const data = await gql<{
    customer: {
      orders: { nodes: RawSummary[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
    };
  }>(
    token,
    `${ORDER_SUMMARY}
    query Orders($first: Int!, $after: String) {
      customer {
        orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
          nodes { ...OrderSummary }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`,
    { first, after },
  );
  const o = data.customer.orders;
  return {
    orders: o.nodes.map(summary),
    hasNextPage: o.pageInfo.hasNextPage,
    endCursor: o.pageInfo.endCursor,
  };
}

export async function getOrder(token: string, id: string): Promise<OrderDetail | null> {
  type RawLine = {
    id: string;
    title: string;
    variantTitle: string | null;
    variantId: string | null;
    quantity: number;
    image: RawImage;
    price: Money | null;
    totalPrice: Money | null;
  };
  const data = await gql<{
    order:
      | (RawSummary & {
          statusPageUrl: string | null;
          subtotal: Money | null;
          totalShipping: Money;
          totalTax: Money | null;
          shippingAddress: RawAddress | null;
          lines: { nodes: RawLine[] };
          fulfillments: {
            nodes: {
              trackingInformation: {
                company: string | null;
                number: string | null;
                url: string | null;
              }[];
            }[];
          };
        })
      | null;
  }>(
    token,
    `${ADDRESS} ${ORDER_SUMMARY}
    query Order($id: ID!) {
      order(id: $id) {
        ...OrderSummary
        statusPageUrl
        subtotal { amount currencyCode }
        totalShipping { amount currencyCode }
        totalTax { amount currencyCode }
        shippingAddress { ...Address }
        lines: lineItems(first: 50) {
          nodes {
            id title variantTitle variantId quantity
            image { url altText width height }
            price { amount currencyCode }
            totalPrice { amount currencyCode }
          }
        }
        fulfillments(first: 10) { nodes { trackingInformation { company number url } } }
      }
    }`,
    { id: `gid://shopify/Order/${id}` },
  );
  const o = data.order;
  if (!o) return null;
  const lines: OrderLine[] = o.lines.nodes.map((l) => ({ ...l, image: image(l.image) }));
  return {
    ...summary(o),
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    statusPageUrl: o.statusPageUrl,
    subtotal: o.subtotal,
    shipping: o.totalShipping,
    tax: o.totalTax,
    shippingAddress: address(o.shippingAddress),
    lines,
    tracking: o.fulfillments.nodes.flatMap((f) => f.trackingInformation),
  };
}

export async function getAddresses(token: string): Promise<Address[]> {
  const data = await gql<{
    customer: { defaultAddress: { id: string } | null; addresses: { nodes: RawAddress[] } };
  }>(
    token,
    `${ADDRESS}
    query Addresses { customer { defaultAddress { id } addresses(first: 50) { nodes { ...Address } } } }`,
  );
  const def = data.customer.defaultAddress?.id ?? null;
  return data.customer.addresses.nodes
    .map((a) => address(a, def) as Address)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

const addressInput = (a: AddressInput) => ({ ...a, countryCode: "IN" });
type Errs = { userErrors: { field: string[] | null; message: string }[] };

export async function saveAddress(
  token: string,
  id: string | null,
  input: AddressInput,
  makeDefault: boolean,
): Promise<MutationResult> {
  if (id) {
    const data = await gql<{ customerAddressUpdate: Errs }>(
      token,
      `mutation Update($id: ID!, $address: CustomerAddressInput!, $default: Boolean) {
        customerAddressUpdate(addressId: $id, address: $address, defaultAddress: $default) {
          userErrors { field message }
        }
      }`,
      { id, address: addressInput(input), default: makeDefault || null },
    );
    const errors = userErrors(data.customerAddressUpdate.userErrors);
    return errors ? { ok: false, errors } : { ok: true };
  }
  const data = await gql<{ customerAddressCreate: Errs }>(
    token,
    `mutation Create($address: CustomerAddressInput!, $default: Boolean) {
      customerAddressCreate(address: $address, defaultAddress: $default) { userErrors { field message } }
    }`,
    { address: addressInput(input), default: makeDefault },
  );
  const errors = userErrors(data.customerAddressCreate.userErrors);
  return errors ? { ok: false, errors } : { ok: true };
}

export async function setDefaultAddress(token: string, id: string): Promise<MutationResult> {
  const data = await gql<{ customerAddressUpdate: Errs }>(
    token,
    `mutation Default($id: ID!) {
      customerAddressUpdate(addressId: $id, defaultAddress: true) { userErrors { field message } }
    }`,
    { id },
  );
  const errors = userErrors(data.customerAddressUpdate.userErrors);
  return errors ? { ok: false, errors } : { ok: true };
}

export async function deleteAddress(token: string, id: string): Promise<MutationResult> {
  const data = await gql<{ customerAddressDelete: Errs }>(
    token,
    `mutation Delete($id: ID!) { customerAddressDelete(addressId: $id) { userErrors { field message } } }`,
    { id },
  );
  const errors = userErrors(data.customerAddressDelete.userErrors);
  return errors ? { ok: false, errors } : { ok: true };
}

export async function updateDetails(
  token: string,
  input: { firstName: string; lastName: string },
  marketing: boolean,
  wasSubscribed: boolean,
): Promise<MutationResult> {
  const data = await gql<{ customerUpdate: Errs }>(
    token,
    `mutation Details($input: CustomerUpdateInput!) {
      customerUpdate(input: $input) { userErrors { field message } }
    }`,
    { input },
  );
  const errors = userErrors(data.customerUpdate.userErrors);
  if (errors) return { ok: false, errors };
  if (marketing !== wasSubscribed) {
    const mutation = marketing
      ? "customerEmailMarketingSubscribe"
      : "customerEmailMarketingUnsubscribe";
    const res = await gql<Record<string, Errs>>(
      token,
      `mutation Marketing { ${mutation} { userErrors { field message } } }`,
    );
    const mErrors = userErrors(res[mutation]?.userErrors);
    if (mErrors)
      return {
        ok: false,
        errors: { form: mErrors.form ?? "Email preferences could not be updated." },
      };
  }
  return { ok: true };
}
