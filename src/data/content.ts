// All storefront content lives here so a backend or Shopify can replace it later.
import pouch from "@/assets/skinfusion-pouch.jpg.asset.json";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import ritual from "@/assets/ritual.jpg";
import ingJujube from "@/assets/ing-jujube.jpg";
import ingSnow from "@/assets/ing-snowfungus.jpg";
import ingGoji from "@/assets/ing-goji.jpg";
import ingGinger from "@/assets/ing-ginger.jpg";
import brew1 from "@/assets/brew-1.jpg";
import brew2 from "@/assets/brew-2.jpg";
import brew3 from "@/assets/brew-3.jpg";
import journal3 from "@/assets/journal-3.jpg";

export const images = { pouch: pouch.url, hero1, hero2, ritual };

export const brand = {
  name: "SkinFusion",
  tagline: "Glow from within",
  pillars: ["Beauty", "Wellness", "Radiance"],
  whatsapp: "https://wa.me/910000000000",
  instagram: "@skinfusion",
};

export const announcement = [
  "Free shipping above ₹699",
  "Extra 5% off on prepaid orders",
  "Caffeine free",
  "100% natural",
];

export const nav = [
  { label: "Shop", href: "#shop" },
  { label: "Ingredients", href: "#ingredients" },
  { label: "Glow Ritual", href: "#ritual" },
  { label: "Journal", href: "#journal" },
  { label: "Our Story", href: "#story" },
];

export const FREE_SHIPPING_THRESHOLD = 699;

export const product = {
  id: "skin-glow-tea",
  name: "TCM Edition Skin Glow Tea",
  short: "Skin Glow Tea",
  size: "20 tea bags · 100g",
  price: 649,
  mrp: 799,
  rating: 4.8,
  reviewCount: 312,
  description:
    "A gentle caffeine-free blend of jujubes, snow fungus and goji berries, with a warm hint of ginger. Traditionally used to support digestive and skin wellness.",
  benefits: ["Hydrates skin", "Boosts radiance", "Supports digestion", "100% natural", "Caffeine free"],
  gallery: [pouch.url, hero1, brew3, ingGoji],
  hoverImage: brew3,
};

export const packs = [
  { id: "1", qty: 1, label: "1 Pouch", discount: 0, note: "20 cups" },
  { id: "2", qty: 2, label: "2 Pouches", discount: 0.1, note: "Save 10%", popular: true },
  { id: "4", qty: 4, label: "4 Pouches", discount: 0.15, note: "Save 15% + free shipping" },
];
export const SUBSCRIBE_DISCOUNT = 0.15;

export const trust = [
  { icon: "coffee", label: "Caffeine Free" },
  { icon: "leaf", label: "No Preservatives" },
  { icon: "seal", label: "FSSAI Approved" },
  { icon: "hand", label: "Made in Small Batches" },
];

export const ingredients = [
  { name: "Jujube", chinese: "Hong Zao · 红枣", image: ingJujube, line: "A naturally sweet red date, long used in TCM kitchens to nourish and warm." },
  { name: "Snow Fungus", chinese: "Yin Er · 银耳", image: ingSnow, line: "A delicate mushroom traditionally prized for its hydrating, silky texture." },
  { name: "Goji Berry", chinese: "Gou Qi · 枸杞", image: ingGoji, line: "Bright berries traditionally enjoyed as part of a daily radiance ritual." },
  { name: "Ginger", chinese: "Sheng Jiang · 生姜", image: ingGinger, line: "Optional warmth, traditionally used to support comfortable digestion." },
];

export const ritualWeeks = [
  { week: "Week 1", title: "Begin softly", text: "One warm cup each morning, before breakfast or with it. Notice the taste and the pause it brings." },
  { week: "Week 2", title: "Make it yours", text: "Add an afternoon cup in place of your usual chai or coffee. Keep water close through the day." },
  { week: "Week 3", title: "Settle the ritual", text: "Pair your evening cup with a calm wind-down. By now it is simply part of your day." },
];

export const comparison = {
  columns: ["SkinFusion", "Regular herbal tea", "Beauty supplements"],
  rows: [
    { label: "Whole ingredients", values: [true, false, false] },
    { label: "Caffeine free", values: [true, true, true] },
    { label: "No capsules or powders", values: [true, true, false] },
    { label: "A calming daily ritual", values: [true, true, false] },
    { label: "Naturally sweet taste", values: [true, false, false] },
  ],
};

export const brewSteps = [
  { n: "01", title: "Place a bag in your cup", text: "One tea bag in a glass or ceramic cup.", image: brew1 },
  { n: "02", title: "Pour hot water", text: "250ml of water just off the boil.", image: brew2 },
  { n: "03", title: "Steep 5 to 7 minutes", text: "Watch it turn golden, then sip slowly.", image: brew3 },
];

export const reviews = {
  average: 4.8,
  total: 312,
  bars: [
    { stars: 5, pct: 84 },
    { stars: 4, pct: 11 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ],
  items: [
    { name: "Ananya R.", city: "Bengaluru", rating: 5, text: "It tastes like the jujube tea my grandmother made. My morning cup is now the calmest part of my day." },
    { name: "Priya S.", city: "Mumbai", rating: 5, text: "Naturally sweet, no sugar needed. I swapped my second chai for this and I do not miss it." },
    { name: "Meera K.", city: "Pune", rating: 4, text: "Lovely, gentle flavour. The packaging is so pretty it sits out on my counter." },
    { name: "Ritika G.", city: "Delhi", rating: 5, text: "I drink it after dinner and it feels very settling. Ordering the 4-pouch pack next." },
    { name: "Kavya N.", city: "Hyderabad", rating: 5, text: "Finally a beauty ritual that is just a cup of tea. Simple and delicious." },
  ],
  photos: [brew3, hero2, ritual, ingGoji],
};

export const instagram = [hero1, brew3, ritual, ingJujube, hero2, journal3];

export const journal = [
  { title: "The TCM way to glowing skin", tag: "Tradition", image: hero1, read: "5 min read" },
  { title: "Snow fungus: the beauty mushroom", tag: "Ingredients", image: ingSnow, read: "4 min read" },
  { title: "An evening tea ritual for calmer skin", tag: "Ritual", image: journal3, read: "6 min read" },
];

export const footer = {
  columns: [
    { title: "Shop", links: ["Skin Glow Tea", "Bundles", "Subscribe & Save", "Gift Cards"] },
    { title: "Help", links: ["Shipping", "Returns", "Track Order", "Contact"] },
    { title: "About", links: ["Our Story", "Ingredients", "Journal", "Skin Quiz"] },
  ],
  legal: "© 2026 SkinFusion. This product is not intended to diagnose, treat, cure or prevent any disease.",
};

export const quiz = [
  { q: "How does your skin usually feel by evening?", options: ["Tight or dry", "Dull and tired", "Balanced", "A little of everything"] },
  { q: "How much water do you drink on a typical day?", options: ["Less than 4 glasses", "4 to 6 glasses", "7 to 8 glasses", "More than 8"] },
  { q: "How many cups of coffee or chai do you have?", options: ["None", "One", "Two or three", "Four or more"] },
  { q: "When would a calming tea fit best?", options: ["Morning", "Afternoon", "After dinner", "Whenever I can"] },
];
