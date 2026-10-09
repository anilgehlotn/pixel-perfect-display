import { useEffect, useRef } from "react";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { fetchCustomer, fetchSession } from "@/lib/customer/functions";
import { AccountNav } from "@/components/account/AccountNav";
import { SkeletonBlock } from "@/components/account/ui";

// Every /account page except login and callback renders inside this layout. beforeLoad runs
// on the server for the first request and as a server-function call on client navigation,
// so signed-out visitors are always redirected before any account data loads.
export const Route = createFileRoute("/account/_dashboard")({
  beforeLoad: async ({ location }) => {
    const session = await fetchSession();
    if (!session.signedIn)
      throw redirect({ to: "/account/login", search: { redirect: location.href } });
    return { session };
  },
  loader: async ({ context }) => ({ customer: await fetchCustomer(), mock: context.session.mock }),
  headers: () => ({ "cache-control": "private, no-store" }),
  head: () => ({
    meta: [{ title: "My account | SkinFusion" }, { name: "robots", content: "noindex" }],
  }),
  pendingMs: 150,
  pendingMinMs: 300,
  pendingComponent: LayoutSkeleton,
  errorComponent: AccountError,
  component: AccountLayout,
});

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="pt-32 pb-16 md:pt-40 lg:pt-48 lg:pb-24">{children}</main>;
}

function AccountLayout() {
  const { customer, mock } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const content = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Move focus to the content after switching sections (screen reader users hear the change).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    content.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <Shell>
      <div className="container-x">
        {mock ? (
          <p className="mb-8 border border-dashed px-4 py-3 text-sm text-muted-foreground">
            Developer preview with sample data. Shopify isn't connected yet.
          </p>
        ) : null}
        <header>
          <h1 className="text-xl md:text-3xl">
            {customer.firstName ? `Hello, ${customer.firstName}` : "Hello"}
          </h1>
          <p className="mt-2 break-all text-muted-foreground">{customer.email}</p>
        </header>
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          <AccountNav />
          <div ref={content} tabIndex={-1} className="min-w-0 outline-none">
            <Outlet />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function LayoutSkeleton() {
  return (
    <Shell>
      <div className="container-x" aria-busy="true" aria-label="Loading your account">
        <SkeletonBlock className="h-9 w-56 md:h-11" />
        <SkeletonBlock className="mt-3 h-5 w-64" />
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          <div className="flex gap-4 lg:grid">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-11 w-24 lg:w-40" />
            ))}
          </div>
          <SkeletonBlock className="h-64 w-full" />
        </div>
      </div>
    </Shell>
  );
}

function AccountError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const unavailable = error instanceof Error && /not configured/i.test(error.message);
  return (
    <Shell>
      <div className="container-x max-w-xl text-center">
        <h1 className="text-xl md:text-3xl">
          {unavailable ? "Accounts are coming soon" : "We couldn't load your account"}
        </h1>
        <p className="mt-5 text-muted-foreground">
          {unavailable
            ? "Sign-in isn't switched on for this store yet. Your cart still works as usual."
            : "Something went wrong while loading your details. Check your connection and try again."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {unavailable ? null : (
            <button onClick={() => void router.invalidate()} className="btn btn-primary">
              Try again
            </button>
          )}
          <a href="/" className="btn btn-outline">
            Go home
          </a>
        </div>
      </div>
    </Shell>
  );
}
