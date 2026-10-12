import { describe, expect, it } from "vitest";
import {
  isOrderId,
  normalizeIndianPhone,
  safeRedirect,
  toAddressInput,
  validateAddress,
} from "@/lib/customer/validation";
import { codeChallenge } from "@/lib/customer/server/oauth";

describe("safeRedirect (open-redirect protection)", () => {
  it.each([
    ["/account/orders", "/account/orders"],
    ["/real-results?x=1#top", "/real-results?x=1#top"],
    ["//evil.com", "/account"],
    ["https://evil.com/account", "/account"],
    ["/\\evil.com", "/account"],
    ["javascript:alert(1)", "/account"],
    ["/account/logout", "/account"],
    ["/account/callback?code=1", "/account"],
    [undefined, "/account"],
  ])("%s -> %s", (input, expected) => {
    expect(safeRedirect(input)).toBe(expected);
  });
});

describe("Indian address validation", () => {
  const valid = {
    fullName: "Meera Devi Iyer",
    phone: "+91 98765-43210",
    address1: "12, 4th Cross",
    address2: "",
    city: "Bengaluru",
    zoneCode: "KA",
    zip: "560038",
  };

  it("accepts a complete address and formats it for Shopify", () => {
    const { values, errors } = validateAddress(valid);
    expect(errors).toEqual({});
    expect(toAddressInput(values)).toMatchObject({
      firstName: "Meera Devi",
      lastName: "Iyer",
      phoneNumber: "+919876543210",
      zoneCode: "KA",
    });
  });

  it("rejects bad phone, PIN code and state", () => {
    const { errors } = validateAddress({ ...valid, phone: "12345", zip: "012345", zoneCode: "XX" });
    expect(Object.keys(errors).sort()).toEqual(["phone", "zip", "zoneCode"]);
  });

  it("normalises common phone formats", () => {
    expect(normalizeIndianPhone("09876543210")).toBe("9876543210");
    expect(normalizeIndianPhone("919876543210")).toBe("9876543210");
  });

  it("only accepts numeric order IDs", () => {
    expect(isOrderId("5003")).toBe(true);
    expect(isOrderId("gid://shopify/Order/1")).toBe(false);
  });
});

describe("PKCE", () => {
  it("derives the RFC 7636 S256 challenge (base64url, no padding)", async () => {
    // Test vector from RFC 7636 Appendix B
    expect(await codeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });
});
