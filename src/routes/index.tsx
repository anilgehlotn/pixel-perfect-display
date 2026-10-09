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
  head: () => ({
    meta: [
      { title: "SkinFusion | Sip. Glow. Repeat. Skin Glow Tea" },
      {
        name: "description",
        content:
          "TCM Edition Skin Glow Tea with jujube, snow fungus and goji. Caffeine free, 100% natural skin-wellness teas from India.",
      },
      { property: "og:title", content: "SkinFusion | Sip. Glow. Repeat." },
      {
        property: "og:description",
        content: "Caffeine-free TCM skin-wellness teas for a calm daily ritual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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
