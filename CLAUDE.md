# SkinFusion storefront

Frontend for SkinFusion, a premium skin-wellness tea brand (TCM-inspired, Mumbai, prices in INR).
Server-rendered with TanStack Start and deployed on Vercel. Products come from
`src/data/content.ts` and the cart is saved in the browser. Checkout is the site's own page
(`/checkout`): Razorpay takes the payment in its window over our page, and the server then
creates the paid order in the store backend through its Admin API (see "Checkout and
payments"). The store backend is never named or shown anywhere a visitor can see: not in
copy, markup, browser code, URLs or `VITE_` variables. It is reached only from server code.

This project is built and maintained with Claude Code only.

## Tech stack

| Tool                      | Version  | What it does here                                                                    |
| ------------------------- | -------- | ------------------------------------------------------------------------------------ |
| Node.js                   | 24.x     | Pinned in `package.json` engines. Local dev also works on 20.19+                     |
| npm                       | 10+      | Package manager (`package-lock.json`)                                                |
| React                     | 19.2     | UI library                                                                           |
| TanStack Start            | 1.168    | Framework on top of Vite: server-side rendering (SSR), route loaders, file routing   |
| TanStack Router           | 1.170    | Routing (`<Link>`, `createFileRoute`). This is NOT React Router                      |
| TanStack Query            | 5.x      | Mounted in the root, not used for data yet                                           |
| Vite                      | 8.1      | Dev server and bundler (`vite.config.ts`)                                            |
| Nitro                     | 3.0 beta | Packages the SSR server: Vercel Function on Vercel, Node server locally              |
| Tailwind CSS              | 4.x      | Styling. Configured in CSS (`src/styles.css`), there is no `tailwind.config.js`      |
| TypeScript                | 5.8      | Strict mode on                                                                       |
| Phosphor Icons            | 2.x      | All site icons, always `weight="light"`                                              |
| GSAP + @gsap/react        | 3.15     | Scroll animations: ScrollTrigger, SplitText (free since 3.13), useGSAP               |
| Lenis                     | 1.3      | Smooth scrolling, desktop with a mouse only                                          |
| @fontsource-variable/jost | 5.x      | Self-hosted Jost (no Google Fonts request)                                           |
| Vitest + Testing Library  | 4.x      | Tests (`src/test/`)                                                                  |
| ESLint 9 + Prettier 3     |          | Lint and formatting (Prettier runs as an ESLint rule, so `npm run lint` checks both) |

Important: this is a server-rendered app, not a single-page app. There is no `index.html`.
The HTML shell, `<title>` and meta tags are built in `src/routes/__root.tsx` (site-wide) and in
each route's `head()` (per page).

## Folder structure

```
.
├── public/                    Served as-is at the site root: favicon.svg, og-image.jpg, robots.txt
│   └── media/demo/            Demo stock videos, posters and photos (see MEDIA_CREDITS.md)
├── MEDIA_CREDITS.md           Source, author and license of every demo media file
├── src/
│   ├── assets/                Site images (JPG originals); web/ holds 400/800px WebP copies
│   ├── components/home/       Homepage sections (see "Homepage" below)
│   │   ├── Hero.tsx           Full-width photo hero with centred headline and one button
│   │   ├── Sections.tsx       Product row, results, how it works, TCM 101, sourcing, closing CTA
│   │   ├── Stories.tsx        Stories scroller (drag, drift, video cards)
│   │   ├── SkinLayers.tsx     Skin-layers drawing (animated by lib/animations/why-edible.ts)
│   │   └── media.tsx          Img, LoopVideo, PlayPill, VideoDialog (all media goes through these)
│   ├── components/product/    Product page parts: BuyBox, purchase.ts, Gallery (+ gallery-image.ts),
│   │                          Blocks (SectionIntro, ComparisonTable, Standards, Ingredients, Steps,
│   │                          Reviews, Disclosure, Faq), icons.tsx
│   ├── components/site/
│   │   ├── Chrome.tsx         Floating pill nav, mobile menu, footer, cart drawer, toasts,
│   │   │                      WhatsApp button, 10%-off popup, newsletter form
│   │   ├── ProductImage.tsx   Product photo: WebP source + JPG fallback, fixed width/height
│   │   ├── Stars.tsx          Star rating (real-results page)
│   │   ├── IntroLoader.tsx    Markup for the CSS intro loader
│   │   └── AnimationRuntime.tsx  Page-wide animation housekeeping (Lenis, ScrollTrigger refresh)
│   ├── data/content.ts        Product data and ALL marketing copy
│   ├── data/media.ts          EVERY homepage photo and video, grouped by section (one-line swaps)
│   ├── lib/
│   │   ├── animations/        All animation code, see "Animations" below
│   │   ├── media/playback.ts  Shared video rules (autoplay checks, 2-video limit on phones)
│   │   ├── scroll-lock.ts     useScrollLock(): shared page scroll lock for drawers/menus/modals
│   │   ├── catalog/
│   │   │   ├── types.ts       Product / variant / photo / money types
│   │   │   └── products.ts    getProducts() and getProduct(handle): the only way to read products
│   │   ├── checkout/          Checkout: types, validation, india.ts (states), pricing.ts,
│   │   │                      functions.ts (server functions), server/ (env, razorpay,
│   │   │                      notes, store-orders, record; server-only)
│   │   ├── cart/
│   │   │   ├── context.ts     Cart types and the useCart() hook
│   │   │   ├── store.ts       CartStore interface + localStorage implementation
│   │   │   └── CartProvider.tsx  Cart state, mounted in __root.tsx
│   │   ├── format.ts          inr() and rs() price formatters
│   │   ├── seo.ts             Site title, description, share image, VITE_SITE_URL
│   │   ├── utils.ts           cn() helper for merging Tailwind classes
│   │   ├── error-capture.ts   Server-side error logging helper
│   │   └── error-page.ts      Plain HTML shown if server rendering crashes (site styles inlined)
│   ├── routes/                One file per page (file-based routing), see src/routes/README.md
│   ├── routeTree.gen.ts       AUTO-GENERATED route list. Never edit by hand
│   ├── router.tsx             Creates the router
│   ├── server.ts              SSR server entry (wraps crashes in error-page.ts)
│   ├── start.ts               TanStack Start middleware (error handling, CSRF)
│   ├── styles.css             Tailwind setup, design tokens, custom utilities, animations
│   ├── vite-env.d.ts          Types for the VITE_* environment variables
│   └── test/                  Vitest setup, routing smoke test, cart store tests
├── .env.example               All environment variables, no values. Copy to .env.local
├── components.json            shadcn/ui settings (no shadcn components are installed now)
├── eslint.config.js           Lint rules
├── tsconfig.json              TypeScript settings, `@/` alias -> `src/`
├── vite.config.ts             Build config (Tailwind, TanStack Start, React, Nitro)
└── vitest.config.ts           Test config
```

## Pages and routes

| URL                    | File                                | What it shows                                                                                        |
| ---------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                    | `src/routes/index.tsx`              | Homepage (see "Homepage"). Loader: all products + featured product                                   |
| `/real-results`        | `src/routes/real-results.tsx`       | Before/after sliders, video stories, serum comparison, ingredient spotlight, story form, product CTA |
| `/quiz`                | `src/routes/quiz.tsx`               | 4-question skin quiz with a product recommendation. Linked from the hero and the Explore menu        |
| `/products/:handle`    | `src/routes/products/$handle.tsx`   | Product page (see "Product page")                                                                    |
| `/checkout`            | `src/routes/checkout.tsx`           | Checkout: contact, delivery address, order summary, Pay (see "Checkout and payments")                |
| `/order-confirmed`     | `src/routes/order-confirmed.tsx`    | Thank-you page with the order reference (`?ref=`)                                                    |
| `/api/payment-webhook` | `src/routes/api/payment-webhook.ts` | POST only: Razorpay webhook (server route)                                                           |
| anything else          | `__root.tsx` NotFoundComponent      | 404 page (inside the normal header/footer)                                                           |

Product cards (photo and name), the hero's "Shop Skin Glow Tea", the closing CTA and the
footer link open `/products/<handle>` (see "Product page"). Unknown handles show the 404 page.

Homepage sections are reached with anchors: `/#how-it-works`, `/#shop`, `/#results`, `/#ingredients`, `/#learn`,
`/#stories`, `/#sourcing`.

To add a page: create `src/routes/<name>.tsx` with `createFileRoute("/<name>")`. The dev server
regenerates `routeTree.gen.ts` automatically.

## Main components

- `__root.tsx`: the app shell. Loads the Jost font and `styles.css`, sets site-wide meta tags from
  `lib/seo.ts` (plus `noindex` on Vercel preview builds), and wraps every page in
  `CartProvider` + `Header` + `Footer`, with the cart drawer, toasts, WhatsApp button and
  10%-off badge floating on top. On phones the WhatsApp button is smaller (48px) and the
  10%-off badge is hidden so nothing covers the content (the offer stays in the footer). Also holds the 404 and error screens.
- `Header` (Chrome.tsx): two floating translucent cream pills, 24px from the top (16px on
  phones). Left: logo + `nav.main` (Shop, Ingredients, Learn). Right: cart and the coral
  "Get started" pill to /quiz. Phones: one pill with logo, cart and
  menu button; the menu is full-screen with staggered links. The nav hides while scrolling
  down and comes back on scroll up or keyboard focus. Page routes use the router `Link`,
  `/#section` anchors stay plain links. There is no announcement bar any more.
- `Footer`: deep green, cream text: logo, mission line, newsletter with consent text, five link
  columns (`footer.columns` in content.ts), legal line and wellness disclaimer.
- `CartDrawer`: slides in from the right, free-shipping progress bar, quantity controls, subtotal,
  Checkout button.
- Scroll animations: add a `data-anim` attribute in the markup (see "Animations").
- Any overlay (drawer, menu, modal) calls `useScrollLock(open)`. Never set `body.style.overflow`
  directly.

## Homepage

Seed-inspired layout (layout and motion only; no Seed content, media or fonts). Sections, in
order (`src/routes/index.tsx`):

1. **Hero** (`Hero.tsx`), "steeping": one continuous shot played by the scroll (GSAP scrub,
   reversible), Apple-style restraint: no captions, chips, ratings or extra text.
   - At rest: the black and white serum world (`media.hero.serum`) fills the screen: kicker,
     "Skin care you apply." ("apply." as a thin outline), one button and "From" price, a
     small "Scroll" cue.
   - As you scroll: the photo stays full screen the whole time; it dims slightly and pushes
     in while a small amber glass bead of tea (`.hero-drop-bead`, faint trail) falls onto the
     headline; "apply." lifts away
     letter by letter; two fine ripples gently refract the photo where it lands
     and the colour (`media.hero.image`) spreads out from there in one clean, round wave
     with a soft feathered edge (grey rising to full colour inside the edge; no glow, no
     distortion). "drink." rises letter by letter (both words
     share one grid cell), the spec line (`facts`) and the steam (desktop) arrive.
   - Rendering: `lib/animations/hero-shader.ts`, a small WebGL 1 shader (one quad, the two
     photos as textures). It draws only when something changes (scroll, pointer, or the
     ripples while they spread), pauses
     off-screen, caps the pixel ratio (1.5 phones, 2 desktop) and fades in after the hero
     entrance. The server HTML and the fallback (no WebGL, context lost, still loading) are
     the two `<img>` layers with the same grading, crossfaded by the same scroll values.
     Client-approved exception to "transform and opacity only" (the canvas is redrawn; the
     DOM still only moves transform and opacity).
   - The hero sticks (CSS `position: sticky` in a 220svh track; `svh`, not `dvh`, so the
     phone address bar never resizes it).
   - Phones (priority): scrub 0.5 and snap: one short swipe plays the whole shot, a short
     swipe back returns to black and white, so it never rests half-way. Desktop: scrub 1.2,
     no snap, the scene tilts slightly with the pointer (shader uniform). Nothing plays by
     itself. Client-requested exception to the mobile "no scrub" rule.
   - Reduced motion: no track (`motion-safe:` height), no shader, colour at once. No
     JavaScript: the black and white serum world.
     **Ingredient strip** (`IngredientStrip` in Sections.tsx, `ingredientStrip` copy): green band
     under the hero; moves slowly on every device (30s phones, 40s desktop; paused off-screen
     and in hidden tabs; 44px pause button on the strip); still with reduced motion.
2. **Product row** (`#shop`): eyebrow "The collection", "Our teas" and a short line beside it
   (`home.products`). `getProducts()` as white cards (`ProductCard`, exported and reused for
   "You may also like"): the photo is inset with rounded corners, frosted tags on it (best
   seller, `label:` tag, star rating with count); below, the name, subtitle, "From" price with
   MRP crossed out and "Save x%", and "Add to cart" (first pack), which briefly shows "Added"
   with a tick. Desktop hover: the card lifts with a soft shadow, the photo zooms slowly while
   a short muted video plays over it, and the button fills green. Phones: the video plays
   while in view; swipe with snap points and a "Swipe to see all" hint. Products without a
   photo show the fallback image from media.ts. Photo and name open the product page.
3. **Why edible** (`#how-it-works`, `WhyEdible` in Sections.tsx): eyebrow "The idea" and the
   title, with the paragraph beside them on desktop. Below, a blush card: the skin-layers
   drawing (`SkinLayers.tsx`) in a white panel (right on desktop, on top on phones) and the
   three points as numbered step buttons with icons (Drop, ForkKnife, Coffee) plus "Shop our
   teas". The drawing never plays by itself (`lib/animations/why-edible.ts`: cream lands on
   the outer layer, food rises through the blood, the cup comes forward, with a camera
   zooming along). Scroll drives it: while the drawing passes through the screen (its top at
   75% down to its bottom at 25%), each third is one step, played forward going down and
   backward going up. Clicking or tapping a step plays that step (`goTo(i)`). The matching
   step button lights up. No pinning. Copy:
   `howItWorks`, `skinLayers`.
4. **Results** (`#results`, `Results` in Sections.tsx, `home.results` copy, `media.results`
   photos): blush block, eyebrow "Real results", title, short line and "See all stories" to
   `/real-results`. Three customer cards, each a before/after drag slider
   (`components/site/BeforeAfter.tsx`, shared with /real-results: before on the left, after
   on the right, drag or arrow keys) with a "x weeks of daily cups" chip, then star rating,
   quote, name and city. Photos come from `media.results`. For the design preview they are
   DEMO stock photos from Pexels (`result-1..3-before/after.webp`, different models, the
   before copies in black and white; `isDemo: true`), and each slider shows a "Demo photos"
   tag (`home.results.demoTag`). Before launch they must become real customer photos shared
   with written permission (stock as a real before/after is an invented result), or `null`:
   that side then shows a "photo coming soon" panel (beige before, blush after). The quotes
   are demo too (`isDemo: true`). The old "Buy more, pay less" bundle block was removed; packs
   are chosen on the product page, and the footer "Bundles" link goes there.
5. **Ingredients** (`#ingredients`, `HowItWorks` in Sections.tsx): deep green block. Title with
   the intro beside it (desktop), then the four ingredients as cards: arch-shaped photo
   (`media.ingredients`, zooms slightly on hover), number 01-04, name, hanzi and pinyin, and a
   short taste line (`taste` in `ingredients`, no health claims). Below a line: true-fact
   counters (4 whole ingredients, 0 preservatives, 0 caffeine), "How to make it" as three cream
   step cards with icons (Leaf, ThermometerHot, Timer), the TCM line and a "See Skin Glow Tea"
   button. 2 columns of cards on phones, 4 on desktop. Copy: `home.howItWorks`, `ingredients`.
6. **Comparison** (`ComparisonTable` from components/product/Blocks.tsx, `comparison` in
   content.ts): a light section right after the green ingredients block (so the page
   alternates), in the same language: eyebrow "Why SkinFusion" and title "SkinFusion vs. the
   rest" on the left, the line on the right. No numbers or chips repeated from the
   ingredients block.
   - Everything sits in a blush rounded panel. Below the intro: an arch collage (sticky on
     desktop): the cup (`media.comparison`) in a tall arch like the ingredient cards, a round
     inset of whole jujubes (`media.ingredients.jujube`) over its corner, a circular text
     badge (`badge`, turns slowly on desktop, CSS `cmp-spin`, paused off-screen) and a "One
     cup a day" pill; beside it a white board that shows SkinFusion and
     BOTH competitors at once (no switch). From `md`: a 4-column table with a raised green
     SkinFusion column (leaf badge, coral ticks, "See Skin Glow Tea" at its foot). Phones:
     three icon heads, then each point with three tiles under it (a slightly wider green
     SkinFusion tile with the tick, two beige competitor tiles). Under the rows, "Ticks out
     of five" (`scoreTitle`): three bars counted from the table's `true` values (5/5, 1/5,
     0/5). A small note under the board. The table keeps explicit ARIA roles because its
     rows are laid out as grids.
   - Arch shape: `rounded-t-[50%_40%]` (half the width, for a 4:5 box), not `rounded-t-full`:
     a 9999px radius makes the browser shrink every corner, so the bottom corners went
     square. The ingredient cards use the same fix.
   - The green SkinFusion column and the phone tiles carry a soft top light (cream gradient).
   - Scroll (`lib/animations/comparison.ts`): the title's words rise out of a mask (SplitText)
     with the intro; the arch rises while the photo settles from 1.18 to 1, the jujube circle
     and the badge pop, then the pill (desktop: photo and jujube circle drift at different
     speeds); a scrubbed focus on every device: only the row in the middle of the screen is
     fully lit, the others fade to 30%, and a soft coral glow (`data-cmp-glow`) travels down
     the board; once: the board rises, the green column grows down (scaleY), the
     heads come in, then each row: the row rises (phones), label in, the green tile settles
     with its tick popping, the two competitor tiles slide in from the right; a thin coral
     line draws down the side; the button rises; the score bars fill (scaleX) while the
     numbers count up. Reduced motion: nothing moves.
     The product page uses it with `cta={false}`.
7. **TCM 101** (`#learn`): stacked copy, "Discover" pill, wide video thumbnail with a "Play" pill
   that opens the full-screen `VideoDialog`.
8. **Stories** (`#stories`, `Stories.tsx`): full-bleed strip of mixed shapes (half-visible circles
   at both edges, tall portraits, stadium above a quote, video cards with a "Play" pill, a green
   quote card). Desktop: drag to scroll with momentum, slow scroll-linked drift of the strip,
   slight parallax between cards. Phones: native swipe with snap points, no drift.
9. **Sourcing** (`#sourcing`): deep green block. The jujube photo (`media.sourcing`, right
   half on desktop, on top on phones) drifts with the scroll (`data-depth="-0.5"`), a round
   inset photo of the dates (`media.ingredients.jujube`) pops in and drifts at another speed
   (`data-depth="0.35"`, desktop only), and a frosted origin card shows "Origin", the place
   and its coordinates. Beside it: eyebrow "From the orchard", heading, text, the jujube's
   journey as a timeline (Tree, Sun, Coffee icons; across on desktop, down the side on
   phones) joined by a line that draws itself (`data-anim="draw"`), and a cream "See all four
   ingredients" button to `/#ingredients`. The origin copy and coordinates are DEMO until the
   client confirms them (`home.sourcing.isDemo`).
10. **Closing CTA** (`ClosingCta`, gets the featured product): blush block. "Try it for
    yourself", a short line and three trust points with icons (free shipping above ₹699,
    secure UPI / card / net banking payment, caffeine free with no added sugar). Beside it a
    white product card for the featured product: photo, rating, subtitle, "From" price with
    MRP and saving, "Add to cart" (first available pack, opens the cart) and "View details".
    On desktop two photos (`media.closing`, stadium and circle) frame the card. Copy:
    `home.closing`.
11. **Footer** (site-wide, see above).

Copy for all of it is in `home`, `hero` and `nav` in content.ts. Media is in `src/data/media.ts`.

## Product page

`src/routes/products/$handle.tsx`. Loader: `getProduct(handle)` (404 if missing) and up to four
related products. `head()` sets the title, description, share image and price tags.

1. Breadcrumb (Home / Shop / product).
2. `Gallery` (sticky on desktop): the product's images, then `media.gallery[handle]`.
3. `BuyBox`: uppercase title, subtitle, rating (links to `#reviews`), price, compare-at price and
   "Save x%", price per cup, tagline, pack choice (radio inputs), quantity, "Add to cart · price"
   (opens the cart drawer), highlights, "Why you'll love it", assurance icons. Then accordions
   (native `<details>`, content in the server HTML): Description, Ingredients, How to brew,
   Shipping.
   The gallery and buy box fade in on load (`data-anim`).
4. Products with an entry in `productDetails` (content.ts) also get: "Why it belongs in your
   day" (bento grid: tall photo tile `media.ritual.image` with `pdp.benefits.photoCaption`,
   the first benefit as a large green card, the other five as numbered white cards with icons
   in blush circles; compact rows on phones), "How to enjoy" with tasting notes, the
   ingredients block, the comparison table and an FAQ. Today only `skin-glow-tea` has details; the others show the buy
   box, a "coming soon" description, reviews and related products, and no ingredient claims.
5. Reviews, related products ("You may also like"), wellness disclaimer.
6. Phones and tablets: a sticky bar with price and "Add to cart" slides up once the main button
   scrolls out of view.

Benefit copy must follow the claims rules: "traditionally used", "customers say", "a daily
ritual"; never treats, cures, heals, reduces or prevents, and no promised results.

The product-page components use a few extra token names, mapped onto this palette in
`styles.css`: `surface` (white), `sand` (beige photo backdrop), `gold` and `jujube` (brand green),
`gold-deep` (green-soft), `rose` (blush chips), plus a `headline` size utility.

### Media rules (src/data/media.ts)

- Components read photos and videos ONLY from `media.ts`. To replace a demo clip, put the file in
  `public/media/` (or `src/assets/`) and change its line in `media.ts`.
- Every entry has `src`, `alt`, `width`, `height`, `credit`, `source`, `license`, `isDemo`; videos
  also have a `poster`. `isDemo: true` = free stock media for the preview (listed in
  MEDIA_CREDITS.md), must be replaced before launch.
- Videos: 720p max, H.264 MP4, no audio track, 5-12 s, under 3 MB, with a WebP poster frame.
  Photos: WebP, max 1600px wide, plus a `-600.webp` copy for phones (`srcSet`). Site images in
  `src/assets` have 400/800px WebP copies in `src/assets/web`.
- Always render videos with `LoopVideo` (or `VideoDialog` for click-to-play):
  muted, `playsinline`, loop, `preload="none"`, poster first; the file is attached only within
  300px of the screen; pauses off-screen and in hidden tabs; never autoplays with reduced
  motion or data saver; at most 2 play at once on phones (`lib/media/playback.ts`). Videos that
  play in view get a pause button (WCAG 2.2.2); the hero's also pauses the floating pieces.
- Only free-license sources: Pexels, Pixabay, Mixkit (only clips marked "Free License"; Mixkit
  "Restricted License" clips are personal-use only). Download, never hotlink. Add every file to
  MEDIA_CREDITS.md.

## Products: how data flows

1. Product data lives in `localProducts` in `src/data/content.ts`, typed in
   `src/lib/catalog/types.ts`: `handle`, `title`, `description`, `tags`, `featuredImage`,
   `images`, `priceRange`, `compareAtPriceRange`, `variants`, `subtitle`, `rating`.
2. `getProducts()` / `getProduct(handle)` in `src/lib/catalog/products.ts` return them.
   **Nothing else imports product data.** A future store backend replaces only these two.
3. Routes call those functions in their `loader`, so the server renders pages with the data.
   Components read it with `Route.useLoaderData()` or get it as props.

Details:

- Prices are decimal strings (`"649.00"`). Use `money(price)` to get a number, then `inr()` /
  `rs()` to display.
- Skin Glow Tea has 3 variants: 1, 2 and 4 pouches, each with its own price. The pack discount
  is baked into the variant price (2 pouches = 1168.20, 4 = 2206.60). `note` is the line shown
  under each pack button.
- Badges come from tags: `best-seller` shows the round "Best Seller" badge, `label:<text>` shows a
  small corner label (e.g. `label:Save 10%`).
- `images: []` / `featuredImage: null` shows a beige "image coming soon" box.
- `FEATURED_PRODUCT_HANDLE` in content.ts picks the product for the featured section, quiz result
  and real-results CTA.

## How the cart works

- `useCart()` (`src/lib/cart/context.ts`) gives: `lines`, `count`, `subtotal`,
  `add(product, variant, quantity?, { openDrawer })`, `setQty(lineId, quantity)`, `clear()`,
  `open`/`setOpen` (drawer) and `toast`.
- Lines are `{ id, quantity, merchandise: { id (variant id), title, price, image, product:
{ handle, title } } }`. Adding the same variant again increases its quantity; different packs
  are separate lines. Quantity 0 removes the line.
- `CartProvider` never touches storage directly. It calls a `CartStore` (`src/lib/cart/store.ts`)
  with `load`, `add`, `update` and `clear`. `localCartStore` saves lines in localStorage
  (`skinfusion-cart-v1`), so the cart survives a refresh.
- The cart loads after the page hydrates, so the server-rendered HTML always shows an empty cart.
- The drawer's Checkout button links to `/checkout`. The cart is cleared after a successful
  payment.
- Free-shipping threshold: `FREE_SHIPPING_THRESHOLD` in content.ts (699); below it delivery
  costs `SHIPPING_FEE` (79, to confirm).

There are no customer accounts or sign-in pages.

## Checkout and payments

Flow (all on our site; the store backend is invisible to shoppers):

1. `/checkout` (`src/routes/checkout.tsx`): contact (name, email, +91 mobile), delivery address
   (Indian states, 6-digit PIN), order summary with delivery and total. The details are
   remembered on the device (`skinfusion-checkout-v1`), never the payment.
2. Pay calls the `startPayment` server function: it validates the form and cart
   (`validation.ts`), prices the cart from the catalog on the server (`pricing.ts`, the browser
   never sends prices), and creates a Razorpay order for exactly that amount. The order
   details travel in the Razorpay order notes (`server/notes.ts`), so the payment is the single
   source of truth.
3. The browser loads Razorpay's checkout script only at that moment and opens its payment
   window (UPI, cards, net banking, wallets) over our page, themed in brand green.
4. On success `confirmPayment` checks the signature (HMAC with the key secret), then
   `recordPaidOrder` (`server/record.ts`) re-reads the order and payment from Razorpay, checks
   status and amount, and creates the paid order in the store backend
   (`server/store-orders.ts`: finds each pack's id by product handle and pack title, then
   creates the order with customer, address, delivery line, a paid "Razorpay" transaction and
   the tag `rzp-<order id>`). The shopper lands on `/order-confirmed?ref=#1001`.
5. Backup: the `payment.captured` webhook (`/api/payment-webhook`, signature checked with
   `RAZORPAY_WEBHOOK_SECRET`) waits 15s and records the order if it is still missing (the tag
   prevents duplicates). Failures return 500 so Razorpay retries.

Modes (`server/env.ts` `paymentMode()`): `live` with Razorpay keys; `test` on the local dev
server without keys (a "Test payment" button completes the flow, nothing is charged, no order
is created); `off` in a production build without keys (Pay is disabled, "Online payment opens
soon").

Rules:

- Every key is server-only (no `VITE_` prefix) and read only in `src/lib/checkout/server/*`,
  which browser code cannot import (vite.config.ts import protection). The browser receives
  only the public Razorpay key id.
- After every build, the browser bundle (`.output/public`) must contain no store backend name
  and no secret: `grep -ril "admin/api\|STORE_ADMIN_TOKEN\|KEY_SECRET" .output/public` must
  find nothing.
- Store products must use the same handles as `localProducts` and the same pack titles
  ("1 Pouch", "2 Pouches", "4 Pouches"); a single-pack product may keep its default title.
- Store backend access: an app with scopes `write_orders`, `read_products`,
  `write_customers`. Current apps give `STORE_CLIENT_ID` + `STORE_CLIENT_SECRET`; the server
  exchanges them for a 24-hour token (client credentials grant, cached in memory). This only
  works when the app and the store belong to the same organization. Older apps with a fixed
  token use `STORE_ADMIN_TOKEN` instead.
- Tests: `src/test/checkout.test.ts` (validation, pricing, notes, signatures, and order
  recording against fake services, including no duplicates).

Going live:

1. Razorpay: create the account (in the client's name), copy the test key id and secret into
   `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, add the webhook
   (`https://skin-fusion.vercel.app/api/payment-webhook`, event `payment.captured`) and copy its secret.
2. Store backend: create an app with the scopes above in the developer dashboard of the
   account that owns the store, install it on the store, and copy the admin domain, client id
   and client secret into `STORE_DOMAIN`, `STORE_CLIENT_ID`, `STORE_CLIENT_SECRET`.
3. Add all of them in Vercel (Production and Preview), redeploy, place a test order with
   Razorpay test keys and check it appears, paid, in the store admin. Then switch to live keys.

## Editing content (src/data/content.ts)

Marketing copy lives in this file:

- `brand`: name, tagline, city, WhatsApp and Instagram links
- `announcement`: the scrolling top-bar messages
- `nav`: menu links (`main` shows in the desktop bar, `explore` in the dropdown, both on mobile)
- `hero`: hero kicker, title and both button labels
- `inside`, `comparison`, `standards`, `mission`, `reviews`, `journal`: homepage copy
- `footer`: footer columns. A link without `href` shows as plain text (FAQs, Shipping &
  Returns, Wholesale, Creators & Affiliates have no page yet). Add `href` when the page exists
- `realResults`: everything on /real-results. `before`, `after`, `poster`, `video`, `youtube`
  are `null` until real customer media exists
- `quiz`: quiz questions

To change an image: put the file in `src/assets/`, import it at the top of content.ts and use
the variable. File names are case-sensitive on Vercel, so match the exact spelling.

SEO: site title, description, theme colour and share image are in `src/lib/seo.ts`. The share
image is `public/og-image.jpg` (1200 x 630). Set `VITE_SITE_URL` in production so share tags
use absolute URLs. The favicon is `public/favicon.svg` (placeholder "S"; replace with the logo).

## Design system

Seed-inspired, client-approved (replaces the earlier square "Qi" style). Read from
`src/styles.css`. Use the tokens, never raw hex values in components.

Colors (Tailwind class names in brackets):

- Background cream `#fbf7f2` (`bg-background`, `text-cream` on dark blocks)
- Deep brand green `#1e4d3a` (`text-green`, `bg-green`): all headlines, dark blocks, footer,
  nav text. Cream on green is 9:1
- Coral `#e8807a`, hover `#d96e68` (`bg-primary`): the ONLY accent: primary buttons and small
  highlights. Text on coral is ink (`text-primary-foreground`, 6.1:1); never white (2.69:1)
- Blush `#f3e4e0` (`bg-blush`): soft cards (results, closing CTA, quotes)
- Beige `#efe9e1` (`bg-beige`): image placeholders
- Ink `#1f1f1f` (`text-foreground`): body text. Muted text `#6b635c` (`text-muted-foreground`)
- Error text on green: `text-error-on-dark`
- Borders are very light: `rgba(0,0,0,0.06)`

Typography:

- One font: Jost, self-hosted (latin subset preloaded in `__root.tsx`). Weights 400 and 500
- Headlines: sentence case, weight 400, deep green, line-height 1.05-1.15, slight negative
  letter-spacing, `text-wrap: balance` (global for h1-h4). Sizes: `display` (hero and closing,
  36-72px fluid) and `title` (section headings, 30-52px fluid)
- Body 17px, line-height 1.6, max width around `max-w-md` / 65ch
- Small uppercase wide-spaced text (`label-caps`) ONLY for tiny eyebrow labels (one per few
  sections, e.g. the sourcing location) and footer column titles. The logo stays uppercase

Shapes and spacing:

- Pill buttons (`rounded-full`), rounded cards `rounded-card` (28px), smaller tiles 24px
  (`rounded-[1.5rem]`), circles (`rounded-full` on square images) and stadium crops
  (`rounded-stadium` on tall or wide images)
- Lots of whitespace: `section-y` (4rem / 7rem from 1024px), `container-x` (80rem, 1.5rem
  padding). Coloured blocks sit inside a 1rem / 1.5rem page gutter (`px-4 md:px-6`)
- Tap targets at least 44px (`h-11 w-11` icon buttons, 48px buttons)
- No heavy shadows; separation comes from cream / blush / green blocks

Buttons:

- `btn btn-primary`: coral pill, ink text, sentence case, min height 48px, shrinks to 98% on press
- `btn btn-outline`: green 1px pill, fills green on hover
- `btn btn-cream`: cream outline pill for green blocks
- Text links: `underline underline-offset-4` with an `ArrowRight` that nudges on hover
- Cards lift 6px on hover (`lift`, desktop with a mouse only)

## Animations

Built with GSAP (ScrollTrigger, SplitText, `useGSAP`) and Lenis. Everything lives in
`src/lib/animations/`:

| File                     | What it does                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `gsap.ts`                | The only place plugins are registered. Always import `gsap`, `ScrollTrigger`, `SplitText`, `useGSAP` from here         |
| `media.ts`               | `MOTION_CONDITIONS` for `gsap.matchMedia()`: `isDesktop` (>=1024px + mouse), `isMobile` (everything else), `isReduced` |
| `presets.ts`             | The reusable animations: `heading`, `fade`, `cards`, `tilt`, `draw`, `pop`, `countUp`, `footerReveal`                  |
| `useScrollAnimations.ts` | Hook used by each page: runs the preset named in every `data-anim` (and every `data-count`) inside the page            |
| `hero.ts`                | Homepage hero entrance timeline                                                                                        |
| `hero-shader.ts`         | Homepage hero WebGL renderer: soft ripples, then a clean round colour wave with a feathered edge                       |
| `comparison.ts`          | "SkinFusion vs. the rest": phones stacking card deck (sticky + scrub), desktop scroll-driven row-by-row reveal         |
| `why-edible.ts`          | "Why edible" drawing: three steps driven by the scroll or the step buttons, never on a timer (no pinning)              |
| `intro.ts`               | Intro loader: timings, the inline `<head>` script and its CSS                                                          |
| `smooth-scroll.ts`       | Lenis setup (desktop only) and stop/start for the scroll lock                                                          |
| `hydration.ts`           | Waits for the first load to settle and skips content already on screen (no flashes)                                    |
| `safety.ts`              | `safely()` try/catch wrapper and the 3-second `failsafe()`                                                             |
| `usePauseWhenHidden.ts`  | Pauses endless CSS animations off-screen and in hidden tabs                                                            |

### How to animate something

Add an attribute in the markup. No refs or effects needed on pages that already call
`useScrollAnimations` (home, real-results, quiz):

| Attribute             | Effect                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `data-anim="lines"`   | Big headline: lines rise from a mask once (desktop). Mobile: fades up once                            |
| `data-anim="media"`   | Rounded image/video frame fades in while the picture settles from scale 1.06 to 1, once               |
| `data-depth="0.4"`    | Slow scroll-linked parallax, desktop only (wrapper element; negative moves the other way)             |
| `data-anim="heading"` | Section heading. Desktop: words fill from 15% to full ink while scrolling. Mobile: fades up once      |
| `data-anim="fade"`    | Block fades up once                                                                                   |
| `data-anim="cards"`   | Direct children rise in with a stagger (mobile: first 6 only)                                         |
| `data-anim="tilt"`    | Exactly 3 children: sides slide in and settle at -6/6deg, center rises, photo parallax (desktop only) |
| `data-anim="draw"`    | SVG paths draw themselves once                                                                        |
| `data-anim="pop"`     | Scales in from 0.85 once                                                                              |
| `data-count`          | The number in this element's text counts up once (final value is in the server HTML)                  |

A new page opts in with `const scope = useRef<HTMLElement>(null); useScrollAnimations(scope);`
and `<main ref={scope}>`. Never put `data-depth` and another transform animation (CSS loop, `data-anim`) on the same
element: nest wrappers.

### What plays where

| Animation                             | Desktop (>=1024px, mouse)                                                  | Mobile and tablet                                 |
| ------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| Intro loader (home, once per session) | Letters fade up, slide away, max 1.6s                                      | Same, max 1s                                      |
| Hero entrance                         | Nav fades down, headline lines rise from a mask, composition settles in    | Text fades up, composition fades in, buttons last |
| Hero                                  | Black and white; a drop lands, colour spreads out in a soft wave (scrub)   | Same, one swipe plays it all (snap)               |
| Big headlines (`lines`)               | Lines rise from a mask once                                                | Fade up once                                      |
| Images (`media`)                      | Scale 1.06 to 1 + fade in, 1.4s                                            | Same, 0.9s                                        |
| Cards                                 | y 48, stagger 0.1; lift 6px on hover                                       | y 20, stagger 0.05, max 6 per group               |
| Product videos                        | Play on hover / keyboard focus                                             | Play while in view (max 2 videos at once)         |
| Stories strip                         | Drag with momentum, strip drifts 140px with scroll, parallax between cards | Native swipe with snap points                     |
| Why edible drawing                    | Steps 1-3 follow the scroll (or a click); cream, food, cup, camera zoom    | Same (tap a step)                                 |
| Counters                              | Count up once                                                              | Same                                              |
| Nav                                   | Hides on scroll down, shows on scroll up                                   | Same                                              |
| Footer                                | Slides up, columns fade in one by one                                      | Same, smaller distances                           |
| Smooth scroll                         | Lenis                                                                      | Native                                            |

Reduced motion: no loader, no movement, no float, no video autoplay (posters only; videos play
only when opened in the dialog), no smooth scroll, everything visible immediately. Without
JavaScript: everything visible, posters instead of videos, no loader.

### Rules that keep it safe in production

- Mobile: no scrub, pinning, parallax, rotation, clip-path or filter animations; everything plays
  once; only transform and opacity.
- Start states are set by GSAP in the browser only. Server HTML is always the finished page.
- Every setup runs inside `useGSAP` (cleaned up on unmount/route change) and `safely()`
  (errors are logged and the content is shown).
- Play-once entrances have a `failsafe()`: if not finished about 3s after becoming visible, they
  jump to the end.
- `will-change` is set only while an animation runs, then cleared with `clearProps`.
- First page load: scroll animations start after `load` (max 3s) so refresh and back/forward
  scroll restoration has happened; anything already on screen is left alone.
- After route changes, refresh triggers one by one (`st.refresh()`), never a global
  `ScrollTrigger.refresh()`: it undoes the router's back/forward scroll restoration.
- Endless animations (hero float) are CSS transform animations paused with
  `usePauseWhenHidden` (and by a `data-paused` ancestor). Looping videos follow the media
  rules above.
- Elements animated by GSAP must not have a CSS `transition` on the same property
  (presets set `transition: none` while animating).
- Overlays use `useScrollLock`, which also stops Lenis.
- GSAP, SplitText and Lenis build into their own `animations` chunk (vite.config.ts).
- Use `dvh`, never `100vh`. The page wrapper uses `overflow-x: clip`; nothing may scroll
  sideways at 360px.

## Design skills and priority rules

Design skills are installed in `.claude/skills/` (20 skills: frontend-design (Anthropic,
Apache 2.0), component-builder (kostja94/bricks, MIT), build-awwwards-quality-sites
(MengTo/Skills, MIT), design-taste-frontend,
high-end-visual-design, minimalist-ui, redesign-existing-projects, ui-ux-pro-max, ui-styling,
design-system, brand, web-design-guidelines, writing-guidelines, full-output-enforcement,
vercel-react-best-practices, vercel-composition-patterns, gsap-core, gsap-react,
gsap-scrolltrigger, gsap-performance). Use them for every UI task. Some include helper
scripts; do not run them unless a task needs one.

When rules conflict, this order wins:

1. The client-approved SkinFusion design system in this file.
2. Accessibility, performance and mobile rules.
3. Skill defaults.

Approved style (client-approved Seed-inspired direction; ignore any skill rule that bans it):

- Rounded and pill-shaped buttons, rounded cards (24-32px radius), circle and stadium image
  crops.
- Jost only. Big sentence-case headlines (weight 400-500, line-height 1.05-1.15, slight
  negative letter-spacing). Small uppercase wide-spaced text only for tiny eyebrow labels.
- Cream background, deep brand green for headlines and dark blocks, coral as the single accent
  for primary buttons and highlights, blush for soft cards.
- Lots of whitespace, calm and premium; Seed-like slow, soft motion.
- Seed.com is a reference for layout and motion ONLY: never copy its media, logos, icons,
  fonts, text, product names or press quotes.

Ignore every "variance" or "randomize the layout" rule: SkinFusion pages must stay
consistent with each other.

Always keep from the skills: no emojis, no AI clichés, no Inter / Roboto / Arial, no generic
purple or blue gradients, no heavy shadows, 44px touch targets, 4.5:1 text contrast, visible
focus states, zero layout shift, transform/opacity-only animation, reduced-motion support,
complete code with no placeholders.

Coral contrast: white text on coral (`#e8807a`) is 2.69:1 and fails WCAG AA, so coral buttons use
ink text (6.12:1, `--primary-foreground`). If the client prefers white text, the coral must
darken (`#bf5049` gives 4.71:1).

## Rules for all future work

- No emojis anywhere (UI, copy, code comments, commits).
- No AI clichés in copy: "elevate", "seamless", "unlock", "transform your", "journey",
  "game-changer", "delve", "curated", "empower", "revolutionize" and similar.
- Never use Inter, Roboto or Arial. Jost is the only font.
- Headings: sentence-case Jost in deep green (already global for h1-h4); `display` / `title`
  for big ones. Uppercase only for tiny eyebrow labels.
- Buttons: pills (`btn btn-primary` coral with ink text, `btn btn-outline`). One label per
  intent on a page.
- Homepage photos and videos come only from `src/data/media.ts`; videos only through
  `LoopVideo` / `VideoDialog`.
- Animate only `transform` and `opacity`. Never animate width, height, top, left, margin or
  layout. Progress bars use `scaleX`, not width. (Only exceptions: the desktop hero's
  word colour on the old heading preset and SVG stroke-dashoffset, both play once.)
- Content must be visible in the server HTML. Never hide content with CSS (`opacity: 0`,
  `opacity-0`, `invisible`) waiting for JavaScript; use `data-anim` and let GSAP set the start
  state in the browser.
- Mobile first: write base classes for phones, then add `sm:` / `md:` / `lg:`.
- No medical claims. Do not say the tea treats, cures, heals, reduces or prevents anything, or
  promise visible results. Use "traditionally used", "a daily ritual", "customers say". Keep the
  existing disclaimers.
- Marketing copy goes in `src/data/content.ts`. Products are read only through
  `getProducts()` / `getProduct()`.
- Product photos use `ProductImage` with width/height so nothing jumps while loading.
- Never put a secret in the frontend or in a `VITE_` variable (they end up in the browser).
- Do not edit `src/routeTree.gen.ts` by hand.
- Keep each change in its own commit with a clear message.

## Run and build

```sh
npm install        # install dependencies
npm run dev        # dev server with hot reload, http://localhost:8080
npm run build      # production build (.output/, or .vercel/output/ on Vercel)
npm run preview    # serve the production build locally
npm run lint       # ESLint + Prettier check
npm run format     # auto-format all files with Prettier
npm test           # run tests
npx tsc --noEmit   # type check
```

## Deployment (Vercel)

- Import the GitHub repo in Vercel. Framework preset: TanStack Start. Build command
  `npm run build`, install command `npm install`, output directory left empty (default).
- Node.js 24.x comes from `engines` in package.json. Vercel no longer accepts Node 20.
- Nitro detects Vercel and writes `.vercel/output`: static files go to the CDN, every other path
  goes to one SSR Vercel Function (runtime pinned to `nodejs24.x` in vite.config.ts). Direct
  visits and refreshes on any route are rendered by that function, so no `vercel.json` rewrites
  are needed. Do not add SPA-style rewrites to `/index.html`; there is no index.html.
- Add the variables from `.env.example` under Project Settings > Environment Variables.
- Preview deployments (`VERCEL_ENV=preview`) send `<meta name="robots" content="noindex,
nofollow">` and an `X-Robots-Tag` header (vite.config.ts `__NOINDEX__`), so demo links stay out
  of Google. Production builds are indexable.

## BEFORE LAUNCH CHECKLIST

The homepage was built with demo content for the client preview. Replace every item below with
the client's own, permitted content (or confirm it) before going live:

Demo quotes (`home.stories.quotes` in content.ts, `isDemo: true`): invented sample quotes, must
become real customer quotes shared with permission:

- [ ] "It tastes like the jujube tea my grandmother made. My evening cup is the calmest part of
      my day." (Ananya, Bengaluru)
- [ ] "I swapped my second chai for it. Light, warm and easy to make at work." (Priya, Mumbai)
- [ ] "You can see every whole piece in the bag. Naturally sweet, no sugar needed." (Meera, Pune)
- [ ] Story video captions: "My morning routine", "Ten quiet minutes", "Windows open, kettle on"

Demo copy to confirm:

- [ ] The edible skin care wording (`hero`, `howItWorks`, `skinLayers`): "creams and
      serums sit on the outer layer", "what you eat is carried by your blood to the deeper
      layers". Client confirms it is how they want to state their belief (no result promises)
- [ ] Comparison table (`comparison`): client confirms every row
- [ ] Product page copy for Skin Glow Tea (`productDetails`): benefits, FAQ, tasting notes
- [ ] Ingredient lists and details for Calm Night, Gut Balance and Glow Ritual Bundle
- [ ] Ratings and review counts (local stand-ins until real reviews exist)
- [ ] Product page reviews (`reviews.quotes`, `isDemo: true`): same demo quotes as the stories

- [ ] Sourcing section (`home.sourcing`, `isDemo: true`): "Xinjiang, China", its coordinates,
      "Where our jujubes grow", the farm description and the three journey steps. Replace with
      the real origins
- [ ] "How it fits your day": steeping time (about five minutes)
- [ ] Results section (`home.results.items`, `isDemo: true`): three invented quotes (Ritika,
      Sneha, Kavya), their weeks and ratings, and the six DEMO before/after photos
      (`photos/result-*.webp`, stock models, not real results). Replace with real customers
      and their real before/after photos (with written permission) in `media.results`, or set
      them to `null`. Never launch with the stock pairs
- [ ] Delivery charge below ₹699 (`SHIPPING_FEE`, now ₹79)
- [ ] One test order end to end with Razorpay test keys (see "Checkout and payments")
- [ ] Order emails sent by the store backend use SkinFusion branding

Demo videos (`public/media/demo/videos/`, Mixkit Free License, all `isDemo: true` in media.ts):

- [ ] `tea-steeping.mp4` (TCM 101 modal, Glow Ritual Bundle card, stories)
- [ ] `tea-steam.mp4` (ritual video)
- [ ] `morning-window.mp4` (hero)
- [ ] `window-calm.mp4` (Calm Night Blend card)
- [ ] `skincare-routine.mp4` (stories)
- [ ] `skincare-closeup.mp4` (Skin Glow Tea card)
- [ ] `leaves-sunlight.mp4` (Gut Balance Tea card)
- [ ] `flowers-breeze.mp4` (stories)

Demo photos (`public/media/demo/photos/`, Pexels License unless noted, all `isDemo: true`):

- [ ] `window-tea.webp` (Calm Night card fallback, stories)
- [ ] `jujube-tree.webp` (sourcing, Pixabay; `red-dates.webp` is no longer used)
- [ ] `jasmine-cup.webp` (hero; confirm the photographer on its Pexels page)
- [ ] `ginger-lemon.webp` (Gut Balance card fallback)
- [ ] `glass-teapot.webp`, `hands-cup.webp` (product galleries), `bathroom-shelf.webp`
      (serum side of the hero)
- [ ] `teacup-mint.webp`, `hands-glass.webp` (stories)
- [ ] `herbal-flatlay.webp` (Glow Ritual Bundle card fallback)
- [ ] `bathroom-sink.webp` (closing CTA)

Other:

- [ ] SkinFusion pouch photo (`src/assets/skinfusion-pouch.jpg` is missing; the hero centre and
      the Skin Glow Tea product use the brewed-cup photo instead)
- [ ] Client confirms ownership of the existing site images in `src/assets/` (brew, hero-2,
      ritual, journal-3, four ingredient photos)
- [ ] Real product photos for Calm Night, Gut Balance and Glow Ritual Bundle
- [ ] Pages for FAQs, Shipping & returns, Privacy policy, Terms of service (footer shows them as
      plain text until they exist)
- [ ] Delete `public/media/demo/` and MEDIA_CREDITS.md entries once nothing references them
