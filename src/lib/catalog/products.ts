import { localProducts } from "@/data/content";
import type { Product } from "./types";

// The ONLY entry points components and routes use to read products. Call them from route
// loaders so the server renders real data. Products come from `localProducts` in
// src/data/content.ts. To move products to a store backend later, change only these two
// functions.

export async function getProducts(): Promise<Product[]> {
  return localProducts;
}

export async function getProduct(handle: string): Promise<Product | null> {
  return localProducts.find((p) => p.handle === handle) ?? null;
}
