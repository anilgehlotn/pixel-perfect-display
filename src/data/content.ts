// All site content lives here: product data and the marketing copy. Images set to null render as a soft beige placeholder with a label.
import type { Money, Product, ProductVariant, ProductPhoto } from "@/lib/catalog/types";
import ritual from "@/assets/ritual.jpg";
import ingSnow from "@/assets/ing-snowfungus.jpg";
import ingJujube from "@/assets/ing-jujube.jpg";
import ingGoji from "@/assets/ing-goji.jpg";
import ingGinger from "@/assets/ing-ginger.jpg";
import brew3 from "@/assets/brew-3.jpg";
import brew3Webp from "@/assets/web/brew-3-800.webp";

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
// Delivery charge below the free-shipping threshold (rupees). Confirm with the client.
export const SHIPPING_FEE = 79;

// Homepage hero: one full-width photo (media.hero.image), a centred headline and one button.
// Plain words, no result promises.
export const hero = {
  kicker: "Edible skin care",
  title: "Skin care you drink.",
  line: "Serums stay on the surface. SkinFusion teas are made from four whole foods, for your skin from the inside.",
  shopCta: { label: "Shop edible skin care", href: "/#shop" },
  quizCta: { label: "Take the quiz", href: "/quiz" },
  ratingLabel: "reviews",
  from: "From",
  // The two worlds. The big word swaps where the divider cuts through it.
  compare: {
    prefix: "Skin care you",
    left: {
      word: "apply.",
      tag: "On your face",
      text: "Serums stay on the outer layer of your skin.",
      facts: ["Outer layer only", "Twice a day"],
      name: "Serum",
    },
    right: {
      word: "drink.",
      tag: "In your cup",
      text: "Food is carried by your blood to the deeper layers.",
      facts: ["4 whole foods", "0 sugar", "0 caffeine"],
      name: "SkinFusion",
    },
    // The small cue at the bottom of the hero at rest.
    scrollCue: "Scroll",
  },
};

// Moving strip under the hero (desktop moves, phones show it still).
export const ingredientStrip = [
  "Jujube 红枣",
  "Snow fungus 银耳",
  "Goji berry 枸杞",
  "Ginger 生姜",
  "No added sugar",
  "Caffeine free",
  "Nothing artificial",
];

// The skin-layers drawing (hero slide 2 and the "How it works" section). The idea is the
// brand's belief, written without result promises; the client should confirm this wording.
export const skinLayers = {
  label: "How cream and food reach your skin",
  layers: ["Outer layer", "Middle layer", "Deep layer"],
  cream: "Cream stays on top",
  food: "Food travels in your blood",
  cup: "One cup a day",
};

export const howItWorks = {
  eyebrow: "The idea",
  hint: "Choose a step to see it in the drawing",
  title: "Why we make skin care you eat",
  text: "Your skin has layers. Creams and serums are applied to the outer one. Your blood reaches the deeper layers, and it carries what you eat and drink. So we put whole foods in a tea bag.",
  points: [
    { title: "Creams and serums", text: "Applied to the outer layer of your skin." },
    { title: "Food", text: "Carried by your blood to the deeper layers." },
    {
      title: "SkinFusion",
      text: "Four whole foods, traditionally used in Chinese kitchens for the skin, in one cup a day.",
    },
  ],
  cta: { label: "Shop our teas", href: "/#shop" },
};

/* ---------------------------------------------------------------------------
   PRODUCTS
   Typed in src/lib/catalog/types.ts. Components never import these directly: they go
   through getProducts() / getProduct(handle) in src/lib/catalog/products.ts.
   Prices are decimal strings ("649.00"). "images: []" shows a placeholder.
--------------------------------------------------------------------------- */

export const FEATURED_PRODUCT_HANDLE = "skin-glow-tea";

const inr = (amount: string): Money => ({ amount, currencyCode: "INR" });

// The pouch photo (src/assets/skinfusion-pouch.jpg) is still missing: the old file is only a
// pointer to the previous site builder. Until it arrives, the product shows the brewed cup.
const brewImage: ProductPhoto = {
  url: brew3,
  webpUrl: brew3Webp,
  altText: "A cup of Skin Glow Tea with whole jujubes and goji",
  width: 1024,
  height: 1024,
};

// Single-variant products: one "1 Pouch" variant.
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
   MARKETING COPY
--------------------------------------------------------------------------- */

// Checkout (/checkout) and order confirmation (/order-confirmed).
export const checkoutCopy = {
  title: "Checkout",
  contact: "Contact",
  delivery: "Delivery address",
  summary: "Your order",
  fields: {
    name: "Full name",
    email: "Email",
    phone: "Mobile number",
    address1: "House number and street",
    address2: "Area, landmark (optional)",
    city: "City",
    state: "State",
    pin: "PIN code",
  },
  choose: "Choose",
  subtotal: "Subtotal",
  shipping: "Delivery",
  free: "Free",
  total: "Total",
  pay: "Pay",
  paying: "Opening payment...",
  testPay: "Test payment (local only)",
  off: "Online payment opens soon.",
  secure:
    "Payments are encrypted and processed securely. UPI, cards, net banking and wallets accepted.",
  empty: "Your cart is empty.",
  emptyCta: "Shop our teas",
  failed: "The payment did not go through. You have not been charged. Please try again.",
  fixErrors: "Please check the highlighted fields.",
  confirmed: {
    title: "Thank you, your order is placed",
    text: "We have received your payment. A confirmation will reach your email shortly, and we will message you when your order ships.",
    reference: "Order reference",
    cta: "Continue shopping",
  },
};

// Sample customer quotes for the client preview. isDemo: true means the quote is invented
// and must be replaced with a real, permitted customer quote before launch.
export type StoryQuote = { text: string; name: string; city: string; isDemo: boolean };

export const home = {
  products: {
    eyebrow: "The collection",
    title: "Our teas",
    text: "Whole-food blends for every part of the day. Start with one pouch, or save with a pack.",
    swipe: "Swipe to see all",
    from: "From",
    cta: "Add to cart",
    added: "Added",
  },
  // Results section (replaces the old bundle block): one before/after slider per customer,
  // with their real photos from media.results.
  // isDemo quotes are invented for the preview: replace with real, permitted ones.
  results: {
    eyebrow: "Real results",
    title: "In our customers' own words",
    text: "Drag each photo to compare before and after. Every photo is shared by the customer, with permission.",
    cta: { label: "See all stories", href: "/real-results" },
    weeksLabel: "weeks of daily cups",
    items: [
      {
        quote:
          "Four weeks in, my evening cup is a habit I look forward to. It feels like looking after myself.",
        name: "Ritika",
        city: "Delhi",
        weeks: 4,
        rating: 5,
        isDemo: true,
      },
      {
        quote: "Naturally sweet, no sugar needed. I make it every morning before work now.",
        name: "Sneha",
        city: "Pune",
        weeks: 6,
        rating: 5,
        isDemo: true,
      },
      {
        quote:
          "I love that I can see every whole ingredient in the bag. My skin routine finally includes my diet.",
        name: "Kavya",
        city: "Hyderabad",
        weeks: 8,
        rating: 5,
        isDemo: true,
      },
    ],
  },
  howItWorks: {
    title: "Four whole ingredients. Nothing added.",
    text: "Jujube, snow fungus and goji berries, with a little ginger for warmth. Every piece stays whole, so you can see what you are drinking: no tea dust, no flavourings, no added colour.",
    // Facts: only true ones. The number counts up from 0 when it scrolls into view.
    facts: [
      { value: "4", label: "whole ingredients" },
      { value: "0", label: "preservatives" },
      { value: "0", label: "caffeine" },
    ],
    steps: {
      title: "How to make it",
      step: "Step",
      items: ["One tea bag", "Hot water", "About five minutes"],
      note: "In Traditional Chinese Medicine, these ingredients are traditionally used to support the skin and digestion.",
    },
    cta: { label: "See Skin Glow Tea", href: "/products/skin-glow-tea" },
  },
  tcm: {
    title: "Why food, not serums",
    text: "In Chinese homes, jujube, snow fungus and goji have been cooked together for generations as food for the skin. We keep them whole and put them in a tea bag, so you can make a cup at home or at work.",
    cta: { label: "Read customer stories", href: "/real-results" },
    play: "Play",
    videoTitle: "How a cup of Skin Glow Tea comes together",
  },
  stories: {
    title: "What our customers say",
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
    eyebrow: "From the orchard",
    originLabel: "Origin",
    location: "Xinjiang, China",
    coordinates: "41° N, 85° E",
    title: "Where our jujubes grow",
    text: "Long, dry summers and cool nights let the dates sweeten slowly on the tree before they are sun-dried. Our goji berries and snow fungus come from small family farms we taste from every season.",
    journey: [
      { title: "On the tree", text: "Long summers sweeten the dates slowly." },
      { title: "Sun-dried", text: "Dried whole in the open air." },
      { title: "In your cup", text: "Packed whole, with nothing added." },
    ],
    cta: { label: "See all four ingredients", href: "/#ingredients" },
  },
  closing: {
    title: "Try it for yourself",
    line: "One cup a day, made from four whole foods. Start with a single pouch, or save with a pack.",
    trust: [
      { icon: "truck", text: "Free shipping on orders above ₹699" },
      { icon: "lock", text: "Secure payment by UPI, cards or net banking" },
      { icon: "leaf", text: "Caffeine free, with no added sugar" },
    ],
    from: "From",
    reviews: "reviews",
    save: "Save",
    add: "Add to cart",
    details: "View details",
  },
};

// Icons are Phosphor names, mapped in src/components/product/icons.tsx.
export type IconName =
  | "Leaf"
  | "Moon"
  | "Drop"
  | "Truck"
  | "Sparkle"
  | "Heart"
  | "Eye"
  | "ShieldCheck"
  | "Plant"
  | "YinYang"
  | "Flower"
  | "LockSimple";

export type Ingredient = {
  name: string;
  hanzi: string;
  pinyin: string;
  image: "jujube" | "snowFungus" | "goji" | "ginger";
  text: string;
  /** One short taste line for the homepage ingredient cards (no health claims). */
  taste: string;
};

// The four ingredients of Skin Glow Tea. Images come from media.ingredients (media.ts).
export const ingredients: Ingredient[] = [
  {
    name: "Jujube",
    hanzi: "红枣",
    pinyin: "hóng zǎo",
    image: "jujube",
    text: "The sweet heart of the blend. Red dates have been simmered in Chinese kitchens for centuries and are traditionally used to nourish and warm.",
    taste: "Naturally sweet, so no sugar is needed.",
  },
  {
    name: "Snow fungus",
    hanzi: "银耳",
    pinyin: "yín ěr",
    image: "snowFungus",
    text: "A delicate mushroom traditionally prized for its silky, hydrating texture, and a classic of the sweet beauty soups served across China.",
    taste: "Soft and silky in the cup.",
  },
  {
    name: "Goji berry",
    hanzi: "枸杞",
    pinyin: "gǒu qǐ",
    image: "goji",
    text: "Bright red berries with a light, fruity tartness, traditionally enjoyed as part of a daily radiance ritual.",
    taste: "Bright and lightly fruity.",
  },
  {
    name: "Ginger",
    hanzi: "生姜",
    pinyin: "shēng jiāng",
    image: "ginger",
    text: "A soft, rounded warmth that balances the sweetness. Traditionally used to support comfortable digestion.",
    taste: "A gentle, rounded warmth.",
  },
];

// Comparison table (homepage and product page). Claims about other products stay general
// and factual; the client should confirm this table before launch.
// Comparison table (homepage and product page). Claims about other products stay general
// and factual; the client should confirm this table before launch.
export const comparison = {
  eyebrow: "Why SkinFusion",
  title: "SkinFusion vs. the rest",
  text: "Most tea bags hold crushed leaf and flavourings. Ours hold four whole ingredients from a two-thousand-year-old tradition, and nothing else.",
  columns: ["SkinFusion", "Regular tea bags", "Beauty supplements"],
  ourTag: "Whole-food tea",
  compareWith: "Compare SkinFusion with",
  cta: { label: "See Skin Glow Tea", href: "/products/skin-glow-tea" },
  rows: [
    { label: "Whole ingredients you can see", values: [true, "Crushed leaf", "Pills or powder"] },
    { label: "Caffeine free", values: [true, "Usually not", "Varies"] },
    { label: "No added sugar or flavourings", values: [true, "Often flavoured", "Varies"] },
    { label: "Rooted in Traditional Chinese Medicine", values: [true, false, false] },
    { label: "A warm ritual you look forward to", values: [true, true, false] },
  ] as { label: string; values: (string | boolean)[] }[],
};

// Icon row ("Our standards"). True facts only.
export const standards: { icon: IconName; label: string }[] = [
  { icon: "Leaf", label: "Whole ingredients" },
  { icon: "Moon", label: "Caffeine free" },
  { icon: "Drop", label: "No added sugar" },
  { icon: "ShieldCheck", label: "No preservatives" },
  { icon: "Plant", label: "100% vegan" },
  { icon: "YinYang", label: "Rooted in TCM" },
];

// Customer quotes for the product page reviews block (the homepage uses home.stories).
export const reviews = {
  eyebrow: "Customers say",
  title: "What our customers say",
  quotes: [
    {
      title: "The calmest part of my day",
      text: "It tastes like the jujube tea my grandmother made. My evening cup is the calmest part of my day.",
      name: "Ananya",
      city: "Bengaluru",
      isDemo: true,
    },
    {
      title: "Replaced my second chai",
      text: "I swapped my second chai for it. Light, warm and easy to make at work.",
      name: "Priya",
      city: "Mumbai",
      isDemo: true,
    },
    {
      title: "You can see what is inside",
      text: "You can see every whole piece in the bag. Naturally sweet, no sugar needed.",
      name: "Meera",
      city: "Pune",
      isDemo: true,
    },
  ] as (StoryQuote & { title: string })[],
  verified: "Verified buyer",
};

/* ---------------------------------------------------------------------------
   PRODUCT PAGE (/products/$handle)
   Rich details per product handle. A product without an entry here shows the buy box,
   description, standards and reviews only (Calm Night, Gut Balance and the bundle until
   the client sends their ingredient lists).
--------------------------------------------------------------------------- */

export type ProductDetails = {
  tagline: string;
  /** Tea bags in one pouch, used for the "per cup" price. */
  cupsPerPouch: number;
  highlights: string[];
  loveIt: { title: string; text: string }[];
  benefits: { icon: IconName; title: string; text: string }[];
  ingredients: Ingredient[];
  steps: { title: string; text: string }[];
  taste: string;
  faqs: { q: string; a: string }[];
};

export const productDetails: Record<string, ProductDetails | undefined> = {
  "skin-glow-tea": {
    tagline: "A naturally sweet, caffeine-free cup for your daily skin ritual.",
    cupsPerPouch: 20,
    highlights: ["Caffeine free", "No added sugar", "No preservatives", "100% vegan"],
    loveIt: [
      {
        title: "Naturally sweet",
        text: "honeyed jujube with a light goji tartness, no sugar needed",
      },
      { title: "Four whole ingredients", text: "every piece kept whole, so you can see it" },
      { title: "Caffeine free", text: "morning, afternoon or the hour before bed" },
      { title: "Rooted in TCM", text: "a recipe Chinese kitchens have simmered for centuries" },
    ],
    benefits: [
      {
        icon: "Sparkle",
        title: "A skin ritual from the inside",
        text: "In Traditional Chinese Medicine, jujube, snow fungus and goji are traditionally used to support skin wellness. One warm cup a day turns that tradition into a habit that is easy to keep.",
      },
      {
        icon: "Drop",
        title: "Hydration you enjoy",
        text: "Every cup is warm water with whole ingredients, and snow fungus is traditionally prized for its silky, hydrating texture. A pleasant way to drink more through the day.",
      },
      {
        icon: "Leaf",
        title: "Gentle after meals",
        text: "Ginger is traditionally used to support comfortable digestion, which is why many customers keep their cup for after lunch or dinner.",
      },
      {
        icon: "Moon",
        title: "Calm, without caffeine",
        text: "Naturally caffeine free, so it fits a slow morning, a busy afternoon at your desk or the quiet hour before bed.",
      },
      {
        icon: "Heart",
        title: "Sweet, with no sugar added",
        text: "Jujubes give the cup a soft, honeyed sweetness. No added sugar, sweeteners, flavourings or colour, ever.",
      },
      {
        icon: "Eye",
        title: "Nothing hidden",
        text: "Whole pieces, not dust. Open a bag and you will see exactly what you are drinking: four ingredients and nothing else.",
      },
    ],
    ingredients,
    steps: [
      { title: "Place", text: "Put one tea bag in your favourite cup." },
      {
        title: "Pour",
        text: "Add 250 ml of hot water, just off the boil, and let it steep for about five minutes.",
      },
      {
        title: "Pause",
        text: "Sip slowly and enjoy a quiet moment. It is lovely over ice in summer too.",
      },
    ],
    taste:
      "Soft and honeyed from the jujube, with a bright note of goji and a gentle ginger warmth at the end.",
    faqs: [
      {
        q: "Does it contain caffeine?",
        a: "No. Skin Glow Tea is naturally caffeine free, so you can enjoy it at any time of day.",
      },
      {
        q: "What does it taste like?",
        a: "Naturally sweet from the jujubes, lightly fruity from the goji and gently warming from the ginger. Most people enjoy it without any sugar.",
      },
      {
        q: "How often should I drink it?",
        a: "Most customers enjoy one cup a day as part of their routine. It is a food product, so there is no strict rule.",
      },
      {
        q: "How long does one pouch last?",
        a: "Each pouch holds 20 tea bags: about three weeks at one cup a day. The 4-pouch pack covers nearly three months.",
      },
      {
        q: "Can I drink it if I am pregnant or taking medication?",
        a: "Skin Glow Tea is made from whole food ingredients, but if you are pregnant, nursing, taking medication or have a health condition, please check with your doctor first.",
      },
    ],
  },
};

// Labels and shared copy for every product page.
export const pdp = {
  breadcrumbShop: "Shop",
  pack: "Choose your pack",
  quantity: "Quantity",
  add: "Add to cart",
  soldOut: "Sold out",
  perCup: "per cup",
  save: "Save",
  loveIt: "Why you'll love it",
  accordions: {
    description: "Description",
    ingredients: "Ingredients",
    brew: "How to brew",
    shipping: "Shipping",
  },
  shipping:
    "Free shipping on orders above ₹699. Shipping costs and delivery times for your pin code are shown at checkout. Questions about your order? Message us on WhatsApp.",
  assurance: [
    { icon: "Truck", label: "Free shipping over ₹699" },
    { icon: "LockSimple", label: "Secure checkout" },
    { icon: "Leaf", label: "Whole ingredients" },
  ] as { icon: IconName; label: string }[],
  benefits: {
    eyebrow: "In detail",
    title: "Why it belongs in your day",
    text: "Six reasons customers keep a pouch by the kettle. Every one comes from four whole ingredients and nothing else.",
    photoCaption: "One warm cup, once a day",
  },
  ingredients: { eyebrow: "What's inside", title: "Four whole ingredients" },
  ritual: { eyebrow: "Easy as one, two, three", title: "How to enjoy", taste: "Tasting notes" },
  faq: { eyebrow: "Good to know", title: "Questions, answered" },
  related: { title: "You may also like" },
  comingSoon:
    "Full ingredient list and brewing notes are coming soon. Message us on WhatsApp with any questions about this blend.",
  sticky: "Add to cart",
  details: "View product details",
  disclaimer:
    "SkinFusion teas are food products and are not intended to diagnose, treat, cure or prevent any disease. Individual experiences vary. If you are pregnant, nursing, taking medication or have a health condition, check with your doctor first.",
};

export type FooterLink = { label: string; href?: string };

export const footer: {
  mission: string;
  newsletter: { title: string; consent: string };
  columns: { title: string; links: FooterLink[] }[];
  legal: string;
  disclaimer: string;
} = {
  mission: "Teas made from whole food, for your skin. Made in Mumbai.",
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
        { label: "Skin Glow Tea", href: "/products/skin-glow-tea" },
        { label: "Bundles", href: "/products/skin-glow-tea" },
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
