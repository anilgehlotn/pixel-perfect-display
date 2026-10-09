// Server functions for the account pages. The handler bodies (and everything they import
// from ./server) run only on the server; the browser bundle gets small RPC stubs.
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { withAccount } from "./server/account";
import * as api from "./server/customer-api";
import { readSession, storeFirstName, getAccessToken } from "./server/session";
import { isMockMode } from "./server/env";
import { cartBuyerIdentityUpdate } from "./server/storefront-cart";
import type { MutationResult } from "./types";
import {
  isOrderId,
  toAddressInput,
  validateAddress,
  validateDetails,
  type AddressFormValues,
} from "./validation";

const ADDRESS_ID = /^gid:\/\/shopify\/CustomerAddress\/\d{1,20}(\?.*)?$/;
const addressId = (id: unknown) => {
  if (typeof id !== "string" || !ADDRESS_ID.test(id)) throw new Error("Invalid address");
  return id;
};
const asObject = (d: unknown) => (d && typeof d === "object" ? (d as Record<string, unknown>) : {});

/** Signed-in state for the header and route guards (cookies only, no API call). */
export const fetchSession = createServerFn({ method: "GET" }).handler(() => {
  setResponseHeader("cache-control", "private, no-store");
  return readSession();
});

export const fetchOverview = createServerFn({ method: "GET" }).handler(() =>
  withAccount(api.getOverview, (m, n) => m.overview(n)),
);

export const fetchCustomer = createServerFn({ method: "GET" }).handler(() =>
  withAccount(api.getCustomer, (m) => m.customer()),
);

export const fetchOrders = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const after = asObject(d)["after"];
    return { after: typeof after === "string" && after.length < 300 ? after : null };
  })
  .handler(({ data }) =>
    withAccount(
      (t) => api.getOrders(t, data.after),
      (m, n) => m.orders(n, data.after),
    ),
  );

export const fetchOrder = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const id = asObject(d)["id"];
    if (!isOrderId(id)) throw new Error("Invalid order");
    return { id };
  })
  .handler(({ data }) =>
    withAccount(
      (t) => api.getOrder(t, data.id),
      (m, n) => m.order(n, data.id),
    ),
  );

export const fetchAddresses = createServerFn({ method: "GET" }).handler(() =>
  withAccount(api.getAddresses, (m) => m.addresses()),
);

export const saveAddress = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const o = asObject(d);
    return {
      id: o["id"] == null ? null : addressId(o["id"]),
      values: asObject(o["values"]) as Partial<AddressFormValues>,
      makeDefault: o["makeDefault"] === true,
    };
  })
  .handler(async ({ data }): Promise<MutationResult> => {
    const { values, errors } = validateAddress(data.values);
    if (Object.keys(errors).length) return { ok: false, errors };
    const input = toAddressInput(values);
    return withAccount(
      (t) => api.saveAddress(t, data.id, input, data.makeDefault),
      (m) => m.saveAddress(data.id, input, data.makeDefault),
    );
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ id: addressId(asObject(d)["id"]) }))
  .handler(({ data }) =>
    withAccount(
      (t) => api.deleteAddress(t, data.id),
      (m) => m.deleteAddress(data.id),
    ),
  );

export const setDefaultAddress = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ id: addressId(asObject(d)["id"]) }))
  .handler(({ data }) =>
    withAccount(
      (t) => api.setDefaultAddress(t, data.id),
      (m) => m.setDefault(data.id),
    ),
  );

export const saveDetails = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const o = asObject(d);
    return {
      firstName: o["firstName"],
      lastName: o["lastName"],
      marketing: o["marketing"] === true,
    };
  })
  .handler(async ({ data }): Promise<MutationResult> => {
    const { values, errors } = validateDetails(data);
    if (Object.keys(errors).length) return { ok: false, errors };
    const result = await withAccount(
      async (t) => {
        const current = await api.getCustomer(t);
        return api.updateDetails(t, values, data.marketing, current.marketingSubscribed);
      },
      (m) => m.updateDetails(values, data.marketing),
    );
    if (result.ok) storeFirstName(values.firstName);
    return result;
  });

/**
 * Links a Shopify cart (Storefront API cart ID) to the signed-in customer so checkout is
 * prefilled and logged in. Returns the cart's checkoutUrl. The local cart is not on Shopify
 * yet; see "Customer accounts" in CLAUDE.md for when to call this.
 */
export const linkCartToCustomer = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const cartId = asObject(d)["cartId"];
    if (typeof cartId !== "string" || !/^gid:\/\/shopify\/Cart\/[\w?=&-]{1,200}$/.test(cartId))
      throw new Error("Invalid cart");
    return { cartId };
  })
  .handler(async ({ data }) => {
    setResponseHeader("cache-control", "private, no-store");
    if (isMockMode()) return { linked: false as const, reason: "mock" as const };
    const token = await getAccessToken();
    if (!token) return { linked: false as const, reason: "signed-out" as const };
    const { checkoutUrl } = await cartBuyerIdentityUpdate(data.cartId, token);
    return { linked: true as const, checkoutUrl };
  });
