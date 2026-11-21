import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "@phosphor-icons/react";
import { brand, checkoutCopy } from "@/data/content";

const copy = checkoutCopy.confirmed;

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s["ref"] === "string" ? s["ref"].slice(0, 40) : "",
  }),
  head: () => ({
    meta: [
      { title: `${copy.title} | ${brand.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrderConfirmed,
});

function OrderConfirmed() {
  const { ref } = Route.useSearch();
  return (
    <main className="container-x section-y pt-32 lg:pt-40">
      <div className="mx-auto max-w-xl rounded-card bg-blush p-8 text-center sm:p-12">
        <CheckCircle aria-hidden="true" weight="light" className="mx-auto h-14 w-14 text-green" />
        <h1 className="title mt-5">{copy.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{copy.text}</p>
        {ref && (
          <p className="mt-6 text-foreground">
            {copy.reference}: <span className="font-medium tabular-nums">{ref}</span>
          </p>
        )}
        <Link to="/" className="btn btn-primary mt-8">
          {copy.cta}
        </Link>
      </div>
    </main>
  );
}
