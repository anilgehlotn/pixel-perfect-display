# SkinFusion

Storefront for SkinFusion, caffeine-free TCM skin-wellness teas from Mumbai. Built with
TanStack Start (React, server-side rendering) and Tailwind CSS, deployed on Vercel. Products,
cart and checkout will come from Shopify's Storefront API; until the store is connected, the
site runs on local product data and a browser-saved cart.

## Tech stack

- React 19 + TanStack Start (SSR, file-based routing with TanStack Router)
- Vite 8, Nitro (server packaging for Vercel)
- Tailwind CSS 4, Jost font, Phosphor icons
- TypeScript (strict), ESLint + Prettier, Vitest
- Shopify Storefront API (prepared in `src/lib/shopify/`, not connected yet)

## Requirements

Node.js 20 (20.19 or newer) and npm.

## Run locally

```sh
npm install
cp .env.example .env.local   # optional until Shopify is connected
npm run dev                  # http://localhost:8080
```

## Scripts

| Command           | What it does                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                                                   |
| `npm run build`   | Production build (Node server in `.output/`, or `.vercel/output/` on Vercel) |
| `npm run preview` | Serve the production build locally                                           |
| `npm run lint`    | ESLint + Prettier check                                                      |
| `npm run format`  | Format all files                                                             |
| `npm test`        | Run tests                                                                    |

## Environment variables

See `.env.example`. All are public (`VITE_` variables end up in the browser bundle), so
only the Shopify Storefront **public** token goes here. Never add an Admin API token.

| Variable                               | Purpose                                            |
| -------------------------------------- | -------------------------------------------------- |
| `VITE_SITE_URL`                        | Live site URL, used for absolute share-image links |
| `VITE_SHOPIFY_STORE_DOMAIN`            | e.g. `your-store.myshopify.com`                    |
| `VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Storefront API public access token                 |
| `VITE_SHOPIFY_API_VERSION`             | Optional, defaults to `2026-07`                    |

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel: Add New > Project > import the repository.
3. Framework Preset: **TanStack Start** (auto-detected). Leave Build Command (`npm run build`),
   Output Directory and Install Command (`npm install`) on their defaults.
4. Add the environment variables above under Settings > Environment Variables.
5. Deploy. Every push to `main` deploys to production; other branches get preview URLs.

Server rendering runs as a Vercel Function, built by Nitro into `.vercel/output`.

## Project guide

`CLAUDE.md` documents the folder structure, content editing, the design system and the rules
for future work.
