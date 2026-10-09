// Product types modelled on the Shopify Storefront API, with connections (edges/nodes)
// already flattened into arrays. The Shopify fetch layer must map its response to these.

export type Money = {
  amount: string; // decimal string, e.g. "649.00", as Shopify returns it
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
  // Local-only: optimized WebP of a bundled image. Shopify's CDN negotiates WebP itself.
  webpUrl?: string;
};

export type ProductVariant = {
  id: string; // Shopify: "gid://shopify/ProductVariant/123"
  title: string; // e.g. "2 Pouches"
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  // Short merchandising line under the pack button. Shopify: variant metafield custom.pack_note
  note: string | null;
};

export type Product = {
  id: string; // Shopify: "gid://shopify/Product/123"
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  variants: ProductVariant[];
  // Shopify: product metafield custom.subtitle (e.g. "20 tea bags · 100g")
  subtitle: string | null;
  // Shopify: standard review metafields reviews.rating and reviews.rating_count
  rating: { value: number; count: number } | null;
};

export const money = (m: Money) => Number(m.amount);

// Merchandising labels come from product tags:
//   "best-seller"   -> round "Best Seller" badge
//   "label:<text>"  -> small corner label, e.g. "label:Save 10%"
export const hasTag = (p: Product, tag: string) => p.tags.includes(tag);
export const cornerLabel = (p: Product) =>
  p.tags.find((t) => t.startsWith("label:"))?.slice("label:".length) ?? null;
