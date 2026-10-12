import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import jostLatin from "@fontsource-variable/jost/files/jost-latin-wght-normal.woff2?url";
import { absoluteUrl, noIndex, site } from "@/lib/seo";
import { CartProvider } from "@/lib/cart/CartProvider";
import { AnimationRuntime } from "@/components/site/AnimationRuntime";
import { fetchSession } from "@/lib/customer/functions";
import { NotifyProvider } from "@/lib/notify";
import { useNotify } from "@/lib/notify-context";
import { IntroLoader } from "@/components/site/IntroLoader";
import { introCss, introScript } from "@/lib/animations/intro";
import {
  Header,
  Footer,
  CartDrawer,
  WhatsAppButton,
  Toast,
  DiscountBadge,
  Notice,
} from "@/components/site/Chrome";

function NotFoundComponent() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="label-caps text-muted-foreground">Error 404</p>
        <h1 className="mt-4 text-xl md:text-3xl">Page not found</h1>
        <p className="mt-5 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          Go home
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl md:text-3xl">This page didn't load</h1>
        <p className="mt-5 text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn btn-outline">
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: site.title },
      { name: "description", content: site.description },
      { name: "theme-color", content: site.themeColor },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: site.title },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:image", content: absoluteUrl(site.ogImage.path) },
      { property: "og:image:width", content: String(site.ogImage.width) },
      { property: "og:image:height", content: String(site.ogImage.height) },
      { property: "og:image:alt", content: site.ogImage.alt },
      { name: "twitter:title", content: site.title },
      { name: "twitter:description", content: site.description },
      { name: "twitter:image", content: absoluteUrl(site.ogImage.path) },
      { name: "twitter:card", content: "summary_large_image" },
      ...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    links: [
      // Self-hosted Jost (latin subset preloaded; other subsets load only if a page needs them)
      { rel: "preload", href: jostLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  // Signed-in state for the header (cookies only, no API call). Loaded once per page load;
  // sign-in and sign-out are full page loads, and saving account details calls
  // router.invalidate() to refresh it.
  loader: () => fetchSession(),
  staleTime: Infinity,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // The intro script may add data-intro to <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: introCss }} />
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <IntroLoader />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <NotifyProvider>
          <a
            href="#main"
            className="sr-only z-[60] bg-ink px-4 py-3 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <div className="overflow-x-clip">
            <Header />
            <div id="main" tabIndex={-1} className="outline-none">
              <Outlet />
            </div>
            <Footer />
          </div>
          <CartDrawer />
          <AnimationRuntime />
          <SignedOutNotice />
          <Notice />
          <Toast />
          <WhatsAppButton />
          <DiscountBadge />
        </NotifyProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

// After /account/logout the visitor lands on /?signed_out=1: confirm it, then tidy the URL.
function SignedOutNotice() {
  const router = useRouter();
  const signedOut = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown>)["signed_out"] !== undefined,
  });
  const { notify } = useNotify();
  useEffect(() => {
    if (!signedOut) return;
    notify("You’ve been signed out");
    void router.navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => {
        const { signed_out: _drop, ...rest } = prev;
        return rest;
      },
      replace: true,
    });
  }, [signedOut, notify, router]);
  return null;
}
