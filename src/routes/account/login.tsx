import { useEffect, useRef, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Gift, MapPin, Package } from "@phosphor-icons/react";
import { images } from "@/data/content";
import { fetchSession } from "@/lib/customer/functions";
import { safeRedirect } from "@/lib/customer/validation";
import { useScrollAnimations } from "@/lib/animations/useScrollAnimations";
import { FormAlert } from "@/components/account/ui";

const ERRORS: Record<string, string> = {
  cancelled: "Sign-in was cancelled. Start again whenever you’re ready.",
  expired: "Your sign-in took too long and expired. Please start again.",
  state: "We couldn’t confirm your sign-in. Please start again.",
  callback: "We couldn’t finish signing you in. Please try again.",
  start: "We couldn’t reach the sign-in service. Check your connection and try again.",
  unavailable: "Sign-in isn’t available right now. Please try again in a few minutes.",
};

const BENEFITS = [
  { icon: Package, text: "Track your orders" },
  { icon: MapPin, text: "Save addresses for faster checkout" },
  { icon: Gift, text: "Member-only offers" },
];

export const Route = createFileRoute("/account/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; error?: string } => ({
    ...(typeof search["redirect"] === "string" && { redirect: search["redirect"] }),
    ...(typeof search["error"] === "string" && { error: search["error"] }),
  }),
  beforeLoad: async ({ search }) => {
    const session = await fetchSession();
    if (session.signedIn) throw redirect({ href: safeRedirect(search.redirect) });
    return { mock: session.mock };
  },
  loader: ({ context }) => ({ mock: context.mock }),
  headers: () => ({ "cache-control": "private, no-store" }),
  head: () => ({
    meta: [
      { title: "Sign in | SkinFusion" },
      {
        name: "description",
        content: "Sign in or create your SkinFusion account with your email.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const { redirect: next, error } = Route.useSearch();
  const { mock } = Route.useLoaderData();
  const [leaving, setLeaving] = useState(false);
  // Coming back with the browser's back button restores this page from cache: reset the label.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setLeaving(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  const scope = useRef<HTMLElement>(null);
  useScrollAnimations(scope);
  const target = safeRedirect(next);
  const href = `/account/authorize?redirect=${encodeURIComponent(target)}`;
  const message = error ? (ERRORS[error] ?? ERRORS["callback"]) : null;

  return (
    <main ref={scope} className="pt-32 pb-16 md:pt-40 lg:pt-48 lg:pb-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="hidden overflow-hidden bg-beige lg:block">
          <img
            src={images.ritual}
            alt="Hands pouring golden tea from a glass teapot at a sunlit table"
            width={1024}
            height={1280}
            fetchPriority="high"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <h1 data-anim="fade" className="text-xl text-balance md:text-3xl">
            Welcome to <span translate="no">SkinFusion</span>
          </h1>
          <p data-anim="fade" className="mt-5 text-muted-foreground">
            Sign in or create an account with your email address. We’ll send you a one-time code, no
            password needed.
          </p>

          {message ? (
            <div className="mt-8">
              <FormAlert message={message} />
            </div>
          ) : null}

          <a
            href={href}
            onClick={() => setLeaving(true)}
            aria-busy={leaving || undefined}
            className="btn btn-primary mt-8 w-full"
          >
            {leaving ? "Opening sign-in…" : message ? "Try again" : "Continue with email"}
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            If you’re new here, we create your account the first time you sign in.
          </p>

          <ul data-anim="cards" className="mt-10 grid gap-4 border-t pt-8">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center bg-blush">
                  <Icon size={22} weight="light" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {mock ? (
            <div className="mt-10 border border-dashed p-5 text-sm">
              <p className="label-caps text-[0.65rem]">Developer preview</p>
              <p className="mt-2 text-muted-foreground">
                Shopify isn’t connected, so sign-in uses sample data. Try an order history:
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  ["No orders", "0"],
                  ["3 orders", "3"],
                  ["25 orders", "25"],
                ].map(([label, n]) => (
                  <li key={n}>
                    <a
                      href={`${href}&orders=${n}`}
                      className="inline-flex min-h-11 items-center underline underline-offset-4"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
