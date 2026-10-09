import { localProducts } from "@/data/content";
import type { Product } from "./types";

// The ONLY entry points components and routes use to read products. Call them from route
// loaders so the server renders real data. To connect Shopify, replace the bodies with
// storefrontFetch() queries (products / product(handle:)) mapped to the Product type.

export async function getProducts(): Promise<Product[]> {
  return localProducts;
}

export async function getProduct(handle: string): Promise<Product | null> {
  return localProducts.find((p) => p.handle === handle) ?? null;
}
