import { createFileRoute } from "@tanstack/react-router";
import {
  Hero, TrustStrip, IngredientStory, FeaturedProduct, GlowRitual, Comparison,
  HowToBrew, QuizTeaser, Reviews, InstagramStrip, Journal, Newsletter,
} from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkinFusion | Skin Glow Tea, Glow from within" },
      { name: "description", content: "TCM Edition Skin Glow Tea with jujube, snow fungus and goji. Caffeine free, 100% natural, made in small batches in India." },
      { property: "og:title", content: "SkinFusion | Skin Glow Tea" },
      { property: "og:description", content: "A caffeine-free TCM skin glow tea for one calm cup a day." },
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
      <TrustStrip />
      <IngredientStory />
      <FeaturedProduct />
      <GlowRitual />
      <Comparison />
      <HowToBrew />
      <QuizTeaser />
      <Reviews />
      <InstagramStrip />
      <Journal />
      <Newsletter />
    </main>
  );
}
