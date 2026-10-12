// All storefront content lives here: product data (until Shopify is connected) and the
// marketing copy. Images set to null render as a soft beige placeholder with a label.
import type { Money, Product, ProductVariant, ShopifyImage } from "@/lib/shopify/types";
import ritual from "@/assets/ritual.jpg";
import ingSnow from "@/assets/ing-snowfungus.jpg";
import ingJujube from "@/assets/ing-jujube.jpg";
import ingGoji from "@/assets/ing-goji.jpg";
import ingGinger from "@/assets/ing-ginger.jpg";
import brew3 from "@/assets/brew-3.jpg";

// Used by the sign-in page. Homepage media lives in src/data/media.ts.
export const images = { ritual };

export const brand = {
  name: "SkinFusion",
  tagline: "Sip. Glow. Repeat.",
  city: "Mumbai, India",
  whatsapp: "https://wa.me/910000000000",
  instagram: "https://instagram.com/skinfusion",
};

// Floating pill nav. `main` sits in the left pill on desktop; `more` is added in the mobile
// menu and the footer. `cta` is the filled pill on the right.
export const nav = {
  main: [
    { label: "Shop", href: "/#shop" },
    { label: "Ingredients", href: "/#ingredients" },
    { label: "Learn", href: "/#learn" },
  ],
  more: [
    { label: "Stories", href: "/#stories" },
    { label: "Real results", href: "/real-results" },
    { label: "Skin quiz", href: "/quiz" },
  ],
  cta: { label: "Get started", href: "/quiz" },
};

export const FREE_SHIPPING_THRESHOLD = 699;

export const hero = {
  title: "Glow from within, one cup at a time.",
  line: "Jujube, snow fungus and goji, brewed whole into a caffeine-free cup for your daily ritual.",
  quizCta: { label: "Take the quiz", href: "/quiz" },
  shopCta: { label: "Shop now", href: "/#shop" },
};

/* ---------------------------------------------------------------------------
   PRODUCTS (local stand-in for Shopify)
   Shaped like the Shopify Storefront API (see src/lib/shopify/types.ts). Components never
   import these directly: they go through getProducts() / getProduct(handle) in
   src/lib/shopify/products.ts, which is the one place to switch to live Shopify data.
   Prices are decimal strings like Shopify returns them. "images: []" shows a placeholder.
--------------------------------------------------------------------------- */

export const FEATURED_PRODUCT_HANDLE = "skin-glow-tea";

const inr = (amount: string): Money => ({ amount, currencyCode: "INR" });

// The pouch photo (src/assets/skinfusion-pouch.jpg) is still missing: the old file is only a
// pointer to the previous site builder. Until it arrives, the product shows the brewed cup.
const brewImage: ShopifyImage = {
  url: brew3,
  altText: "A cup of Skin Glow Tea with whole jujubes and goji",
  width: 1024,
  height: 1024,
};

// Single-variant products: Shopify gives these one variant titled "Default Title".
const singleVariant = (handle: string, price: string, compareAt: string): ProductVariant[] => [
  {
    id: `local-variant:${handle}:1`,
    title: "1 Pouch",
    availableForSale: true,
    price: inr(price),
    compareAtPrice: inr(compareAt),
    selectedOptions: [{ name: "Pack", value: "1 Pouch" }],
    note: null,
  },
];

export const localProducts: Product[] = [
  {
    id: "local-product:skin-glow-tea",
    handle: "skin-glow-tea",
    title: "TCM Edition Skin Glow Tea",
    description:
      "A gentle caffeine-free blend of jujubes, snow fungus and goji berries, with a warm hint of ginger. Traditionally used to support digestive and skin wellness.",
    tags: ["best-seller"],
    featuredImage: brewImage,
    images: [brewImage],
    priceRange: { minVariantPrice: inr("649.00") },
    compareAtPriceRange: { minVariantPrice: inr("799.00") },
    subtitle: "20 tea bags · 100g",
    rating: { value: 4.8, count: 1024 },
    // Pack prices: 1 x 649, 2 x 649 less 10%, 4 x 649 less 15%
    variants: [
      {
        id: "local-variant:skin-glow-tea:1",
        title: "1 Pouch",
        availableForSale: true,
        price: inr("649.00"),
        compareAtPrice: inr("799.00"),
        selectedOptions: [{ name: "Pack", value: "1 Pouch" }],
        note: null,
      },
      {
        id: "local-variant:skin-glow-tea:2",
        title: "2 Pouches",
        availableForSale: true,
        price: inr("1168.20"),
        compareAtPrice: inr("1598.00"),
        selectedOptions: [{ name: "Pack", value: "2 Pouches" }],
        note: "10% off",
      },
      {
        id: "local-variant:skin-glow-tea:4",
        title: "4 Pouches",
        availableForSale: true,
        price: inr("2206.60"),
        compareAtPrice: inr("3196.00"),
        selectedOptions: [{ name: "Pack", value: "4 Pouches" }],
        note: "15% off + free shipping",
      },
    ],
  },
  {
    id: "local-product:calm-night",
    handle: "calm-night",
    title: "Calm Night Blend",
    description: "",
    tags: [],
    featuredImage: null,
    images: [],
    priceRange: { minVariantPrice: inr("599.00") },
    compareAtPriceRange: { minVariantPrice: inr("699.00") },
    subtitle: null,
    rating: { value: 4.7, count: 214 },
    variants: singleVariant("calm-night", "599.00", "699.00"),
  },
  {
    id: "local-product:gut-balance",
    handle: "gut-balance",
    title: "Gut Balance Tea",
    description: "",
    tags: [],
    featuredImage: null,
    images: [],
    priceRange: { minVariantPrice: inr("599.00") },
    compareAtPriceRange: { minVariantPrice: inr("699.00") },
    subtitle: null,
    rating: { value: 4.6, count: 187 },
    variants: singleVariant("gut-balance", "599.00", "699.00"),
  },
  {
    id: "local-product:glow-bundle",
    handle: "glow-bundle",
    title: "Glow Ritual Bundle",
    description: "",
    tags: ["label:Save 10%"],
    featuredImage: null,
    images: [],
    priceRange: { minVariantPrice: inr("1499.00") },
    compareAtPriceRange: { minVariantPrice: inr("1799.00") },
    subtitle: null,
    rating: { value: 4.9, count: 96 },
    variants: singleVariant("glow-bundle", "1499.00", "1799.00"),
  },
];

/* ---------------------------------------------------------------------------
   MARKETING COPY (stays here after Shopify is connected)
--------------------------------------------------------------------------- */

// Sample customer quotes for the client preview. isDemo: true means the quote is invented
// and must be replaced with a real, permitted customer quote before launch.
export type StoryQuote = { text: string; name: string; city: string; isDemo: boolean };

export const home = {
  products: {
    title: "Daily rituals for radiant skin",
    from: "From",
    cta: "Add to cart",
  },
  bundle: {
    title: "Bundle and save",
    text: "Two or four pouches of Skin Glow Tea, so your ritual never runs out. Save up to 15%, with free shipping on the four-pack.",
    cta: "Add 4 pouches",
    handle: "skin-glow-tea",
    variantTitle: "4 Pouches",
  },
  howItWorks: {
    title: "Four whole ingredients, brewed into a daily ritual.",
    // Counters: only true facts. The number counts up from 0 when it scrolls into view.
    facts: [
      { value: "4", label: "whole ingredients" },
      { value: "0", label: "preservatives" },
      { value: "0", label: "caffeine" },
    ],
    columns: [
      {
        title: "What goes in",
        text: "Jujube, snow fungus and goji berries, with a little ginger for warmth. Every piece stays whole, so you can see what you are drinking: no tea dust, no flavourings, no added colour.",
      },
      {
        title: "How it fits your day",
        text: "Steep one bag in hot water for about five minutes. In Traditional Chinese Medicine these ingredients are traditionally used to support skin and digestive wellness as part of a calm routine.",
      },
    ],
  },
  tcm: {
    title: "Ancient wisdom, modern ritual",
    text: "For generations, Traditional Chinese Medicine kitchens have simmered jujube, snow fungus and goji together. We keep the ingredients whole and the method simple, so the ritual fits a busy morning.",
    cta: { label: "Discover", href: "/real-results" },
    play: "Play",
    videoTitle: "How a cup of Skin Glow Tea comes together",
  },
  stories: {
    title: "Stories from tea makers, skin lovers and members like you.",
    play: "Play",
    quotes: [
      {
        text: "It tastes like the jujube tea my grandmother made. My evening cup is the calmest part of my day.",
        name: "Ananya",
        city: "Bengaluru",
        isDemo: true,
      },
      {
        text: "I swapped my second chai for it. Light, warm and easy to make at work.",
        name: "Priya",
        city: "Mumbai",
        isDemo: true,
      },
      {
        text: "You can see every whole piece in the bag. Naturally sweet, no sugar needed.",
        name: "Meera",
        city: "Pune",
        isDemo: true,
      },
    ] as StoryQuote[],
    videoCaptions: ["My morning routine", "Ten quiet minutes", "Windows open, kettle on"],
  },
  // Origin details are DEMO copy until the client confirms where each ingredient comes from.
  sourcing: {
    isDemo: true,
    location: "Xinjiang, China",
    title: "Where our jujubes ripen",
    text: "Long, dry summers and cool nights let the dates sweeten slowly on the tree before they are sun-dried. Our goji berries and snow fungus come from small family farms we taste from every season.",
    cta: { label: "Read more", href: "/real-results" },
  },
  closing: {
    title: "Start your glow ritual",
    line: "One warm cup a day. Free shipping on orders above ₹699.",
    cta: { label: "Shop now", href: "/#shop" },
  },
};

export type FooterLink = { label: string; href?: string };

export const footer: {
  mission: string;
  newsletter: { title: string; consent: string };
  columns: { title: string; links: FooterLink[] }[];
  legal: string;
  disclaimer: string;
} = {
  mission: "Whole TCM ingredients, brewed into a calm daily cup. Made in Mumbai.",
  newsletter: {
    title: "Get 10% off your first order",
    consent:
      "By subscribing you agree to receive emails from SkinFusion. Unsubscribe any time. We never share your email.",
  },
  // Links without href have no page yet and render as plain text until one exists.
  columns: [
    {
      title: "Shop",
      links: [
        { label: "Skin Glow Tea", href: "/#shop" },
        { label: "Bundles", href: "/#bundle" },
        { label: "Skin quiz", href: "/quiz" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Ingredients", href: "/#ingredients" },
        { label: "TCM 101", href: "/#learn" },
        { label: "Real results", href: "/real-results" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "FAQs" },
        { label: "Shipping & returns" },
        { label: "Contact us", href: brand.whatsapp },
      ],
    },
    {
      title: "Social",
      links: [
        { label: "Instagram", href: brand.instagram },
        { label: "WhatsApp", href: brand.whatsapp },
      ],
    },
    {
      title: "Legal",
      links: [{ label: "Privacy policy" }, { label: "Terms of service" }],
    },
  ],
  legal: "© 2026 SkinFusion. All rights reserved.",
  disclaimer:
    "Our teas are food products and are not intended to diagnose, treat, cure or prevent any disease. Individual experiences vary.",
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
