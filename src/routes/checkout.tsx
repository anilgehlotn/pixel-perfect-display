import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockSimple } from "@phosphor-icons/react";
import { brand, checkoutCopy as copy, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/data/content";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { money } from "@/lib/catalog/types";
import { ProductImage } from "@/components/site/ProductImage";
import { INDIAN_STATES } from "@/lib/checkout/india";
import { confirmPayment, fetchPaymentMode, startPayment } from "@/lib/checkout/functions";
import { emptyForm, validateForm } from "@/lib/checkout/validation";
import type { CheckoutForm, FieldErrors } from "@/lib/checkout/types";

export const Route = createFileRoute("/checkout")({
  loader: () => fetchPaymentMode(),
  head: () => ({
    meta: [
      { title: `${copy.title} | ${brand.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

// The payment window script, loaded only when the shopper presses Pay.
const PAYMENT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
type PaymentWindow = { open: () => void; on: (event: string, cb: () => void) => void };
type PaymentSuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => PaymentWindow;
  }
}
function loadPaymentScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = PAYMENT_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Payment window failed to load"));
    document.head.appendChild(s);
  });
}

const FORM_KEY = "skinfusion-checkout-v1";

function CheckoutPage() {
  const mode = Route.useLoaderData();
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Remember the details on this device (not the payment), so a retry is quick.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FORM_KEY) ?? "null") as CheckoutForm | null;
      if (saved && typeof saved === "object") setForm({ ...emptyForm, ...saved });
    } catch {
      // Storage blocked: start empty.
    }
  }, []);
  const set = (key: keyof CheckoutForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const finish = (reference: string) => {
    clear();
    void navigate({ to: "/order-confirmed", search: { ref: reference } });
  };

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage(copy.fixErrors);
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      // Not saved: fine.
    }
    setBusy(true);
    const items = lines.map((l) => ({
      handle: l.merchandise.product.handle,
      variantTitle: l.merchandise.title,
      quantity: l.quantity,
    }));
    const started = await startPayment({ data: { form, items } }).catch(() => null);
    if (!started || !started.ok) {
      setBusy(false);
      setMessage(started?.message ?? copy.failed);
      return;
    }
    const p = started.value;
    if (p.mode === "test") {
      const res = await confirmPayment({
        data: { orderId: p.orderId, paymentId: "", signature: "" },
      });
      if (res.ok) finish(res.value.reference);
      else {
        setBusy(false);
        setMessage(res.message);
      }
      return;
    }
    try {
      await loadPaymentScript();
    } catch {
      setBusy(false);
      setMessage(copy.failed);
      return;
    }
    const Payment = window.Razorpay;
    if (!Payment) {
      setBusy(false);
      setMessage(copy.failed);
      return;
    }
    const green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
    const win = new Payment({
      key: p.keyId,
      amount: p.amount,
      currency: p.currency,
      order_id: p.orderId,
      name: brand.name,
      description: lines
        .map((l) => `${l.merchandise.product.title} (${l.merchandise.title})`)
        .join(", ")
        .slice(0, 250),
      prefill: {
        name: form.name,
        email: form.email,
        contact: `+91${form.phone.replace(/\D/g, "").slice(-10)}`,
      },
      notes: {},
      theme: { color: green || undefined },
      modal: { ondismiss: () => setBusy(false), confirm_close: true },
      handler: (r: PaymentSuccess) => {
        void confirmPayment({
          data: {
            orderId: r.razorpay_order_id,
            paymentId: r.razorpay_payment_id,
            signature: r.razorpay_signature,
          },
        }).then((res) => {
          if (res.ok) finish(res.value.reference);
          else {
            setBusy(false);
            setMessage(res.message);
          }
        });
      },
    });
    win.on("payment.failed", () => {
      setMessage(copy.failed);
    });
    win.open();
  };

  if (!lines.length)
    return (
      <main className="container-x section-y pt-32 text-center lg:pt-40">
        <h1 className="title">{copy.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{copy.empty}</p>
        <Link to="/" hash="shop" className="btn btn-primary mt-8">
          {copy.emptyCta}
        </Link>
      </main>
    );

  return (
    <main className="container-x pb-20 pt-28 lg:pt-36">
      <h1 className="title">{copy.title}</h1>
      <form
        ref={formRef}
        onSubmit={pay}
        noValidate
        className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
      >
        <div className="min-w-0 space-y-10">
          <Fieldset legend={copy.contact}>
            <Field id="name" label={copy.fields.name} error={errors.name}>
              <input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                {...invalid(errors.name, "name")}
                className="field"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="email" label={copy.fields.email} error={errors.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  {...invalid(errors.email, "email")}
                  className="field"
                />
              </Field>
              <Field id="phone" label={copy.fields.phone} error={errors.phone}>
                <div className="flex">
                  <span className="field flex w-auto shrink-0 items-center rounded-r-none border-r-0 px-4 text-muted-foreground">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    {...invalid(errors.phone, "phone")}
                    className="field rounded-l-none"
                  />
                </div>
              </Field>
            </div>
          </Fieldset>

          <Fieldset legend={copy.delivery}>
            <Field id="address1" label={copy.fields.address1} error={errors.address1}>
              <input
                id="address1"
                autoComplete="address-line1"
                value={form.address1}
                onChange={(e) => set("address1", e.target.value)}
                {...invalid(errors.address1, "address1")}
                className="field"
              />
            </Field>
            <Field id="address2" label={copy.fields.address2}>
              <input
                id="address2"
                autoComplete="address-line2"
                value={form.address2}
                onChange={(e) => set("address2", e.target.value)}
                className="field"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field id="city" label={copy.fields.city} error={errors.city}>
                <input
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  {...invalid(errors.city, "city")}
                  className="field"
                />
              </Field>
              <Field id="state" label={copy.fields.state} error={errors.state}>
                <select
                  id="state"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  {...invalid(errors.state, "state")}
                  className="field"
                >
                  <option value="">{copy.choose}</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="pin" label={copy.fields.pin} error={errors.pin}>
                <input
                  id="pin"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  value={form.pin}
                  onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))}
                  {...invalid(errors.pin, "pin")}
                  className="field"
                />
              </Field>
            </div>
          </Fieldset>
        </div>

        <aside className="h-fit min-w-0 rounded-card bg-blush p-5 sm:p-8 lg:sticky lg:top-28">
          <h2 className="text-2xl text-green">{copy.summary}</h2>
          <ul className="mt-6 space-y-4">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] bg-beige">
                  {l.merchandise.image && (
                    <ProductImage
                      image={l.merchandise.image}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute right-1 top-1 grid h-6 min-w-6 place-items-center rounded-full bg-green px-1.5 text-xs text-cream">
                    {l.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-green">{l.merchandise.product.title}</p>
                  <p className="text-sm text-muted-foreground">{l.merchandise.title}</p>
                </div>
                <p className="tabular-nums">{inr(money(l.merchandise.price) * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-green/10 pt-5">
            <Row label={copy.subtotal} value={inr(subtotal)} />
            <Row label={copy.shipping} value={shipping ? inr(shipping) : copy.free} />
            <Row label={copy.total} value={inr(total)} strong />
          </dl>
          {message && (
            <p
              role="alert"
              className="mt-5 rounded-[1rem] bg-surface px-4 py-3 text-sm text-foreground"
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || mode === "off"}
            className="btn btn-primary mt-6 w-full"
          >
            {mode === "off"
              ? copy.off
              : busy
                ? copy.paying
                : mode === "test"
                  ? copy.testPay
                  : `${copy.pay} ${inr(total)}`}
          </button>
          <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
            <LockSimple aria-hidden="true" weight="light" className="mt-0.5 h-4 w-4 shrink-0" />
            {copy.secure}
          </p>
        </aside>
      </form>
    </main>
  );
}

const invalid = (error: string | undefined, id: string) =>
  error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 space-y-5">
      <legend className="mb-5 text-2xl text-green">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between ${strong ? "pt-2 text-lg text-green" : "text-muted-foreground"}`}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
