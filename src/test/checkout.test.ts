import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { priceCart } from "@/lib/checkout/pricing";
import { decodeNotes, encodeNotes } from "@/lib/checkout/server/notes";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/checkout/server/razorpay";
import { recordPaidOrder } from "@/lib/checkout/server/record";
import type { CheckoutForm } from "@/lib/checkout/types";
import { parseForm, parseItems, validateForm } from "@/lib/checkout/validation";

const form: CheckoutForm = {
  name: "Ananya Rao",
  email: "ananya@example.com",
  phone: "+91 98765 43210",
  address1: "12 Carter Road, Bandra West",
  address2: "",
  city: "Mumbai",
  state: "MH",
  pin: "400050",
};

describe("checkout validation", () => {
  it("accepts a complete Indian address and normalises the phone", () => {
    expect(validateForm(form)).toEqual({});
    expect(parseForm(form).phone).toBe("9876543210");
  });
  it("flags each bad field", () => {
    const e = validateForm({ ...form, email: "x", phone: "12345", state: "ZZ", pin: "0123" });
    expect(Object.keys(e).sort()).toEqual(["email", "phone", "pin", "state"]);
  });
  it("rejects bad cart lines", () => {
    expect(() => parseItems([])).toThrow();
    expect(() =>
      parseItems([{ handle: "skin-glow-tea", variantTitle: "1 Pouch", quantity: 0 }]),
    ).toThrow();
    expect(() => parseItems([{ handle: "../x", variantTitle: "1 Pouch", quantity: 1 }])).toThrow();
  });
});

describe("pricing (server side, never trusts the browser)", () => {
  it("prices from the catalog and adds delivery below the threshold", async () => {
    const one = await priceCart([
      { handle: "skin-glow-tea", variantTitle: "1 Pouch", quantity: 1 },
    ]);
    expect(one.subtotal).toBe(649);
    expect(one.shipping).toBe(79);
    expect(one.total).toBe(728);
    const four = await priceCart([
      { handle: "skin-glow-tea", variantTitle: "4 Pouches", quantity: 1 },
    ]);
    expect(four.shipping).toBe(0);
    expect(four.total).toBe(2206.6);
  });
  it("refuses unknown packs", async () => {
    await expect(
      priceCart([{ handle: "skin-glow-tea", variantTitle: "9 Pouches", quantity: 1 }]),
    ).rejects.toThrow();
  });
});

describe("order notes", () => {
  it("round-trips the details and items", () => {
    const items = [
      { handle: "skin-glow-tea", variantTitle: "4 Pouches", quantity: 1 },
      { handle: "calm-night", variantTitle: "1 Pouch", quantity: 2 },
    ];
    const notes = encodeNotes(parseForm(form), items);
    expect(Object.values(notes).every((v) => v.length <= 256)).toBe(true);
    expect(decodeNotes(notes)).toEqual({ form: parseForm(form), items });
  });
});

describe("payment signatures", () => {
  beforeEach(() => {
    process.env["RAZORPAY_KEY_ID"] = "rzp_test_key";
    process.env["RAZORPAY_KEY_SECRET"] = "secret";
    process.env["RAZORPAY_WEBHOOK_SECRET"] = "hook";
  });
  it("accepts only the right HMAC", () => {
    const good = createHmac("sha256", "secret").update("order_A|pay_B").digest("hex");
    expect(verifyPaymentSignature("order_A", "pay_B", good)).toBe(true);
    expect(verifyPaymentSignature("order_A", "pay_C", good)).toBe(false);
    expect(verifyPaymentSignature("order_A", "pay_B", "nothex")).toBe(false);
    const body = '{"event":"payment.captured"}';
    expect(
      verifyWebhookSignature(body, createHmac("sha256", "hook").update(body).digest("hex")),
    ).toBe(true);
    expect(
      verifyWebhookSignature(body + " ", createHmac("sha256", "hook").update(body).digest("hex")),
    ).toBe(false);
  });
});

describe("recordPaidOrder", () => {
  const items = [{ handle: "skin-glow-tea", variantTitle: "4 Pouches", quantity: 1 }];
  let created: Record<string, unknown> | null;
  let existing: string | null;

  beforeEach(() => {
    process.env["RAZORPAY_KEY_ID"] = "rzp_test_key";
    process.env["RAZORPAY_KEY_SECRET"] = "secret";
    process.env["STORE_DOMAIN"] = "store.example";
    process.env["STORE_CLIENT_ID"] = "client";
    process.env["STORE_CLIENT_SECRET"] = "client-secret";
    delete process.env["STORE_ADMIN_TOKEN"];
    created = null;
    existing = null;
    const notes = encodeNotes(parseForm(form), items);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const json = (d: unknown) => new Response(JSON.stringify(d), { status: 200 });
        if (url === "https://store.example/admin/oauth/access_token") {
          expect(String(init?.body)).toContain("grant_type=client_credentials");
          return json({ access_token: "shortlived", expires_in: 86399 });
        }
        if (url.includes("/graphql.json"))
          expect((init?.headers as Record<string, string>)["x-shopify-access-token"]).toBe(
            "shortlived",
          );
        if (url.endsWith("/orders/order_TEST123"))
          return json({
            id: "order_TEST123",
            amount: 220660,
            amount_paid: 220660,
            currency: "INR",
            status: "paid",
            notes,
          });
        if (url.endsWith("/payments/pay_TEST123"))
          return json({
            id: "pay_TEST123",
            order_id: "order_TEST123",
            amount: 220660,
            currency: "INR",
            status: "captured",
            method: "upi",
          });
        const body = JSON.parse(String(init?.body)) as {
          query: string;
          variables: Record<string, unknown>;
        };
        if (body.query.includes("Existing"))
          return json({ data: { orders: { nodes: existing ? [{ name: existing }] : [] } } });
        if (body.query.includes("Pack"))
          return json({
            data: {
              products: {
                nodes: [{ variants: { nodes: [{ id: "gid://v/4", title: "4 Pouches" }] } }],
              },
            },
          });
        if (body.query.includes("orderCreate")) {
          created = body.variables;
          return json({ data: { orderCreate: { order: { name: "#1001" }, userErrors: [] } } });
        }
        throw new Error(`unexpected ${url}`);
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("creates one paid order with the paid amount, address and pack", async () => {
    await expect(recordPaidOrder("order_TEST123", "pay_TEST123")).resolves.toEqual({
      reference: "#1001",
      created: true,
    });
    const order = created?.["order"] as Record<string, unknown>;
    expect(order["financialStatus"]).toBe("PAID");
    expect(order["lineItems"]).toEqual([
      {
        variantId: "gid://v/4",
        quantity: 1,
        priceSet: { shopMoney: { amount: "2206.60", currencyCode: "INR" } },
      },
    ]);
    expect((order["transactions"] as { amountSet: unknown }[])[0]?.amountSet).toEqual({
      shopMoney: { amount: "2206.60", currencyCode: "INR" },
    });
    expect((order["shippingAddress"] as Record<string, string>)["provinceCode"]).toBe("MH");
    expect(order["tags"]).toContain("rzp-order_TEST123");
  });

  it("does not create a second order for the same payment", async () => {
    existing = "#1001";
    await expect(recordPaidOrder("order_TEST123", "pay_TEST123")).resolves.toEqual({
      reference: "#1001",
      created: false,
    });
    expect(created).toBeNull();
  });
});
