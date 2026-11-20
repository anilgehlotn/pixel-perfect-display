import { useRef } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useScrollAnimations } from "@/lib/animations/useScrollAnimations";
import { FEATURED_PRODUCT_HANDLE, home, ingredients } from "@/data/content";
import { getProduct, getProducts } from "@/lib/shopify/products";
import { Hero } from "@/components/home/Hero";
import {
  TrustBar,
  ShopByRitual,
  Bestsellers,
  FeaturedRitual,
  CampaignBanner,
  Learn,
} from "@/components/home/Sections";
import { ComparisonTable, Ingredients, Reviews, Standards } from "@/components/product/Blocks";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [products, featured] = await Promise.all([
      getProducts(),
      getProduct(FEATURED_PRODUCT_HANDLE),
    ]);
    if (!featured) throw notFound();
    return { products, featured };
  },
  // Uses the site-wide title, description and share image from __root.tsx.
  component: Index,
});

function Index() {
  const { products, featured } = Route.useLoaderData();
  const scope = useRef<HTMLElement>(null);
  useScrollAnimations(scope);
  return (
    <main ref={scope}>
      <Hero featured={featured} />
      <TrustBar />
      <Bestsellers products={products} />
      <ShopByRitual products={products} />
      <Ingredients
        items={ingredients}
        eyebrow={home.ingredients.eyebrow}
        title={home.ingredients.title}
        text={home.ingredients.text}
        facts={home.facts}
      />
      <FeaturedRitual product={featured} />
      <CampaignBanner />
      <ComparisonTable />
      <Standards eyebrow={home.standards.eyebrow} title={home.standards.title} />
      <Reviews rating={featured.rating} />
      <Learn />
    </main>
  );
}
