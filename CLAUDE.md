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
├── src/
│   ├── assets/                Images imported by content.ts (Vite gives them hashed URLs)
│   ├── components/site/
│   │   ├── Chrome.tsx         Header, announcement bar, footer, cart drawer, toast, WhatsApp
│   │   │                      button, 10%-off popup
│   │   ├── Sections.tsx       Homepage blocks (hero, product carousel, featured product, reviews...)
│   │   ├── ProductImage.tsx   Product photo: WebP source + JPG fallback, fixed width/height
│   │   ├── GlowBadge.tsx      Round photo with rotating text ring (What's Inside)
│   │   ├── TiltedMarquee.tsx  Tilted double "SIP · GLOW · REPEAT" marquee before the footer
│   │   ├── IntroLoader.tsx    Markup for the CSS intro loader
│   │   └── AnimationRuntime.tsx  Page-wide animation housekeeping (Lenis, ScrollTrigger refresh)
│   ├── data/content.ts        Product data (until Shopify) and ALL marketing copy
│   ├── lib/
│   │   ├── animations/        All animation code, see "Animations" below
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
| `/`             | `src/routes/index.tsx`         | Homepage: all blocks from `Sections.tsx`. Loader: all products + featured product                    |
| `/real-results` | `src/routes/real-results.tsx`  | Before/after sliders, video stories, serum comparison, ingredient spotlight, story form, product CTA |
| `/quiz`         | `src/routes/quiz.tsx`          | 4-question skin quiz with a product recommendation. Linked from the hero and the Explore menu        |
| anything else   | `__root.tsx` NotFoundComponent | 404 page (inside the normal header/footer)                                                           |

**There is no product page yet** (no `/product/...` or `/products/...` route). Building it is a
separate task. When it is built, it should be `src/routes/products/$handle.tsx` with a loader
calling `getProduct(params.handle)`.

Homepage sections are reached with anchors: `/#shop`, `/#featured`, `/#inside`, `/#mission`,
`/#journal`.

To add a page: create `src/routes/<name>.tsx` with `createFileRoute("/<name>")`. The dev server
regenerates `routeTree.gen.ts` automatically.

## Main components

- `__root.tsx`: the app shell. Loads the Jost font and `styles.css`, sets site-wide meta tags from
  `lib/seo.ts`, and wraps every page in `CartProvider` + `Header` + `Footer`, with the cart
  drawer, toast, WhatsApp button and 10%-off badge floating on top. Also holds the 404 and error
  screens.
- `Header` (Chrome.tsx): fixed at the top. Transparent over the hero on the homepage, solid blush
  once you scroll or on any other page. Menu links come from `nav` in content.ts; page routes
  use the router `Link`, `/#section` anchors stay plain links. Mobile menu is a full-screen overlay.
- `CartDrawer`: slides in from the right, free-shipping progress bar, quantity controls, subtotal,
  Checkout button.
- `Sections.tsx`: `Hero`, `PopularTeas({ products })`, `FeaturedProduct({ product })`,
  `WhatsInside`, `UsVsThem`, `OurStandards`, `OurMission`, `Reviews`, `Journal`. Also exports
  `Stars`. Product sections get their data as props from the route loader.
- `ProductImage`: use for every product photo. Pass a `ShopifyImage`.
- Scroll animations: add a `data-anim` attribute in the markup (see "Animations").
- Any overlay (drawer, menu, modal) calls `useScrollLock(open)`. Never set `body.style.overflow`
  directly.

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

Read from `src/styles.css`. Use the tokens, never raw hex values in components.

Colors (Tailwind class names in brackets):

- Background cream `#fbf7f2` (`bg-background`)
- Blush `#f3e4e0` (`bg-blush`): header, footer, highlight sections
- Beige `#efe9e1` (`bg-beige`): image placeholders
- Ink / text `#1f1f1f` (`text-foreground`, `bg-ink`)
- Muted text `#6b635c` (`text-muted-foreground`)
- Coral primary `#e8807a`, hover `#d96e68` (`bg-primary`, `text-primary`): the ONLY accent color
- White on images (`text-on-image`, `border-on-image`)
- Pastels for the standards icons: `bg-pastel-peach|pink|blue|green|orange|yellow`
- Borders are very light: `rgba(0,0,0,0.06)`

Typography:

- One font: Jost, self-hosted from `@fontsource-variable/jost` (latin subset preloaded in
  `__root.tsx`). Weights used: 300, 400, 500. Body 17px, line-height 1.6
- All `h1`-`h4` are uppercase, `letter-spacing: 0.2em`, weight 400 (set globally)
- `label-caps`: small uppercase labels, 0.75rem, `letter-spacing: 0.22em`, weight 500
- Section titles: `text-xl md:text-3xl`. Body copy max width around `max-w-[65ch]`

Spacing and layout:

- `container-x`: max width 80rem, centered, 1.5rem side padding
- `section-y`: 4rem top/bottom padding, 7rem from 1024px up
- Section separation uses `border-t` or alternating `bg-blush`
- Corners are square: radius 0 on buttons, max 4px elsewhere (`rounded-banner`)
- Tap targets at least 44px (`h-11 w-11` icon buttons, 48px buttons)

Buttons:

- `btn btn-primary`: square coral button, uppercase, wide letter-spacing, min height 48px,
  shrinks to 98% on press
- `btn btn-outline`: square 1px ink border, fills ink on hover
- On photos: `btn border border-on-image text-on-image hover:bg-on-image hover:text-ink`
- Text links: `label-caps underline underline-offset-4`

Animation: see the "Animations" section below.

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
| `data-anim="heading"` | Section heading. Desktop: words fill from 15% to full ink while scrolling. Mobile: fades up once      |
| `data-anim="fade"`    | Block fades up once                                                                                   |
| `data-anim="cards"`   | Direct children rise in with a stagger (mobile: first 6 only)                                         |
| `data-anim="tilt"`    | Exactly 3 children: sides slide in and settle at -6/6deg, center rises, photo parallax (desktop only) |
| `data-anim="draw"`    | SVG paths draw themselves once                                                                        |
| `data-anim="pop"`     | Scales in from 0.85 once                                                                              |
| `data-count`          | The number in this element's text counts up once (final value is in the server HTML)                  |

A new page opts in with `const scope = useRef<HTMLElement>(null); useScrollAnimations(scope);`
and `<main ref={scope}>`.

### What plays where

| Animation                             | Desktop (>=1024px, mouse)                                                                    | Mobile and tablet                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Intro loader (home, once per session) | Letters fade up, slide away, max 1.6s                                                        | Same, max 1s                                          |
| Hero entrance                         | Header/nav fade down, image curtain wipe + scale, heading words rise from a mask, badge pops | Text fades up, image fades in from 1.04, buttons last |
| Section headings                      | Scrubbed ink fill per word                                                                   | Fade up once                                          |
| Cards                                 | y 48, stagger 0.1                                                                            | y 20, stagger 0.05, max 6 per group                   |
| Journal cards (tilt)                  | Slide in, settle at -6/6deg, parallax                                                        | Plain fade up                                         |
| Glow badge                            | Scales in, ring rotates (20s/turn)                                                           | Same, smaller                                         |
| Marquee                               | Speeds up while scrolling                                                                    | Constant speed                                        |
| Footer                                | Slides up, columns fade in one by one                                                        | Same, smaller distances                               |
| Smooth scroll                         | Lenis                                                                                        | Native                                                |
| Arrow nudge on hover                  | Yes                                                                                          | No                                                    |

Reduced motion: no loader, no movement, no marquee or badge rotation, no smooth scroll,
everything visible immediately. Without JavaScript: everything visible, no loader.

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
- Endless animations (marquee, badge, announcement bar) are CSS transform animations paused
  with `usePauseWhenHidden`.
- Elements animated by GSAP must not have a CSS `transition` on the same property
  (presets set `transition: none` while animating).
- Overlays use `useScrollLock`, which also stops Lenis.
- GSAP, SplitText and Lenis build into their own `animations` chunk (vite.config.ts).
- Use `dvh`, never `100vh`. The page wrapper uses `overflow-x: clip`; nothing may scroll
  sideways at 360px.

## Rules for all future work

- No emojis anywhere (UI, copy, code comments, commits).
- No AI clichés in copy: "elevate", "seamless", "unlock", "transform your", "journey",
  "game-changer", "delve", "curated", "empower", "revolutionize" and similar.
- Never use Inter, Roboto or Arial. Jost is the only font.
- Headings: uppercase Jost with wide letter-spacing (already global for h1-h4, keep it).
- Buttons: square coral (`btn btn-primary`). No rounded pill buttons.
- Animate only `transform` and `opacity`. Never animate width, height, top, left, margin or
  layout. Progress bars use `scaleX`, not width. (Only exceptions: the desktop hero's
  clip-path wipe and word colour, and the SVG squiggle's stroke-dashoffset, all play once.)
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
