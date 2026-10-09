import { createFileRoute, notFound } from "@tanstack/react-router";
import { FEATURED_PRODUCT_HANDLE } from "@/data/content";
import { getProduct, getProducts } from "@/lib/shopify/products";
import {
  Hero,
  PopularTeas,
  FeaturedProduct,
  WhatsInside,
  UsVsThem,
  OurStandards,
  OurMission,
  Reviews,
  Journal,
} from "@/components/site/Sections";

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
  return (
    <main>
      <Hero />
      <PopularTeas products={products} />
      <FeaturedProduct product={featured} />
      <WhatsInside />
      <UsVsThem />
      <OurStandards />
      <OurMission />
      <Reviews />
      <Journal />
    </main>
  );
}
