import { useRef } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useScrollAnimations } from "@/lib/animations/useScrollAnimations";
import { FEATURED_PRODUCT_HANDLE } from "@/data/content";
import { getProduct, getProducts } from "@/lib/shopify/products";
import { Hero } from "@/components/home/Hero";
import {
  ProductRow,
  Bundle,
  HowItWorks,
  Tcm101,
  Sourcing,
  ClosingCta,
} from "@/components/home/Sections";
import { Stories } from "@/components/home/Stories";

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
      <Hero />
      <ProductRow products={products} />
      <Bundle product={featured} />
      <HowItWorks />
      <Tcm101 />
      <Stories />
      <Sourcing />
      <ClosingCta />
    </main>
  );
}
