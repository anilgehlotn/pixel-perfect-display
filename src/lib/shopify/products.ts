import { localProducts } from "@/data/content";
import { storefrontFetch } from "./client";
import { isShopifyConfigured } from "./config";
import type { Money, Product, ProductVariant, ShopifyImage } from "./types";

// The ONLY entry points components and routes use to read products. Call them from route
// loaders so the server renders real data.
//
// With the VITE_SHOPIFY_* variables set, products come from the Shopify Storefront API.
// Shopify is the source of truth for ids, titles, prices, stock and tags. Fields the store
// does not have yet (photos, subtitle, rating, pack notes, description) fall back to the
// matching product in localProducts (same handle), so the site never loses content.
// If Shopify is unreachable, the local products are returned so the page still renders.

type Connection<T> = { nodes: T[] };
type MetafieldValue = { value: string } | null;

type RawVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  note: MetafieldValue;
};

type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: Connection<ShopifyImage>;
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  variants: Connection<RawVariant>;
  subtitle: MetafieldValue;
  ratingValue: MetafieldValue;
  ratingCount: MetafieldValue;
};

const PRODUCT_FIELDS = `
  id handle title description tags
  featuredImage { url altText width height }
  images(first: 10) { nodes { url altText width height } }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  variants(first: 20) {
    nodes {
      id title availableForSale
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      note: metafield(namespace: "custom", key: "pack_note") { value }
    }
  }
  subtitle: metafield(namespace: "custom", key: "subtitle") { value }
  ratingValue: metafield(namespace: "reviews", key: "rating") { value }
  ratingCount: metafield(namespace: "reviews", key: "rating_count") { value }
`;

// reviews.rating is stored as JSON: {"value":"4.8","scale_min":"1.0","scale_max":"5.0"}
function parseRating(value: MetafieldValue, count: MetafieldValue): Product["rating"] {
  if (!value || !count) return null;
  try {
    const parsed = JSON.parse(value.value) as { value?: string } | number;
    const v = typeof parsed === "number" ? parsed : Number(parsed.value);
    const c = Number(count.value);
    return Number.isFinite(v) && Number.isFinite(c) ? { value: v, count: c } : null;
  } catch {
    return null;
  }
}

// A real Shopify compare-at price of 0 or below the price is not a discount.
const realCompareAt = (price: Money, compareAt: Money | null) =>
  compareAt && Number(compareAt.amount) > Number(price.amount) ? compareAt : null;

function toProduct(raw: RawProduct): Product {
  const local = localProducts.find((p) => p.handle === raw.handle);
  const images = raw.images.nodes.length ? raw.images.nodes : (local?.images ?? []);

  const compareAtMin = realCompareAt(
    raw.priceRange.minVariantPrice,
    raw.compareAtPriceRange?.minVariantPrice ?? null,
  );

  const variants: ProductVariant[] = raw.variants.nodes.map((v) => {
    const localVariant = local?.variants.find((lv) => lv.title === v.title);
    return {
      id: v.id,
      // Shopify names the only variant of a simple product "Default Title".
      title: v.title === "Default Title" ? (localVariant?.title ?? "1 Pouch") : v.title,
      availableForSale: v.availableForSale,
      price: v.price,
      compareAtPrice: realCompareAt(v.price, v.compareAtPrice),
      selectedOptions: v.selectedOptions,
      note: v.note?.value ?? localVariant?.note ?? null,
    };
  });

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: local?.description || raw.description,
    tags: raw.tags,
    featuredImage: raw.featuredImage ?? local?.featuredImage ?? images[0] ?? null,
    images,
    priceRange: raw.priceRange,
    compareAtPriceRange: compareAtMin ? { minVariantPrice: compareAtMin } : null,
    variants,
    subtitle: raw.subtitle?.value ?? local?.subtitle ?? null,
    rating: parseRating(raw.ratingValue, raw.ratingCount) ?? local?.rating ?? null,
  };
}

// Keep the site's product order (localProducts), then any new Shopify products after them.
function sortLikeSite(products: Product[]) {
  const order = (p: Product) => {
    const i = localProducts.findIndex((l) => l.handle === p.handle);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...products].sort((a, b) => order(a) - order(b));
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured) return localProducts;
  try {
    const data = await storefrontFetch<{ products: Connection<RawProduct> }>(
      `query Products { products(first: 50) { nodes { ${PRODUCT_FIELDS} } } }`,
    );
    const products = data.products.nodes.map(toProduct);
    return products.length ? sortLikeSite(products) : localProducts;
  } catch (error) {
    console.error("Shopify products failed, showing local products", error);
    return localProducts;
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured) return localProducts.find((p) => p.handle === handle) ?? null;
  try {
    const data = await storefrontFetch<{ product: RawProduct | null }>(
      `query Product($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
      { handle },
    );
    return data.product ? toProduct(data.product) : null;
  } catch (error) {
    console.error("Shopify product failed, showing local product", error);
    return localProducts.find((p) => p.handle === handle) ?? null;
  }
}
