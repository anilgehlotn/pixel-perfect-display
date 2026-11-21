import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/data/content";
import { getProduct } from "@/lib/catalog/products";
import { money } from "@/lib/catalog/types";
import type { CheckoutItem } from "./types";

export type PricedLine = CheckoutItem & { title: string; unitPrice: number; lineTotal: number };
export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

export const shippingFor = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

/**
 * Prices a cart from the catalog. The server always calls this itself, so a price sent from
 * the browser is never trusted. Throws if a product or pack no longer exists or is sold out.
 */
export async function priceCart(items: CheckoutItem[]): Promise<PricedCart> {
  const lines: PricedLine[] = [];
  for (const item of items) {
    const product = await getProduct(item.handle);
    const variant = product?.variants.find((v) => v.title === item.variantTitle);
    if (!product || !variant || !variant.availableForSale)
      throw new Error(`${product?.title ?? "A product"} is not available right now.`);
    const unitPrice = money(variant.price);
    lines.push({
      ...item,
      title: product.title,
      unitPrice,
      lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
    });
  }
  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const shipping = shippingFor(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}
