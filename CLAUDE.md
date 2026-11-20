# SkinFusion storefront

Frontend for SkinFusion, a premium skin-wellness tea brand (TCM-inspired, Mumbai, prices in INR).
Server-rendered with TanStack Start and deployed on Vercel. The backend will be headless Shopify
(Storefront API for products and cart, Shopify's hosted checkout for payment). Until the store is
connected (VITE_SHOPIFY_* variables empty), products come from `src/data/content.ts` and the cart
is saved in the browser. With the variables set, products and cart come from Shopify (see
"Shopify (connected)").

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
| @fontsource/marcellus     | 5.x      | Self-hosted Marcellus, the serif for headings                                        |
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
│   │   ├── Hero.tsx           Full-bleed photo hero with headline, two buttons and rating
│   │   ├── Sections.tsx       Benefit strip, bestsellers, shop by ritual, featured product,
│   │   │                      campaign banner, learn cards
│   │   └── media.tsx          Img, LoopVideo, PlayPill, VideoDialog (all media goes through these)
│   ├── components/product/    Shared by the homepage and the product page
│   │   ├── ProductCard.tsx    Product card (photo, tag, rating, MRP, % OFF, pack dropdown, Add to cart)
│   │   ├── BuyBox.tsx         Price, pack choice, quantity, Add to cart, highlights
│   │   ├── purchase.ts        usePurchase() (selected pack + quantity), pouches(), savePercent()
│   │   ├── Gallery.tsx        Product photo gallery (+ gallery-image.ts converters)
│   │   ├── Blocks.tsx         SectionIntro, ComparisonTable, Standards, Ingredients, Steps,
│   │   │                      Reviews, Disclosure (accordion), Faq
│   │   └── icons.tsx          Icon: Phosphor icon by the name used in content.ts
│   ├── components/site/
│   │   ├── Chrome.tsx         Announcement bar, header, mobile menu, footer, cart drawer, toasts,
│   │   │                      WhatsApp button, 10%-off popup, newsletter form
│   │   ├── ProductImage.tsx   Product photo: WebP source + JPG fallback, fixed width/height
│   │   ├── Stars.tsx          Star rating (real-results page)
│   │   ├── IntroLoader.tsx    Markup for the CSS intro loader
│   │   └── AnimationRuntime.tsx  Page-wide animation housekeeping (Lenis, ScrollTrigger refresh)
│   ├── data/content.ts        Product data (until Shopify) and ALL marketing copy
│   ├── data/media.ts          EVERY homepage photo and video, grouped by section (one-line swaps)
│   ├── lib/
│   │   ├── animations/        All animation code, see "Animations" below
│   │   ├── media/playback.ts  Shared video rules (autoplay checks, 2-video limit on phones)
│   │   ├── scroll-lock.ts     useScrollLock(): shared page scroll lock for drawers/menus/modals
│   │   ├── shopify/
│   │   │   ├── types.ts       Product / variant / image / money types shaped like Shopify
│   │   │   ├── products.ts    getProducts() and getProduct(handle): the only way to read products
│   │   │   ├── client.ts      storefrontFetch(): Storefront API GraphQL helper (unused until connected)
│   │   │   └── config.ts      Reads the VITE_SHOPIFY_* environment variables
│   │   ├── cart/
│   │   │   ├── context.ts     Cart types (Shopify Cart shape) and the useCart() hook
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

| URL                 | File                              | What it shows                                                                                        |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                 | `src/routes/index.tsx`            | Homepage (see "Homepage"). Loader: all products + featured product                                   |
| `/real-results`     | `src/routes/real-results.tsx`     | Before/after sliders, video stories, serum comparison, ingredient spotlight, story form, product CTA |
| `/quiz`             | `src/routes/quiz.tsx`             | 4-question skin quiz with a product recommendation. Linked from the hero and the Explore menu        |
| `/products/:handle` | `src/routes/products/$handle.tsx` | Product page (see "Product page"). Loader: `getProduct(handle)` + related products                   |
| anything else       | `__root.tsx` NotFoundComponent    | 404 page (inside the normal header/footer)                                                           |

Product cards, the featured block, the nav ("Skin Glow Tea") and the footer link to
`/products/<handle>`. Unknown handles show the 404 page.

Homepage sections are reached with anchors: `/#shop`, `/#bundle`, `/#ingredients`, `/#learn`,
`/#reviews`. (The sourcing copy stays in content.ts but is not shown.)

To add a page: create `src/routes/<name>.tsx` with `createFileRoute("/<name>")`. The dev server
regenerates `routeTree.gen.ts` automatically.

## Main components

- `__root.tsx`: the app shell. Loads the Jost font and `styles.css`, sets site-wide meta tags from
  `lib/seo.ts` (plus `noindex` on Vercel preview builds), and wraps every page in
  `CartProvider` + `Header` + `Footer`, with the cart drawer, toasts, WhatsApp button and
  10%-off badge floating on top. Also holds the 404 and error screens.
- `Header` (Chrome.tsx): a wine announcement bar (`announcement` in content.ts; desktop shows
  every message, phones the first, no motion), then a sticky white header in two rows: "Take
  the quiz" on the left, the centred SkinFusion wordmark with its jujube-slice mark, "Sign in"
  (or the account initial) and cart on the right; `nav.main` links centred below (desktop). Phones: menu button, logo, cart;
  the menu is full-screen with large uppercase links. The header hides while scrolling down and
  comes back on scroll up or keyboard focus. Page routes use the router `Link`, `/#section`
  anchors stay plain links. The header is in the page flow (sticky), so pages need no extra top
  padding for it.
- `Footer`: blush, ink text: logo, mission line, newsletter with consent text, five link
  columns (`footer.columns` in content.ts), legal line and wellness disclaimer.
- `CartDrawer`: slides in from the right, free-shipping progress bar, quantity controls, subtotal,
  Checkout button.
- WhatsApp button and the 10%-off badge carry `data-float`; they move up while the product
  page's sticky "Add to cart" bar is visible on phones (`html[data-sticky-cta]`).
- Scroll animations: add a `data-anim` attribute in the markup (see "Animations").
- Any overlay (drawer, menu, modal) calls `useScrollLock(open)`. Never set `body.style.overflow`
  directly.

## Homepage

Indian premium wellness style, from the client's references: Vahdam and Kama Ayurveda (cream,
deep green, gold serif headings, arch-framed photos), Ritual (calm, roomy sections) and Blue Tea
(shop-first product cards). They are references for style only: never copy their text, images,
logos or press. Sections, in order (`src/routes/index.tsx`):

1. **Hero** (`Hero.tsx`): full-bleed photo (`media.hero`). Desktop: copy over the calm left
   side with a cream wash; phones: photo on top. Gold kicker, green serif headline, line,
   green "Shop Skin Glow Tea", outline "Take the skin quiz", gold star rating.
2. **Benefit strip**: gold band with five true facts (`trust`).
3. **Bestsellers** (`#shop`): `ProductCard`s: square real photo, "Best seller" tag, rating
   and count, name, price with MRP crossed out and "% OFF", pack dropdown (products with several
   packs), green "Add to cart". Swipe on phones.
4. **Shop by ritual**: four arch-framed photos (`rituals`, `media.rituals`), one per product.
5. **Ingredients** (`#ingredients`): four arch photos with Chinese names, then counters.
6. **Featured** (`#bundle`): arch photo and the featured product's `BuyBox`.
7. **Campaign banner**: wide photo and green panel (`campaign`, `media.campaign`).
8. **Comparison**: "SkinFusion vs. the rest", our column in green.
9. **Our promise** (`Standards`): gold line icons in circles.
10. **Reviews** (`#reviews`): arch photos with quotes (demo).
11. **Learn, sip and glow** (`#learn`): three cards; the first plays the TCM 101 film.

Copy: `hero`, `trust`, `rituals`, `campaign`, `home`, `comparison`, `standards`,
`ingredients`, `reviews` in content.ts. Media: `src/data/media.ts`.

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
4. Products with an entry in `productDetails` (content.ts) also get: "Why it belongs in your
   day" (six benefit cards), "How to enjoy" with tasting notes, the
   ingredients block, the comparison table and an FAQ. Today only `skin-glow-tea` has details; the others show the buy
   box, a "coming soon" description, reviews and related products, and no ingredient claims.
5. Reviews, related products ("You may also like"), wellness disclaimer.
6. Phones and tablets: a sticky bar with price and "Add to cart" slides up once the main button
   scrolls out of view.

Benefit copy must follow the claims rules: "traditionally used", "customers say", "a daily
ritual"; never treats, cures, heals, reduces or prevents, and no promised results.

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

1. Product data lives in `localProducts` in `src/data/content.ts`, shaped like the Shopify
   Storefront API (`src/lib/shopify/types.ts`): `handle`, `title`, `description`, `tags`,
   `featuredImage`, `images`, `priceRange`, `compareAtPriceRange`, `variants`.
2. `getProducts()` / `getProduct(handle)` in `src/lib/shopify/products.ts` return them. **Nothing
   else imports product data.**
3. Routes call those functions in their `loader`, so the server renders pages with the data.
   Components read it with `Route.useLoaderData()` or get it as props.

Details:

- Prices are decimal strings (`"649.00"`) like Shopify. Use `money(price)` to get a number, then
  `inr()` / `rs()` to display.
- Skin Glow Tea has 3 variants: 1, 2 and 4 pouches, each with its own price. The pack discount
  is baked into the variant price (2 pouches = 1168.20, 4 = 2206.60). `note` is the line shown
  under each pack button.
- Badges come from tags: `best-seller` shows the round "Best Seller" badge, `label:<text>` shows a
  small corner label (e.g. `label:Save 10%`).
- `subtitle` ("20 tea bags · 100g") and `rating` map to Shopify metafields `custom.subtitle`,
  `reviews.rating` and `reviews.rating_count`. Variant `note` maps to `custom.pack_note`.
- `images: []` / `featuredImage: null` shows a beige "image coming soon" box.
- `FEATURED_PRODUCT_HANDLE` in content.ts picks the product for the featured section, quiz result
  and real-results CTA.

## How the cart works

- `useCart()` (`src/lib/cart/context.ts`) gives: `lines`, `count`, `subtotal`, `checkoutUrl`,
  `add(product, variant, quantity?, { openDrawer })`, `setQty(lineId, quantity)`,
  `open`/`setOpen` (drawer) and `toast`.
- Lines mirror Shopify's `CartLine`: `{ id, quantity, merchandise: { id (variant id), title,
price, image, product: { handle, title } } }`. Adding the same variant again increases its
  quantity; different packs are separate lines. Quantity 0 removes the line.
- `CartProvider` never touches storage directly. It calls a `CartStore` (`src/lib/cart/store.ts`)
  with `load`, `add` and `update`. The current `localCartStore` saves lines in localStorage
  (`skinfusion-cart-v1`), so the cart survives a refresh.
- The cart loads after the page hydrates, so the server-rendered HTML always shows an empty cart.
- Checkout (`checkout()` in the cart context) waits for pending cart changes, calls
  `linkCartToCustomer` when the cart is a Shopify cart, then redirects to `checkoutUrl`. The local
  cart has no `checkoutUrl`, so the button is disabled without Shopify.
- `CartProvider` uses `shopifyCartStore` when `isShopifyConfigured`, else `localCartStore`.
  The Shopify store keeps only the cart id in localStorage (`skinfusion-shopify-cart-id`); a
  cart that expired or was checked out is dropped and a new one is created on the next add.
- Free-shipping threshold: `FREE_SHIPPING_THRESHOLD` in content.ts (699).

## Shopify (connected)

Store: `nwqmeu-cu.myshopify.com`. Product handles in Shopify match `localProducts`
(`skin-glow-tea`, `calm-night`, `gut-balance`, `glow-bundle`); tags `best-seller` and
`label:Save 10%` drive the badges. `getProducts()` / `getProduct()` query the Storefront API and
fill fields Shopify lacks (photos, subtitle, rating, pack note, description) from the local
product with the same handle; on any Storefront error they return `localProducts`.
`VITE_SHOPIFY_STOREFRONT_TOKEN` is accepted as an alias of `VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN`.

### Original plan (done)

Environment variables (see `.env.example`, set them in `.env.local` locally and in Vercel):
`VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN`, optional
`VITE_SHOPIFY_API_VERSION` (default `2026-07`).

Rules:

- Only the Storefront API **public** access token. Never an Admin API token (`shpat_...`)
  anywhere in this project: every `VITE_` variable ends up in the browser bundle.
- `.env` and `.env.*` are git-ignored, except `.env.example`.

Steps to connect:

1. Products: replace the bodies of `getProducts()` and `getProduct(handle)` with
   `storefrontFetch()` queries (`products(first:)`, `product(handle:)`), flatten `edges/nodes`
   and map the response to the `Product` type (metafields for subtitle, rating, pack note).
   Nothing else needs to change.
2. Cart: write `shopifyCartStore` implementing `CartStore`. `load` reads a saved cart id from
   localStorage and queries `cart(id:)`; `add` calls `cartCreate` (first item) or
   `cartLinesAdd`; `update` calls `cartLinesUpdate`. Map the response to `Cart`, including
   `checkoutUrl`. Then switch `const store = localCartStore` in `CartProvider.tsx`.
3. Checkout: already redirects to `checkoutUrl` (Shopify hosted checkout).
4. Remove `localProducts` from content.ts once Shopify is live. Marketing copy stays there.

## Customer accounts

Shopify **Customer Account API** (version `2026-10`), OAuth 2.0 with PKCE. Customers sign in on
Shopify's hosted page with a one-time email code. Sign-in and sign-up are the same flow: the first
sign-in creates the account. There are no password forms, and the deprecated Storefront API
customer mutations (`customerCreate`, `customerAccessTokenCreate`) are never used.

Docs used: shopify.dev Customer Account API reference (2026-10: authentication, discovery,
token, refresh, logout, rate limits), "Getting started with the Customer Account API",
"Manage customer accounts", the `Customer`, `Order`, `LineItem`, `Fulfillment`,
`CustomerAddress`, `CustomerEmailAddress` objects and order enums, and "Authenticate buyers in
checkout".

### How sign-in works

1. "Continue with email" links to `/account/authorize?redirect=/where/to/go`.
2. That server route creates `state`, `nonce` and a PKCE verifier, stores them in a 10-minute
   httpOnly cookie scoped to `/account`, and redirects to Shopify's authorization endpoint
   (found through `/.well-known/openid-configuration` on the store domain).
3. Shopify sends the customer back to `/account/callback?code=…&state=…`. The server checks
   `state`, exchanges the code with the verifier (adding `Origin`, `User-Agent`, and Basic auth
   only for confidential clients), checks the id_token `nonce`, audience and expiry, and stores
   the tokens in httpOnly cookies. Any failure goes to `/account/login?error=…` with a branded
   message and "Try again".
4. Every account request runs on the server and reads the token from the cookie. A token about
   to expire is refreshed on the server; if the refresh fails the session is cleared and the
   customer goes back to sign-in.
5. `/account/logout` clears the cookies, ends the Shopify session (`end_session_endpoint` with
   `id_token_hint`) and returns home with a "You've been signed out" notice. The cart stays.

Cookies (all `HttpOnly`, `SameSite=Lax`, `Secure` in production): `sf_ca_at` (expiry + access
token), `sf_ca_rt` (refresh token, 30 days), `sf_ca_idt` (id_token, needed for logout),
`sf_ca_name` (first name for the header badge), `sf_ca_oauth` (10 minutes, during sign-in).
Tokens never reach client JavaScript, URLs, localStorage or logs. The one exception required by
Shopify: the id_token is sent to Shopify's own logout URL as `id_token_hint`.

### Files

| Path                                                          | What it does                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/lib/customer/server/env.ts`                              | Server-only settings, `isConfigured()`, `isMockMode()`                                       |
| `src/lib/customer/server/oauth.ts`                            | Discovery, PKCE, authorize URL, token exchange and refresh, id_token checks, logout URL      |
| `src/lib/customer/server/cookies.ts`                          | Cookie names and writers; `redirectWithCookies()` for the auth routes                        |
| `src/lib/customer/server/session.ts`                          | Token storage, automatic refresh, `readSession()`                                            |
| `src/lib/customer/server/customer-api.ts`                     | GraphQL queries and mutations (customer, orders, order, addresses, details, email marketing) |
| `src/lib/customer/server/account.ts`                          | `withAccount()`: mock data or the real API, plus no-store and sign-in redirects              |
| `src/lib/customer/server/mock.ts`                             | Dev-only sample customer, orders and addresses                                               |
| `src/lib/customer/server/storefront-cart.ts`                  | `cartBuyerIdentityUpdate` on the Storefront API                                              |
| `src/lib/customer/functions.ts`                               | Server functions the pages call (the only bridge from the browser)                           |
| `src/lib/customer/validation.ts`                              | Address and details rules (shared by forms and server), `safeRedirect()`                     |
| `src/lib/customer/india.ts`, `format.ts`, `types.ts`          | States and UTs, date and status labels, shared types                                         |
| `src/routes/account/authorize.ts`, `callback.ts`, `logout.ts` | Server routes for the OAuth flow                                                             |
| `src/routes/account/login.tsx`                                | Sign-in page                                                                                 |
| `src/routes/account/_dashboard.tsx`                           | Protected layout (server-side guard, greeting, account nav)                                  |
| `src/routes/account/_dashboard/*`                             | Overview, orders, order detail, addresses, details                                           |
| `src/components/account/*`                                    | Form fields, badges, order card, address form, nav, unsaved-changes guard                    |

Files under `*/server/*` cannot be imported by browser code (vite.config.ts import
protection). Never import them from components; go through `functions.ts`.

### Protection and caching

- `/account/_dashboard` `beforeLoad` calls `fetchSession()` on the server and redirects to
  `/account/login?redirect=<path>` when signed out. Every server function checks the session
  again, so an expired session mid-visit also lands on sign-in.
- The customer is always identified by the token in the cookie. IDs sent from the browser are
  only order or address IDs, validated by format, and Shopify only returns the signed-in
  customer's own data for them.
- `safeRedirect()` allows only same-site paths (no `//host`, schemes or backslashes, never the
  auth routes).
- Account routes and server functions send `Cache-Control: private, no-store`, and Nitro adds
  the same header for `/account/**`. Nothing under `/account` is prerendered.

### Mock mode (local development)

With the Shopify variables empty, `npm run dev` runs a mock: "Continue with email" signs you in
as a sample customer (Ananya Rao) with 2 addresses. `/account/login` shows developer links for 0,
3 or 25 orders (`/account/authorize?orders=25`). Address and detail changes are kept in memory
until the dev server restarts. `isMockMode()` requires `import.meta.env.DEV`, so mock code is
removed from every production build. A production build without the variables shows "Accounts
are coming soon" instead.

Known dev-server quirk: Vite's dev and preview servers on Node 20 send only one `Set-Cookie`
per response, so the mock uses a single cookie. The real flow sets several cookies at once; it
works on the production server and on Node 24 (Vercel). To test the real flow locally, run
`npm run build` then `node .output/server/index.mjs` (or use Node 24 for `npm run dev`).

### Linking the cart for checkout

`linkCartToCustomer({ data: { cartId } })` (server function) calls the Storefront API
`cartBuyerIdentityUpdate` with the customer's access token as
`buyerIdentity.customerAccessToken`, and returns the cart's `checkoutUrl`. Checkout is then
prefilled and signed in. The cart is still local, so nothing calls it yet. Once the Shopify
cart store exists (see "Shopify plan"), call it:

- after `cartCreate` when the customer is signed in,
- after sign-in if a cart already exists (for example on the first page load after
  `/account/callback`),
- right before redirecting to `checkoutUrl` (the token may have been refreshed).

The cart itself is never cleared on sign-in or sign-out.

### Switching from mock to real Shopify

1. Shopify admin: Settings > Customer accounts: choose customer accounts (the new, passwordless
   ones) and save.
2. Install the **Headless** sales channel (Shopify App Store), open it, create a storefront.
3. In that storefront: **Customer Account API settings**.
   - Client type: Public (recommended; PKCE, no secret). If you choose Confidential, also copy the
     secret into `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET`.
   - Copy the **Client ID** into `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`.
   - Under **Application setup**, add for each environment:
     - Callback URI: `https://skinfusion.in/account/callback`
     - JavaScript origin: `https://skinfusion.in`
     - Logout URI: `https://skinfusion.in/`
   - Shopify requires HTTPS, so `http://localhost` is not accepted.
4. Set the variables in Vercel (Settings > Environment Variables): `SHOPIFY_STORE_DOMAIN` (or
   `SHOPIFY_SHOP_ID`, shown on the Customer Account API page), `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`,
   `APP_BASE_URL` (the site origin), and the secret only for a confidential client.
5. Testing before launch: register a stable preview domain, for example a Vercel branch alias
   `https://staging-skinfusion.vercel.app`, with the same three URLs, and set `APP_BASE_URL` to it
   for the Preview environment. Random per-deploy preview URLs change every push and can't all be
   registered. For a laptop, use an HTTPS tunnel (ngrok or Cloudflare Tunnel) to the production
   build and register the tunnel's HTTPS URL.

## Editing content (src/data/content.ts)

Marketing copy stays in this file even after Shopify is connected:

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

Indian premium wellness direction (replaces the Qi-inspired, jujube/serif and Seed-inspired
versions). Read from `src/styles.css`. Use the tokens, never raw hex values in components.

Colors (Tailwind class names in brackets):

- White pages (`bg-background`, `bg-surface`); cream sections `#f9f4ec` (`bg-blush`) and the
  photo backdrop `#f6efe3` (`bg-sand`)
- Deep tea green `#1d4a39` (`bg-green`, `text-green`, also `bg-primary`): buttons, headline
  text, announcement bar, footer, our comparison column. White on green is 10.6:1. The older
  names `coral`, `wine` and `jujube` point at the same green
- Antique gold `#a8803f` (`text-gold`): large serif section titles and stars only (3.3:1, large
  text). Gold-deep `#84612b` (`text-gold-deep`, `bg-gold-deep`): small gold text, the benefit
  strip (white text 5.4:1)
- Gold-beige `#efe2c6` (`bg-rose`): "Best seller" tags and "% OFF" chips, green text
- Ink `#23201c`; muted text `#5f5a52` (6.4:1 on white)

Typography: Marcellus (self-hosted) for headings, sentence case: `display` (hero, 37-70px),
`headline` (product title, feature headings), `title` (section titles in gold, 30-46px). h1-h4
default to Jost in green; use the utilities for serif. Jost for everything else:
body 16px / 1.65, buttons uppercase 0.875rem with 0.1em spacing. One short eyebrow line in ink
above a section title.

Shapes: arch frames (`rounded-t-full` on a 4:5 or square box) for ritual, ingredient, featured
and review photos; square product photos; buttons 2px radius, 48px high; circles for icons.

Buttons: `btn btn-primary` (green, white text), `btn btn-outline` (green line), `btn btn-cream`
(cream outline on green), `btn-light` (cream fill on green). Text links: green underline,
6px offset.

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
and `<main ref={scope}>`. Never put `data-depth` and another transform animation (CSS float,
`data-anim`) on the same element: nest wrappers (see `Piece` in Hero.tsx).

### What plays where

| Animation                             | Desktop (>=1024px, mouse)                                                  | Mobile and tablet                         |
| ------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| Intro loader (home, once per session) | Letters fade up, slide away, max 1.6s                                      | Same, max 1s                              |
| Hero entrance                         | Nav fades down, headline lines rise from a mask, kicker and rating fade in | Text fades up, buttons last               |
| Big headlines (`lines`)               | Lines rise from a mask once                                                | Fade up once                              |
| Images (`media`)                      | Scale 1.06 to 1 + fade in, 1.4s                                            | Same, 0.9s                                |
| Cards                                 | y 48, stagger 0.1; lift 6px on hover                                       | y 20, stagger 0.05, max 6 per group       |
| Product videos                        | Play on hover / keyboard focus                                             | Play while in view (max 2 videos at once) |
| Counters                              | Count up once                                                              | Same                                      |
| Nav                                   | Hides on scroll down, shows on scroll up                                   | Same                                      |
| Footer                                | Slides up, columns fade in one by one                                      | Same, smaller distances                   |
| Smooth scroll                         | Lenis                                                                      | Native                                    |

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

Design skills are installed in `.claude/skills/` (18 skills: frontend-design (Anthropic,
Apache 2.0), design-taste-frontend,
high-end-visual-design, minimalist-ui, redesign-existing-projects, ui-ux-pro-max, ui-styling,
design-system, brand, web-design-guidelines, writing-guidelines, full-output-enforcement,
vercel-react-best-practices, vercel-composition-patterns, gsap-core, gsap-react,
gsap-scrolltrigger, gsap-performance). Use them for every UI task. Some include helper
scripts; do not run them unless a task needs one.

When rules conflict, this order wins:

1. The client-approved SkinFusion design system in this file.
2. Accessibility, performance and mobile rules.
3. Skill defaults.

Approved style (Indian premium wellness; ignore any skill rule that bans it):

- Deep green and antique gold on white and cream; Marcellus serif headings, Jost body.
- Arch-framed photos, square product photos, green buttons.
- Real photography only: no illustrated packaging.
- Conversion-first structure: announcement bar, trust strip, product grid with Add to cart,
  comparison table, standards icons, reviews, detailed product page.
- Vahdam, Kama Ayurveda, Ritual and Blue Tea are style references ONLY: never copy their
  media, logos, icons, text, product names or press logos.

Ignore every "variance" or "randomize the layout" rule: SkinFusion pages must stay
consistent with each other.

Always keep from the skills: no emojis, no AI clichés, no Inter / Roboto / Arial, no generic
purple or blue gradients, no heavy shadows, 44px touch targets, 4.5:1 text contrast, visible
focus states, zero layout shift, transform/opacity-only animation, reduced-motion support,
complete code with no placeholders.

Gold contrast: `#a8803f` is for large serif text and stars only; small gold text uses
`gold-deep` `#84612b`.

## Rules for all future work

- No emojis anywhere (UI, copy, code comments, commits).
- No AI clichés in copy: "elevate", "seamless", "unlock", "transform your", "journey",
  "game-changer", "delve", "curated", "empower", "revolutionize" and similar.
- Never use Inter, Roboto or Arial. Jost (body) and Marcellus (headings) are the only fonts.
- Headings: `display`, `headline`, `title` (Marcellus, sentence case).
- Buttons: `btn btn-primary` (green, white text), `btn btn-outline`. One label per intent.
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
- Never put an Admin API token or any secret in the frontend or in a `VITE_` variable.
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

Demo quotes (`reviews.quotes` in content.ts, `isDemo: true`): invented sample quotes, must
become real customer quotes shared with permission (the cards show no "verified" label until
then):

- [ ] "It tastes like the jujube tea my grandmother made. My evening cup is the calmest part of
      my day." (Ananya, Bengaluru)
- [ ] "I swapped my second chai for it. Light, warm and easy to make at work." (Priya, Mumbai)
- [ ] "You can see every whole piece in the bag. Naturally sweet, no sugar needed." (Meera, Pune)

Demo copy to confirm:

- [ ] Sourcing copy (`home.sourcing`, `isDemo: true`, not shown at the moment): "Xinjiang, China", "Where our jujubes
      ripen" and the farm description. Replace with the real origins
- [ ] "How it fits your day": steeping time (about five minutes)
- [ ] Announcement bar and pack notes: "Save up to 15%", "15% off + free shipping" must match
      live Shopify prices and shipping rules
- [ ] Comparison table (`comparison`): client confirms every row
- [ ] Product page copy for Skin Glow Tea (`productDetails`): benefits, FAQ, tasting notes
- [ ] Ingredient lists and details for Calm Night, Gut Balance and Glow Ritual Bundle (add
      them to `productDetails`)
- [ ] Ratings and review counts (local stand-ins until Shopify review metafields are set)

Demo videos (`public/media/demo/videos/`, Mixkit Free License, all `isDemo: true` in media.ts):

- [ ] `tea-steeping.mp4` (TCM 101 modal, Glow Ritual Bundle card)
- [ ] `window-calm.mp4` (Calm Night Blend card)
- [ ] `skincare-closeup.mp4` (Skin Glow Tea card)
- [ ] `leaves-sunlight.mp4` (Gut Balance Tea card)
- [ ] Not used by any page any more, delete with the demo folder: `tea-steam.mp4`,
      `morning-window.mp4`, `skincare-routine.mp4`, `flowers-breeze.mp4`

Demo photos (`public/media/demo/photos/`, Pexels License, all `isDemo: true`):

- [ ] `window-tea.webp` (Calm Night card fallback and gallery, review avatar)
- [ ] `ginger-lemon.webp`, `teacup-mint.webp` (Gut Balance card fallback and gallery)
- [ ] `herbal-flatlay.webp`, `glass-teapot.webp`, `bathroom-shelf.webp` (Glow Ritual Bundle
      card fallback and gallery)
- [ ] `hands-cup.webp` (Calm Night gallery), `hands-glass.webp` (review avatar)
- [ ] Not used by any page any more: `bathroom-sink.webp`, `red-dates.webp`

Other:

- [ ] SkinFusion pouch photo (`src/assets/skinfusion-pouch.jpg` is missing; the hero photo and
      the Skin Glow Tea product use the blush flat-lay and brewed-cup photos instead)
- [ ] Client confirms ownership of the existing site images in `src/assets/` (brew, hero-1, hero-2,
      ritual, journal-3, four ingredient photos)
- [ ] Real product photos for Calm Night, Gut Balance and Glow Ritual Bundle (from Shopify)
- [ ] Pages for FAQs, Shipping & returns, Privacy policy, Terms of service (footer shows them as
      plain text until they exist)
- [ ] Delete `public/media/demo/` and MEDIA_CREDITS.md entries once nothing references them
