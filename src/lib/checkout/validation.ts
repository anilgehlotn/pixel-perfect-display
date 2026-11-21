import { INDIAN_STATES } from "./india";
import type { CheckoutForm, CheckoutItem, FieldErrors } from "./types";

// Checkout form rules, shared by the form (instant feedback) and the server (the real check).

export const emptyForm: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pin: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keeps the last 10 digits, so "+91 98765 43210" and "098765 43210" both work. */
export const normalisePhone = (v: string) => v.replace(/\D/g, "").slice(-10);

export function validateForm(f: CheckoutForm): FieldErrors {
  const e: FieldErrors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!EMAIL.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(normalisePhone(f.phone)))
    e.phone = "Please enter a 10-digit mobile number.";
  if (f.address1.trim().length < 5) e.address1 = "Please enter your house and street.";
  if (f.city.trim().length < 2) e.city = "Please enter your city.";
  if (!INDIAN_STATES.some((s) => s.code === f.state)) e.state = "Please choose your state.";
  if (!/^[1-9]\d{5}$/.test(f.pin.trim())) e.pin = "Please enter a 6-digit PIN code.";
  return e;
}

const LIMITS: Record<keyof CheckoutForm, number> = {
  name: 80,
  email: 120,
  phone: 20,
  address1: 120,
  address2: 120,
  city: 60,
  state: 4,
  pin: 6,
};

/** Server side: turns unknown input into a clean form, or throws. */
export function parseForm(input: unknown): CheckoutForm {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const f = { ...emptyForm };
  for (const key of Object.keys(emptyForm) as (keyof CheckoutForm)[]) {
    const v = o[key];
    f[key] = typeof v === "string" ? v.trim().slice(0, LIMITS[key]) : "";
  }
  f.phone = normalisePhone(f.phone);
  if (Object.keys(validateForm(f)).length) throw new Error("Please check your details.");
  return f;
}

/** Server side: at most 20 lines, quantities 1 to 20. */
export function parseItems(input: unknown): CheckoutItem[] {
  if (!Array.isArray(input) || !input.length || input.length > 20)
    throw new Error("Your cart is empty.");
  return input.map((raw) => {
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const handle = typeof o["handle"] === "string" ? o["handle"] : "";
    const variantTitle = typeof o["variantTitle"] === "string" ? o["variantTitle"] : "";
    const quantity = Number(o["quantity"]);
    if (!/^[a-z0-9-]{1,80}$/.test(handle) || !variantTitle || variantTitle.length > 80)
      throw new Error("Unknown product in your cart.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      throw new Error("Please check the quantities in your cart.");
    return { handle, variantTitle, quantity };
  });
}
