// Product types used across the site.

export type Money = {
  amount: string; // decimal string, e.g. "649.00"
  currencyCode: string;
};

export type ProductPhoto = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
  // Optimized WebP of a bundled image.
  webpUrl?: string;
};

export type ProductVariant = {
  id: string;
  title: string; // e.g. "2 Pouches"
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  // Short merchandising line under the pack button.
  note: string | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage: ProductPhoto | null;
  images: ProductPhoto[];
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  variants: ProductVariant[];
  // e.g. "20 tea bags · 100g"
  subtitle: string | null;
  rating: { value: number; count: number } | null;
};

export const money = (m: Money) => Number(m.amount);

// Merchandising labels come from product tags:
//   "best-seller"   -> round "Best Seller" badge
//   "label:<text>"  -> small corner label, e.g. "label:Save 10%"
export const hasTag = (p: Product, tag: string) => p.tags.includes(tag);
export const cornerLabel = (p: Product) =>
  p.tags.find((t) => t.startsWith("label:"))?.slice("label:".length) ?? null;
