import { createFileRoute } from "@tanstack/react-router";
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
  return (
    <main>
      <Hero />
      <PopularTeas />
      <FeaturedProduct />
      <WhatsInside />
      <UsVsThem />
      <OurStandards />
      <OurMission />
      <Reviews />
      <Journal />
    </main>
  );
}
