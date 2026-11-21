// Shapes shared by the checkout page (browser) and the checkout server functions.

/** One cart line as the browser sends it. Prices are never sent: the server looks them up. */
export type CheckoutItem = { handle: string; variantTitle: string; quantity: number };

export type CheckoutForm = {
  name: string;
  email: string;
  phone: string; // 10-digit Indian mobile number
  address1: string;
  address2: string;
  city: string;
  state: string; // state code from india.ts
  pin: string; // 6-digit PIN code
};

export type FieldErrors = Partial<Record<keyof CheckoutForm, string>>;

/** How the checkout page can take payment right now. */
export type PaymentMode = "live" | "test" | "off";

export type StartPaymentResult =
  | {
      mode: "live";
      keyId: string; // public key id, safe in the browser
      orderId: string;
      amount: number; // paise
      currency: string;
    }
  | { mode: "test"; orderId: string; amount: number; currency: string };

export type ConfirmResult = { reference: string };
