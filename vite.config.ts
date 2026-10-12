import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

// Vercel sets VERCEL_ENV to "production", "preview" or "development" during its builds.
// Preview deployments (client demos, branch links) must not be indexed by search engines.
const isVercelPreview = process.env["VERCEL_ENV"] === "preview";

export default defineConfig(({ command, isPreview }) => ({
  server: { port: 8080 },
  define: { __NOINDEX__: JSON.stringify(isVercelPreview) },
  css: { transformer: "lightningcss" },
  resolve: {
    tsconfigPaths: true, // "@/..." -> src/ from tsconfig.json
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
  environments: {
    client: {
      build: {
        rolldownOptions: {
          output: {
            // Animation libraries (GSAP, SplitText, Lenis) in their own file, downloaded in
            // parallel with the app instead of growing the main bundle.
            codeSplitting: {
              groups: [{ name: "animations", test: /node_modules[\\/](gsap|@gsap|lenis)[\\/]/ }],
            },
          },
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // Use src/server.ts (our SSR error wrapper) as the server entry.
      server: { entry: "server" },
      // Fail the build if browser code imports server-only modules.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Nitro packages the SSR server for the host. It detects Vercel during a Vercel build
    // (output in .vercel/output) and builds a plain Node server everywhere else
    // (output in .output, run with `npm run preview`). The Vercel Function runtime is pinned
    // to match "engines" in package.json; otherwise Nitro copies the build machine's Node.
    (command === "build" || isPreview) &&
      nitro({
        vercel: { functions: { runtime: "nodejs24.x" } },
        // Account pages hold personal data: never cache them at the edge or in the browser.
        routeRules: {
          "/account/**": { headers: { "cache-control": "private, no-store" } },
          ...(isVercelPreview
            ? { "/**": { headers: { "x-robots-tag": "noindex, nofollow" } } }
            : {}),
        },
      }),
    viteReact(),
  ],
}));
