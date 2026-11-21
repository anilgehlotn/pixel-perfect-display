import type { CheckoutForm, CheckoutItem } from "../types";

// The order details travel with the payment as Razorpay order "notes" (max 15 notes, 256
// characters each). That makes the payment the single source of truth: the confirm call and
// the webhook both rebuild the order from it, so nothing is lost if the browser closes.

const MAX = 250;

export function encodeNotes(form: CheckoutForm, items: CheckoutItem[]): Record<string, string> {
  const notes: Record<string, string> = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    address1: form.address1,
    address2: form.address2,
    city: form.city,
    state: form.state,
    pin: form.pin,
  };
  // items: "handle|variant title|quantity" joined with ";", split over item0..item5.
  const text = items
    .map((i) => [i.handle, i.variantTitle.replace(/[|;]/g, " "), i.quantity].join("|"))
    .join(";");
  const parts = text.match(new RegExp(`.{1,${MAX}}`, "g")) ?? [];
  if (parts.length > 6) throw new Error("Your cart is too large for one order.");
  parts.forEach((p, i) => (notes[`item${i}`] = p));
  return notes;
}

export function decodeNotes(notes: Record<string, string> | []): {
  form: CheckoutForm;
  items: CheckoutItem[];
} | null {
  if (Array.isArray(notes)) return null;
  const get = (k: string) => notes[k] ?? "";
  let text = "";
  for (let i = 0; i < 6; i++) text += get(`item${i}`);
  const items = text
    .split(";")
    .filter(Boolean)
    .map((row) => {
      const [handle = "", variantTitle = "", qty = "0"] = row.split("|");
      return { handle, variantTitle, quantity: Number(qty) };
    })
    .filter((i) => i.handle && i.quantity > 0);
  if (!items.length || !get("email")) return null;
  return {
    form: {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      address1: get("address1"),
      address2: get("address2"),
      city: get("city"),
      state: get("state"),
      pin: get("pin"),
    },
    items,
  };
}
