// Shared by the forms (instant feedback) and the server (never trusts the browser).
import { INDIAN_STATES } from "./india";
import type { AddressInput, FormErrors } from "./types";

export type AddressFormValues = {
  fullName: string;
  phone: string; // 10 digits, without +91
  address1: string;
  address2: string;
  city: string;
  zoneCode: string;
  zip: string;
};

const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Accepts "98765 43210", "+91 98765-43210", "09876543210"; returns 10 digits or "". */
export function normalizeIndianPhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function validateAddress(raw: Partial<AddressFormValues>): {
  values: AddressFormValues;
  errors: FormErrors;
} {
  const values: AddressFormValues = {
    fullName: clean(raw.fullName, 80),
    phone: normalizeIndianPhone(clean(raw.phone, 20)),
    address1: clean(raw.address1),
    address2: clean(raw.address2),
    city: clean(raw.city, 60),
    zoneCode: clean(raw.zoneCode, 4),
    zip: clean(raw.zip, 6).replace(/\s/g, ""),
  };
  const errors: FormErrors = {};
  if (!values.fullName) errors["fullName"] = "Enter the name for delivery.";
  if (!/^[6-9]\d{9}$/.test(values.phone))
    errors["phone"] = "Enter a 10-digit mobile number, for example 98765 43210.";
  if (!values.address1) errors["address1"] = "Enter the house number and street.";
  if (!values.city) errors["city"] = "Enter the city or town.";
  if (!INDIAN_STATES.some((s) => s.code === values.zoneCode))
    errors["zoneCode"] = "Choose a state or union territory.";
  if (!/^[1-9]\d{5}$/.test(values.zip)) errors["zip"] = "Enter a 6-digit PIN code.";
  return { values, errors };
}

/** Splits "Meera Devi Iyer" into first "Meera Devi" and last "Iyer" for Shopify. */
export function toAddressInput(v: AddressFormValues): AddressInput {
  const parts = v.fullName.split(/\s+/);
  const lastName = parts.length > 1 ? (parts.pop() ?? "") : "";
  return {
    firstName: parts.join(" "),
    lastName,
    address1: v.address1,
    address2: v.address2,
    city: v.city,
    zoneCode: v.zoneCode,
    zip: v.zip,
    phoneNumber: `+91${v.phone}`,
  };
}

export function toFormValues(a: AddressInput | null): AddressFormValues {
  return {
    fullName: a ? `${a.firstName} ${a.lastName}`.trim() : "",
    phone: a ? normalizeIndianPhone(a.phoneNumber) : "",
    address1: a?.address1 ?? "",
    address2: a?.address2 ?? "",
    city: a?.city ?? "",
    zoneCode: a?.zoneCode ?? "",
    zip: a?.zip ?? "",
  };
}

export function validateDetails(raw: { firstName?: unknown; lastName?: unknown }) {
  const values = { firstName: clean(raw.firstName, 60), lastName: clean(raw.lastName, 60) };
  const errors: FormErrors = {};
  if (!values.firstName) errors["firstName"] = "Enter your first name.";
  return { values, errors };
}

/**
 * Only same-site paths are allowed after sign-in (no open redirects): must start with a
 * single "/", no backslashes, no scheme, and never the auth routes themselves.
 */
export function safeRedirect(target: unknown, fallback = "/account") {
  if (typeof target !== "string" || target.length > 512) return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return fallback;
  try {
    const url = new URL(target, "https://skinfusion.invalid");
    if (url.origin !== "https://skinfusion.invalid") return fallback;
    if (/^\/account\/(login|callback|logout|authorize)\b/.test(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

/** Numeric order IDs only (the gid is rebuilt on the server). */
export const isOrderId = (id: unknown): id is string =>
  typeof id === "string" && /^\d{1,20}$/.test(id);
