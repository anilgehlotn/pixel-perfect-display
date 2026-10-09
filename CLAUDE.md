# SkinFusion storefront

Frontend for SkinFusion, a premium skin-wellness tea brand (TCM-inspired, India, prices in INR).
Frontend only: no backend, no real checkout. All content is static and lives in one file so a
backend or Shopify can replace it later.

## Tech stack

| Tool | Version | What it does here |
| --- | --- | --- |
| Node.js | 20.x (20.19+ required by Vite 8) | Runs the tooling |
| React | 19.2 | UI library |
| TanStack Start | 1.168 | Framework on top of Vite: server-side rendering (SSR) + file-based routing |
| TanStack Router | 1.170 | Routing (`<Link>`, `createFileRoute`). This is NOT React Router |
| TanStack Query | 5.x | Mounted in the root, not used for data yet |
| Vite | 8.1 | Dev server and bundler |
| Nitro | 3.0 beta | Packages the SSR server for a hosting platform (the "preset") |
| Tailwind CSS | 4.x | Styling. Configured in CSS (`src/styles.css`), there is no `tailwind.config.js` |
| TypeScript | 5.8 | Strict mode on |
| Phosphor Icons | 2.x | All site icons, always `weight="light"` |
| Vitest + Testing Library | 4.x | Tests (`src/test/`) |
| ESLint 9 + Prettier 3 | | Lint and formatting (Prettier runs as an ESLint rule) |

Important: this is a server-rendered TanStack Start app, not a plain single-page app.
There is no `index.html`. The HTML shell, `<title>` and meta tags are built in
`src/routes/__root.tsx` (site-wide) and in each route's `head()` (per page).

## Folder structure

```
.
├── public/                  Static files served as-is at the site root (favicon, robots.txt)
├── src/
│   ├── assets/              Images imported by content.ts (Vite gives them hashed URLs)
│   ├── components/
│   │   ├── site/            The real site components
│   │   │   ├── Chrome.tsx   Header, announcement bar, footer, cart drawer, toast, WhatsApp button, 10%-off popup
│   │   │   ├── Sections.tsx Homepage blocks (hero, product grid, featured product, reviews, journal...)
│   │   │   └── Reveal.tsx   Wrapper that fades/slides content in when it scrolls into view
│   │   └── ui/              shadcn/ui component library. Currently NOT used by any page
│   ├── data/content.ts      ALL storefront content: products, prices, copy, image imports
│   ├── hooks/               use-mobile.tsx (only used by ui/sidebar)
│   ├── lib/
│   │   ├── cart.tsx         Cart state (React context) + price formatters inr() and rs()
│   │   ├── utils.ts         cn() helper for merging Tailwind classes
│   │   ├── error-capture.ts Server-side error logging helper
│   │   └── error-page.ts    Plain HTML shown if server rendering crashes
│   ├── routes/              One file per page (file-based routing)
│   ├── routeTree.gen.ts     AUTO-GENERATED route list. Never edit by hand
│   ├── router.tsx           Creates the router
│   ├── server.ts            SSR server entry (wraps errors in error-page.ts)
│   ├── start.ts             TanStack Start middleware (error handling, CSRF)
│   ├── styles.css           Tailwind setup, design tokens, custom utilities, animations
│   └── test/                Vitest setup and a routing smoke test
├── components.json          shadcn/ui settings
├── eslint.config.js         Lint rules
├── tsconfig.json            TypeScript settings, `@/` alias -> `src/`
├── vite.config.ts           Build config
└── vitest.config.ts         Test config
```

## Pages and routes

| URL | File | What it shows |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Homepage: all blocks from `Sections.tsx` |
| `/real-results` | `src/routes/real-results.tsx` | Before/after sliders, video stories, serum comparison, ingredient spotlight, story submission form |
| `/quiz` | `src/routes/quiz.tsx` | 4-question skin quiz with a product recommendation (not linked from the nav) |
| anything else | `__root.tsx` `NotFoundComponent` | 404 page |

There is no separate product page. Homepage sections are reached with anchors:
`/#shop`, `/#featured`, `/#inside`, `/#mission`, `/#journal`.

To add a page: create `src/routes/<name>.tsx` with `createFileRoute("/<name>")`. The dev server
regenerates `routeTree.gen.ts` automatically. See `src/routes/README.md` for dynamic routes.

## Main components

- `__root.tsx`: the app shell. Loads the Jost font and `styles.css`, sets site-wide meta tags, and
  wraps every page in `CartProvider` + `Header` + `Footer`, with the cart drawer, toast, WhatsApp
  button and 10%-off badge floating on top.
- `Header` (Chrome.tsx): fixed at the top. Transparent over the hero on the homepage, turns solid
  blush once you scroll (or on any other page). Mobile menu is a full-screen overlay.
- `CartDrawer`: slides in from the right, shows a free-shipping progress bar, quantity controls
  and subtotal. The Checkout button does nothing yet.
- `Sections.tsx`: `Hero`, `PopularTeas` (product carousel), `FeaturedProduct` (pack-size picker),
  `WhatsInside`, `UsVsThem`, `OurStandards`, `OurMission`, `Reviews`, `Journal`. Also exports
  `Stars` (rating stars) which real-results reuses.
- `Reveal`: put content inside it to get the scroll-in animation. `delay` staggers items.

## How the cart works

`src/lib/cart.tsx` holds the cart in React state (memory only). Refreshing the page empties it.

- `useCart()` gives: `items`, `count`, `subtotal`, `add(item, { openDrawer })`, `setQty(key, qty)`,
  `open`/`setOpen` (drawer), and `toast` (the "Added to cart" message, auto-hides after 2.6s).
- Each cart line has a `key`. Adding an item with an existing key increases its quantity.
  Setting quantity to 0 removes the line.
- Free-shipping threshold is `FREE_SHIPPING_THRESHOLD` in content.ts (699).
- Money formatting: `inr(649)` -> `₹649`, `rs(649)` -> `Rs. 649`.

## Editing content (src/data/content.ts)

Everything a shop owner would change is in this one file:

- `brand`: name, tagline, city, WhatsApp and Instagram links
- `announcement`: the scrolling top-bar messages
- `nav`: menu links
- `product`: the hero product (name, size, price, MRP, rating, description)
- `products`: the cards in "Popular teas". `image: null` shows a beige "coming soon" box
- `packs`: 1 / 2 / 4 pouch options and their discounts
- `inside`, `comparison`, `standards`, `mission`, `reviews`, `journal`, `footer`: homepage copy
- `realResults`: everything on /real-results. `before`, `after`, `poster`, `video`, `youtube`
  are `null` until real customer media exists
- `quiz`: quiz questions

To change an image: put the file in `src/assets/`, import it at the top of content.ts
(`import myPic from "@/assets/my-pic.jpg";`) and use the variable. File names are
case-sensitive on the server, so match the exact spelling.

## Design system

Read from `src/styles.css`. Use the tokens, never raw hex values in components.

Colors (Tailwind class names in brackets):
- Background cream `#fbf7f2` (`bg-background`)
- Blush `#f3e4e0` (`bg-blush`): header, footer, highlight sections
- Beige `#efe9e1` (`bg-beige`): image placeholders
- Ink / text `#1f1f1f` (`text-foreground`, `bg-ink`)
- Muted text `#6b635c` (`text-muted-foreground`)
- Coral primary `#e8807a`, hover `#d96e68` (`bg-primary`, `text-primary`): the ONLY accent color
- Pastels for the standards icons: `bg-pastel-peach|pink|blue|green|orange|yellow`
- Borders are very light: `rgba(0,0,0,0.06)`

Typography:
- One font: Jost (300, 400, 500) from Google Fonts. Body 17px, line-height 1.6
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
- Text links: `label-caps underline underline-offset-4`

Animation:
- Easing `--ease-soft` = `cubic-bezier(0.16, 1, 0.3, 1)`
- `Reveal` / `.reveal`: fade + 16px slide up, 700ms, staggered by 60-80ms
- `.animate-fade-up` (hero, menus), `.animate-marquee` (mobile announcement bar)
- Image hover: `scale-[1.04]` over 700ms
- `prefers-reduced-motion` turns all animation off (already handled globally)

## Rules for all future work

- No emojis anywhere (UI, copy, code comments, commits).
- No AI clichés in copy: "elevate", "seamless", "unlock", "transform your", "journey",
  "game-changer", "delve", "curated", "empower", "revolutionize" and similar.
- Never use Inter, Roboto or Arial. Jost is the only font.
- Headings: uppercase Jost with wide letter-spacing (already global for h1-h4, keep it).
- Buttons: square coral (`btn btn-primary`). No rounded pill buttons.
- Animate only `transform` and `opacity`. Never animate width, height, top, left, margin or
  colors of layout. Progress bars use `scaleX`, not width.
- Mobile first: write base classes for phones, then add `sm:` / `md:` / `lg:`.
- No medical claims. Do not say the tea treats, cures, heals or prevents anything, or promise
  results. Use "traditionally used", "supports", "customers say". Keep the existing disclaimers.
- All content goes in `src/data/content.ts`, not hardcoded in components.
- Do not edit `src/routeTree.gen.ts` by hand.

## Run and build

```sh
npm install        # install dependencies
npm run dev        # local dev server with hot reload
npm run build      # production build
npm run preview    # serve the production build locally
npm run lint       # ESLint + Prettier check
npm run format     # auto-format all files with Prettier
npm test           # run tests
```
