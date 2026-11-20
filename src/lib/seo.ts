// Site-wide SEO defaults used by the root route's head(). Pages can override any tag.
// Social networks need absolute image URLs, so set VITE_SITE_URL in production
// (e.g. https://skinfusion.in). Without it the tags fall back to relative paths.
const siteUrl = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "");

export const absoluteUrl = (path: string) => `${siteUrl}${path}`;

export const site = {
  name: "SkinFusion",
  title: "SkinFusion | TCM Skin Glow Tea",
  description:
    "Caffeine-free TCM Skin Glow Tea with whole jujube, snow fungus and goji berries. A warm daily tea ritual from SkinFusion, Mumbai.",
  themeColor: "#fbf7f2",
  // 1200 x 630 JPG in public/. Replace public/og-image.jpg to change the share image.
  ogImage: { path: "/og-image.jpg", width: 1200, height: 630, alt: "SkinFusion Skin Glow Tea" },
};

// Vercel preview deployments (demo links) are kept out of search results. Production builds
// and local builds leave this false.
export const noIndex = typeof __NOINDEX__ !== "undefined" && __NOINDEX__;
