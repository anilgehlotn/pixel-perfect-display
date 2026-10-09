// All storefront content lives here so a backend or Shopify can replace it later.
// Images set to null render as a soft beige placeholder with a label.
import pouch from "@/assets/skinfusion-pouch.jpg.asset.json";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import ritual from "@/assets/ritual.jpg";
import ingSnow from "@/assets/ing-snowfungus.jpg";
import ingJujube from "@/assets/ing-jujube.jpg";
import ingGoji from "@/assets/ing-goji.jpg";
import ingGinger from "@/assets/ing-ginger.jpg";
import brew3 from "@/assets/brew-3.jpg";
import journal3 from "@/assets/journal-3.jpg";

export const images = { pouch: pouch.url, hero: hero1, hero2, ritual, inside: ritual };

export const brand = {
  name: "SkinFusion",
  tagline: "Sip. Glow. Repeat.",
  city: "Mumbai, India",
  whatsapp: "https://wa.me/910000000000",
  instagram: "https://instagram.com/skinfusion",
};

export const announcement = [
  "Free shipping on orders above ₹699",
  "Loved by 1,000+ customers",
  "100% natural ingredients",
];

export const nav = {
  main: [
    { label: "Shop All", href: "/#shop" },
    { label: "Best Sellers", href: "/#featured" },
    { label: "Real Results", href: "/real-results" },
  ],
  explore: [
    { label: "Our Story", href: "/#mission" },
    { label: "Ingredients", href: "/#inside" },
    { label: "Journal", href: "/#journal" },
    { label: "Skin Quiz", href: "/quiz" },
  ],
};

export const FREE_SHIPPING_THRESHOLD = 699;

export const hero = {
  kicker: "A warm, hydrating cup for your daily ritual.",
  title: "Sip. Glow. Repeat.",
  cta: "Shop best seller",
  quizCta: "Take the skin quiz",
};

export const product = {
  id: "skin-glow-tea",
  name: "TCM Edition Skin Glow Tea",
  short: "Skin Glow Tea",
  size: "20 tea bags · 100g",
  price: 649,
  mrp: 799,
  rating: 4.8,
  reviewCount: 1024,
  description:
    "A gentle caffeine-free blend of jujubes, snow fungus and goji berries, with a warm hint of ginger. Traditionally used to support digestive and skin wellness.",
};

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image: string | null;
  hoverImage: string | null;
  badge?: "Best Seller";
  tag?: string;
};

export const products: Product[] = [
  {
    id: "skin-glow-tea",
    name: "TCM Edition Skin Glow Tea",
    price: 649,
    mrp: 799,
    rating: 4.8,
    reviews: 1024,
    image: pouch.url,
    hoverImage: brew3,
    badge: "Best Seller",
  },
  {
    id: "calm-night",
    name: "Calm Night Blend",
    price: 599,
    mrp: 699,
    rating: 4.7,
    reviews: 214,
    image: null,
    hoverImage: null,
  },
  {
    id: "gut-balance",
    name: "Gut Balance Tea",
    price: 599,
    mrp: 699,
    rating: 4.6,
    reviews: 187,
    image: null,
    hoverImage: null,
  },
  {
    id: "glow-bundle",
    name: "Glow Ritual Bundle",
    price: 1499,
    mrp: 1799,
    rating: 4.9,
    reviews: 96,
    image: null,
    hoverImage: null,
    tag: "Save 10%",
  },
];

export const packs = [
  { id: "1", qty: 1, label: "1 Pouch", discount: 0, note: "" },
  { id: "2", qty: 2, label: "2 Pouches", discount: 0.1, note: "10% off" },
  { id: "4", qty: 4, label: "4 Pouches", discount: 0.15, note: "15% off + free shipping" },
];

export const inside = {
  kicker: "A daily cup for calm, glowing skin",
  title: "What's inside Skin Glow Tea?",
  items: [
    {
      name: "Jujube",
      line: "A naturally sweet red date, long used in TCM kitchens to nourish and warm.",
    },
    {
      name: "Snow fungus",
      line: "A delicate mushroom traditionally prized for its silky, hydrating texture.",
    },
    {
      name: "Goji berry",
      line: "Bright berries traditionally enjoyed as part of a daily radiance ritual.",
    },
    {
      name: "Ginger (optional)",
      line: "Gentle warmth, traditionally used to support comfortable digestion.",
    },
  ],
};

export const comparison = {
  title: "No artificial anything, no dust, no shortcuts",
  columns: ["SkinFusion", "Ordinary tea bags"],
  rows: [
    { label: "Whole ingredients", values: [true, false] },
    { label: "No tea dust", values: [true, false] },
    { label: "No preservatives", values: [true, false] },
    { label: "Caffeine free", values: [true, false] },
    { label: "No added color", values: [true, false] },
  ],
};

export const standards = [
  { label: "100% Hand Picked", icon: "hand", tone: "peach" },
  { label: "Sustainably Sourced", icon: "plant", tone: "pink" },
  { label: "Small Family Farms", icon: "house", tone: "blue" },
  { label: "Vegan", icon: "leaf", tone: "green" },
  { label: "No Preservatives", icon: "drop", tone: "orange" },
  { label: "Glow Promise", icon: "sun", tone: "yellow" },
] as const;

export const mission =
  "We bring the quiet wisdom of traditional Chinese wellness rituals into modern Indian life. Whole jujubes, snow fungus and goji, gently blended into a cup you can make in five minutes, between meetings, after school runs, or before bed. Nothing loud. Just a daily pause that feels good to return to.";

export const reviews = {
  average: 4.8,
  totalLabel: "Based on 1,000+ reviews",
  recommend: "95% would recommend",
  bars: [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 13 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ],
  items: [
    {
      name: "Ananya R.",
      city: "Bengaluru",
      rating: 5,
      title: "My calm morning cup",
      text: "It tastes like the jujube tea my grandmother made. Naturally sweet, no sugar needed.",
    },
    {
      name: "Priya S.",
      city: "Mumbai",
      rating: 5,
      title: "Swapped my second chai",
      text: "I drink it every afternoon now instead of chai. Light, warm and easy to make at work.",
    },
    {
      name: "Ritika G.",
      city: "Delhi",
      rating: 4,
      title: "Lovely evening ritual",
      text: "Very settling after dinner. The pouch is beautiful and the tea bags hold whole pieces.",
    },
  ],
};

export const journal = {
  kicker: "Rituals, ingredients + wellness",
  title: "Learn, sip + glow",
  items: [
    {
      title: "The TCM way to glowing skin",
      tag: "Tradition",
      image: hero2,
      excerpt:
        "How centuries-old kitchen remedies shaped a gentle approach to everyday skin care, one cup at a time.",
    },
    {
      title: "Snow fungus: the beauty mushroom",
      tag: "Ingredients",
      image: ingSnow,
      excerpt:
        "Meet the silky mushroom that has been simmered into Chinese dessert soups for generations.",
    },
    {
      title: "An evening tea ritual for calmer skin",
      tag: "Ritual",
      image: journal3,
      excerpt: "A five-minute wind-down routine with a warm cup, soft light and no screens.",
    },
  ],
};

export type FooterLink = { label: string; href?: string };

export const footer: {
  menu: FooterLink[];
  support: FooterLink[];
  join: FooterLink[];
  legal: string;
  disclaimer: string;
} = {
  // Links without href have no page yet and render as plain text until one exists.
  menu: [
    { label: "Shop All", href: "/#shop" },
    { label: "Blog", href: "/#journal" },
    { label: "Our Story", href: "/#mission" },
  ],
  support: [
    { label: "FAQs" },
    { label: "Contact Us", href: brand.whatsapp },
    { label: "Shipping & Returns" },
  ],
  join: [{ label: "Wholesale" }, { label: "Creators & Affiliates" }],
  legal: "© 2026 SkinFusion. All rights reserved.",
  disclaimer:
    "Our teas are food products and are not intended to diagnose, treat, cure or prevent any disease.",
};

/* /real-results page. Photos and videos are placeholders until real customer
   content arrives: set image/poster/video to null to show the labelled box. */
export const realResults = {
  hero: {
    kicker: "Real people. Real rituals.",
    title: "The glow, in their words",
    line: "Unfiltered stories from customers who made SkinFusion part of their day.",
    ctaResults: "See results",
    ctaStories: "Watch stories",
  },
  gallery: {
    title: "Before & After",
    filters: ["All", "2 weeks", "4 weeks", "8 weeks"],
    items: [
      {
        name: "Priya",
        age: 28,
        city: "Bengaluru",
        weeks: 4,
        duration: "4 weeks, 1 cup daily",
        quote: "My skin feels calmer and I look forward to my evening cup.",
        before: null,
        after: null,
      },
      {
        name: "Ananya",
        age: 34,
        city: "Mumbai",
        weeks: 8,
        duration: "8 weeks, 1 cup daily",
        quote: "Six weeks in, my evening cup is the calmest part of my day.",
        before: null,
        after: null,
      },
      {
        name: "Ritika",
        age: 26,
        city: "Delhi",
        weeks: 2,
        duration: "2 weeks, 1 cup daily",
        quote: "It replaced my second chai and my afternoons feel lighter.",
        before: null,
        after: null,
      },
      {
        name: "Meera",
        age: 41,
        city: "Pune",
        weeks: 8,
        duration: "8 weeks, 1 cup daily",
        quote: "A small ritual that stuck. My skin feels more hydrated.",
        before: null,
        after: null,
      },
      {
        name: "Sana",
        age: 30,
        city: "Hyderabad",
        weeks: 4,
        duration: "4 weeks, 1 cup daily",
        quote: "Naturally sweet, no sugar, and my skin feels softer.",
        before: null,
        after: null,
      },
      {
        name: "Kavya",
        age: 24,
        city: "Chennai",
        weeks: 2,
        duration: "2 weeks, 1 cup daily",
        quote: "Naturally sweet with a soft ginger warmth. My morning cup is a habit now.",
        before: null,
        after: null,
      },
    ] as {
      name: string;
      age: number;
      city: string;
      weeks: number;
      duration: string;
      quote: string;
      before: string | null;
      after: string | null;
    }[],
    disclaimer:
      "Shared with permission by SkinFusion customers. Individual results vary. Photos are unedited.",
  },
  videos: {
    title: "Watch their stories",
    items: [
      {
        name: "Priya",
        city: "Bengaluru",
        caption: "My 4-week evening ritual",
        poster: null,
        video: null,
        youtube: null,
      },
      {
        name: "Ananya",
        city: "Mumbai",
        caption: "Why I swapped my second chai",
        poster: null,
        video: null,
        youtube: null,
      },
      {
        name: "Ritika",
        city: "Delhi",
        caption: "One cup before bed",
        poster: null,
        video: null,
        youtube: null,
      },
      {
        name: "Meera",
        city: "Pune",
        caption: "8 weeks of SkinFusion",
        poster: null,
        video: null,
        youtube: null,
      },
      {
        name: "Sana",
        city: "Hyderabad",
        caption: "My morning glow routine",
        poster: null,
        video: null,
        youtube: null,
      },
      {
        name: "Kavya",
        city: "Chennai",
        caption: "A calm pause in my day",
        poster: null,
        video: null,
        youtube: null,
      },
    ] as {
      name: string;
      city: string;
      caption: string;
      poster: string | null;
      video: string | null;
      youtube: string | null;
    }[],
  },
  serum: {
    kicker: "Inside-out vs on-the-skin",
    title: "Serums or real ingredients?",
    left: {
      title: "Topical serums",
      points: [
        "Work on the skin's surface",
        "Applied 1–2 times a day",
        "Often many ingredients and preservatives",
        "Cost per month: coming soon",
      ],
    },
    right: {
      title: "SkinFusion tea",
      points: [
        "Whole ingredients you can see: jujube, snow fungus, goji, ginger",
        "Part of a daily drinking ritual",
        "A hydrating daily ritual",
        "Caffeine free, no preservatives",
        "Cost per cup: coming soon",
      ],
    },
    table: {
      columns: ["Serums", "SkinFusion"],
      rows: [
        { label: "How it works", values: ["On the skin's surface", "As a warm daily cup"] },
        { label: "Ingredients", values: ["Often long lists", "4 whole ingredients"] },
        { label: "Daily routine", values: ["Apply 1–2 times", "One enjoyable cup"] },
        { label: "Preservatives", values: [false, true] },
        { label: "Hydration", values: ["Surface only", "A hydrating daily cup"] },
        { label: "Cost per day", values: ["Coming soon", "Coming soon"] },
      ] as { label: string; values: (string | boolean)[] }[],
    },
    closing: "Many of our customers use both: serum on the outside, SkinFusion on the inside.",
  },
  spotlight: {
    title: "Ingredient spotlight",
    items: [
      { name: "Jujube", image: ingJujube, line: "Traditionally used to nourish and warm." },
      {
        name: "Snow fungus",
        image: ingSnow,
        line: "Traditionally prized for its silky, hydrating texture.",
      },
      {
        name: "Goji berry",
        image: ingGoji,
        line: "Traditionally enjoyed in daily radiance rituals.",
      },
      {
        name: "Ginger",
        image: ingGinger,
        line: "Traditionally used to support comfortable digestion.",
      },
    ],
  },
  share: {
    title: "Share your glow story",
    text: "Been sipping SkinFusion? Send us your photos and videos — we'd love to feature your ritual here.",
    cta: "Submit your story",
    success: "Thank you for sharing. We'll be in touch soon.",
  },
  finalCta: { title: "Start your glow ritual" },
  disclaimer:
    "SkinFusion is a herbal tea, not a medicine. Results shown are individual customer experiences and may vary. Consult a doctor for any skin or health condition.",
};

// Kept for the /quiz page
export const quiz = [
  {
    q: "How does your skin usually feel by evening?",
    options: ["Tight or dry", "Dull and tired", "Balanced", "A little of everything"],
  },
  {
    q: "How much water do you drink on a typical day?",
    options: ["Less than 4 glasses", "4 to 6 glasses", "7 to 8 glasses", "More than 8"],
  },
  {
    q: "How many cups of coffee or chai do you have?",
    options: ["None", "One", "Two or three", "Four or more"],
  },
  {
    q: "When would a calming tea fit best?",
    options: ["Morning", "Afternoon", "After dinner", "Whenever I can"],
  },
];
