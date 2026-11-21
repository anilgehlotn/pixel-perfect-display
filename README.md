# SkinFusion

Storefront for SkinFusion, caffeine-free TCM skin-wellness teas from Mumbai. Built with
TanStack Start (React, server-side rendering) and Tailwind CSS, deployed on Vercel. Products
come from local product data and the cart is saved in the browser. Online checkout is not
connected yet.

## Tech stack

- React 19 + TanStack Start (SSR, file-based routing with TanStack Router)
- Vite 8, Nitro (server packaging for Vercel)
- Tailwind CSS 4, Jost font, Phosphor icons
- TypeScript (strict), ESLint + Prettier, Vitest

## Requirements

Node.js 20 (20.19 or newer) and npm.

## Run locally

```sh
npm install
cp .env.example .env.local   # optional
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

See `.env.example`. `VITE_` variables end up in the browser bundle, so never put a secret in
one.

| Variable        | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `VITE_SITE_URL` | Live site URL, used for absolute share-image links |

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
