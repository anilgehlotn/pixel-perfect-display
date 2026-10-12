# SkinFusion storefront

Frontend for SkinFusion, a premium skin-wellness tea brand (TCM-inspired, Mumbai, prices in INR).
Server-rendered with TanStack Start and deployed on Vercel. The backend will be headless Shopify
(Storefront API for products and cart, Shopify's hosted checkout for payment). Until the store is
connected, products come from `src/data/content.ts` and the cart is saved in the browser.

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
│   │   ├── Hero.tsx           Headline, pills, floating product composition
│   │   ├── Sections.tsx       Product row, bundle, how it works, TCM 101, sourcing, closing CTA
│   │   ├── Stories.tsx        Stories scroller (drag, drift, video cards)
│   │   └── media.tsx          Img, LoopVideo, PlayPill, VideoDialog (all media goes through these)
│   ├── components/site/
│   │   ├── Chrome.tsx         Floating pill nav, mobile menu, footer, cart drawer, toasts,
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

| URL             | File                           | What it shows                                                                                        |
| --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `/`             | `src/routes/index.tsx`         | Homepage (see "Homepage"). Loader: all products + featured product                                   |
| `/real-results` | `src/routes/real-results.tsx`  | Before/after sliders, video stories, serum comparison, ingredient spotlight, story form, product CTA |
| `/quiz`         | `src/routes/quiz.tsx`          | 4-question skin quiz with a product recommendation. Linked from the hero and the Explore menu        |
| anything else   | `__root.tsx` NotFoundComponent | 404 page (inside the normal header/footer)                                                           |

**There is no product page yet** (no `/product/...` or `/products/...` route). Building it is a
separate task. When it is built, it should be `src/routes/products/$handle.tsx` with a loader
calling `getProduct(params.handle)`.

Homepage sections are reached with anchors: `/#shop`, `/#bundle`, `/#ingredients`, `/#learn`,
`/#stories`, `/#sourcing`.

To add a page: create `src/routes/<name>.tsx` with `createFileRoute("/<name>")`. The dev server
regenerates `routeTree.gen.ts` automatically.

## Main components

- `__root.tsx`: the app shell. Loads the Jost font and `styles.css`, sets site-wide meta tags from
  `lib/seo.ts` (plus `noindex` on Vercel preview builds), and wraps every page in
  `CartProvider` + `Header` + `Footer`, with the cart drawer, toasts, WhatsApp button and
  10%-off badge floating on top. Also holds the 404 and error screens.
- `Header` (Chrome.tsx): two floating translucent cream pills, 24px from the top (16px on
  phones). Left: logo + `nav.main` (Shop, Ingredients, Learn). Right: "Sign in" (or the
  account initial), cart, coral "Get started" pill to /quiz. Phones: one pill with logo, cart and
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

1. **Hero** (`Hero.tsx`): sentence-case headline, one line, "Take the quiz" (coral) and "Shop
   now" (outline). Product composition: the centre image in a stadium crop, four ingredient
   circles and a small looping video. Desktop: pieces float gently (CSS) and drift at different
   speeds with scroll (`data-depth`).
2. **Product row** (`#shop`): `getProducts()` as rounded cards. The media area plays a short muted
   video on hover (desktop) or while in view (phones) over the product photo; products without a
   photo show the fallback image from media.ts. Swipe with snap points on phones. Cards add the
   first variant to the cart (there is no product page yet).
3. **Bundle** (`#bundle`): blush card, copy, "Add 4 pouches" (adds the 4-pouch variant of the
   featured product) and a 2x2 collage of rounded shapes.
4. **How it works** (`#ingredients`): deep green block, counters for true facts only (4 whole
   ingredients, 0 preservatives, 0 caffeine), looping video, two text columns.
5. **TCM 101** (`#learn`): stacked copy, "Discover" pill, wide video thumbnail with a "Play" pill
   that opens the full-screen `VideoDialog`.
6. **Stories** (`#stories`, `Stories.tsx`): full-bleed strip of mixed shapes (half-visible circles
   at both edges, tall portraits, stadium above a quote, video cards with a "Play" pill, a green
   quote card). Desktop: drag to scroll with momentum, slow scroll-linked drift of the strip,
   slight parallax between cards. Phones: native swipe with snap points, no drift.
7. **Sourcing** (`#sourcing`): location label, heading, large rounded image, "Read more". The
   origin copy is DEMO until the client confirms it (`home.sourcing.isDemo`).
8. **Closing CTA**: blush bookend, "Start your glow ritual", "Shop now".
9. **Footer** (site-wide, see above).

Copy for all of it is in `home`, `hero` and `nav` in content.ts. Media is in `src/data/media.ts`.

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
- Checkout redirects to `checkoutUrl`. The local cart has none, so the button does nothing yet.
- Free-shipping threshold: `FREE_SHIPPING_THRESHOLD` in content.ts (699).

## Shopify plan (not connected yet)

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

Seed-inspired, client-approved (replaces the earlier square "Qi" style). Read from
`src/styles.css`. Use the tokens, never raw hex values in components.

Colors (Tailwind class names in brackets):

- Background cream `#fbf7f2` (`bg-background`, `text-cream` on dark blocks)
- Deep brand green `#1e4d3a` (`text-green`, `bg-green`): all headlines, dark blocks, footer,
  nav text. Cream on green is 9:1
- Coral `#e8807a`, hover `#d96e68` (`bg-primary`): the ONLY accent: primary buttons and small
  highlights. Text on coral is ink (`text-primary-foreground`, 6.1:1); never white (2.69:1)
- Blush `#f3e4e0` (`bg-blush`): soft cards (bundle, closing CTA, quotes)
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

| Animation                             | Desktop (>=1024px, mouse)                                                  | Mobile and tablet                                 |
| ------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| Intro loader (home, once per session) | Letters fade up, slide away, max 1.6s                                      | Same, max 1s                                      |
| Hero entrance                         | Nav fades down, headline lines rise from a mask, composition settles in    | Text fades up, composition fades in, buttons last |
| Hero composition                      | Pieces float (8s CSS loop) and drift at different speeds with scroll       | Static                                            |
| Big headlines (`lines`)               | Lines rise from a mask once                                                | Fade up once                                      |
| Images (`media`)                      | Scale 1.06 to 1 + fade in, 1.4s                                            | Same, 0.9s                                        |
| Cards                                 | y 48, stagger 0.1; lift 6px on hover                                       | y 20, stagger 0.05, max 6 per group               |
| Product videos                        | Play on hover / keyboard focus                                             | Play while in view (max 2 videos at once)         |
| Stories strip                         | Drag with momentum, strip drifts 140px with scroll, parallax between cards | Native swipe with snap points                     |
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

Design skills are installed in `.claude/skills/` (17 skills: design-taste-frontend,
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

Demo quotes (`home.stories.quotes` in content.ts, `isDemo: true`): invented sample quotes, must
become real customer quotes shared with permission:

- [ ] "It tastes like the jujube tea my grandmother made. My evening cup is the calmest part of
      my day." (Ananya, Bengaluru)
- [ ] "I swapped my second chai for it. Light, warm and easy to make at work." (Priya, Mumbai)
- [ ] "You can see every whole piece in the bag. Naturally sweet, no sugar needed." (Meera, Pune)
- [ ] Story video captions: "My morning routine", "Ten quiet minutes", "Windows open, kettle on"

Demo copy to confirm:

- [ ] Sourcing section (`home.sourcing`, `isDemo: true`): "Xinjiang, China", "Where our jujubes
      ripen" and the farm description. Replace with the real origins
- [ ] "How it fits your day": steeping time (about five minutes)
- [ ] Bundle copy: "Save up to 15%, with free shipping on the four-pack" must match live
      Shopify prices and shipping rules

Demo videos (`public/media/demo/videos/`, Mixkit Free License, all `isDemo: true` in media.ts):

- [ ] `tea-steeping.mp4` (TCM 101 modal, Glow Ritual Bundle card, stories)
- [ ] `tea-steam.mp4` (How it works)
- [ ] `morning-window.mp4` (hero)
- [ ] `window-calm.mp4` (Calm Night Blend card)
- [ ] `skincare-routine.mp4` (stories)
- [ ] `skincare-closeup.mp4` (Skin Glow Tea card)
- [ ] `leaves-sunlight.mp4` (Gut Balance Tea card)
- [ ] `flowers-breeze.mp4` (stories)

Demo photos (`public/media/demo/photos/`, Pexels License, all `isDemo: true`):

- [ ] `window-tea.webp` (Calm Night card fallback, stories)
- [ ] `red-dates.webp` (sourcing)
- [ ] `ginger-lemon.webp` (Gut Balance card fallback)
- [ ] `glass-teapot.webp`, `hands-cup.webp`, `bathroom-shelf.webp` (bundle collage)
- [ ] `teacup-mint.webp`, `hands-glass.webp` (stories)
- [ ] `herbal-flatlay.webp` (Glow Ritual Bundle card fallback)
- [ ] `bathroom-sink.webp` (closing CTA)

Other:

- [ ] SkinFusion pouch photo (`src/assets/skinfusion-pouch.jpg` is missing; the hero centre and
      the Skin Glow Tea product use the brewed-cup photo instead)
- [ ] Client confirms ownership of the existing site images in `src/assets/` (brew, hero-2,
      ritual, journal-3, four ingredient photos)
- [ ] Real product photos for Calm Night, Gut Balance and Glow Ritual Bundle (from Shopify)
- [ ] Pages for FAQs, Shipping & returns, Privacy policy, Terms of service (footer shows them as
      plain text until they exist)
- [ ] Delete `public/media/demo/` and MEDIA_CREDITS.md entries once nothing references them
