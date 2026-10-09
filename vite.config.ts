import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, isPreview }) => ({
  server: { port: 8080 },
  css: { transformer: "lightningcss" },
  resolve: {
    tsconfigPaths: true, // "@/..." -> src/ from tsconfig.json
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
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
      nitro({ vercel: { functions: { runtime: "nodejs24.x" } } }),
    viteReact(),
  ],
}));
