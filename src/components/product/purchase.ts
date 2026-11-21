import { useState } from "react";
import { money, type Product, type ProductVariant } from "@/lib/catalog/types";

/** Pouches in a pack, read from the variant title ("2 Pouches" -> 2). */
export const pouches = (v: ProductVariant) => Number(/\d+/.exec(v.title)?.[0] ?? 1) || 1;

export const savePercent = (v: ProductVariant) => {
  const now = money(v.price);
  const was = v.compareAtPrice ? money(v.compareAtPrice) : 0;
  return was > now ? Math.round((1 - now / was) * 100) : 0;
};

/** Selected pack and quantity, shared by the buy box and the sticky bar on phones. */
export function usePurchase(product: Product) {
  const first = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [variantId, setVariantId] = useState(first?.id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? first;
  return { variant, setVariantId, qty, setQty };
}
export type Purchase = ReturnType<typeof usePurchase>;
