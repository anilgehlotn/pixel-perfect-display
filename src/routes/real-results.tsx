import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import {
  Check,
  X,
  Play,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { realResults, FEATURED_PRODUCT_HANDLE } from "@/data/content";
import { getProduct } from "@/lib/shopify/products";
import { money } from "@/lib/shopify/types";
import { ProductImage } from "@/components/site/ProductImage";
import { useCart } from "@/lib/cart/context";
import { rs } from "@/lib/format";
import { Stars } from "@/components/site/Stars";
import { useScrollAnimations } from "@/lib/animations/useScrollAnimations";
import { useScrollLock } from "@/lib/scroll-lock";

export const Route = createFileRoute("/real-results")({
  loader: async () => {
    const product = await getProduct(FEATURED_PRODUCT_HANDLE);
    if (!product) throw notFound();
    return { product };
  },
  head: () => ({
    meta: [
      { title: "Real Results — SkinFusion" },
      {
        name: "description",
        content:
          "Real customer rituals, before & after stories and ingredient spotlights from SkinFusion.",
      },
      { property: "og:title", content: "Real Results — SkinFusion" },
      {
        property: "og:description",
        content:
          "Real customer rituals, before & after stories and ingredient spotlights from SkinFusion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RealResultsPage,
});

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`grid place-items-center bg-beige ${className}`}>
      <span className="label-caps px-4 text-center text-[0.65rem] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* 1. HERO */
function PageHero() {
  const h = realResults.hero;
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="bg-blush px-6 pb-20 pt-40 text-center md:pb-28 md:pt-52">
      <div>
        <p className="label-caps text-muted-foreground">{h.kicker}</p>
        <h1 data-anim="heading" className="mt-4 text-2xl md:text-4xl">
          {h.title}
        </h1>
        <p className="mx-auto mt-5 max-w-[55ch] text-muted-foreground">{h.line}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={() => go("results")} className="btn btn-primary w-full sm:w-auto">
            {h.ctaResults}
          </button>
          <button
            onClick={() => go("stories")}
            className="btn border border-foreground bg-transparent w-full sm:w-auto"
          >
            {h.ctaStories}
          </button>
        </div>
      </div>
    </section>
  );
}

/* 2. BEFORE & AFTER */
function BeforeAfter({
  before,
  after,
  name,
}: {
  before: string | null;
  after: string | null;
  name: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const stop = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={`Before and after comparison for ${name}`}
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPos((p) => Math.max(4, p - 5));
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setPos((p) => Math.min(96, p + 5));
        }
      }}
      className="relative aspect-[4/5] cursor-ew-resize touch-none select-none overflow-hidden bg-beige outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {after ? (
        <img
          src={after}
          alt={`${name} after`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Placeholder label="Customer photo coming soon" className="absolute inset-0" />
      )}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {before ? (
          <img
            src={before}
            alt={`${name} before`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Placeholder
            label="Customer photo coming soon"
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
      <span className="label-caps absolute left-3 top-3 bg-background/80 px-2 py-1 text-[0.6rem]">
        Before
      </span>
      <span className="label-caps absolute right-3 top-3 bg-background/80 px-2 py-1 text-[0.6rem]">
        After
      </span>
      <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-background" />
        <span className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background">
          <CaretLeft size={14} weight="light" />
          <CaretRight size={14} weight="light" className="-ml-2" />
        </span>
      </div>
    </div>
  );
}

function Gallery() {
  const g = realResults.gallery;
  const [filter, setFilter] = useState("All");
  const items = g.items.filter((i) => filter === "All" || i.weeks === Number(filter.split(" ")[0]));
  return (
    <section id="results" className="section-y scroll-mt-32">
      <div className="container-x">
        <div className="text-center">
          <h2 data-anim="heading" className="text-xl md:text-3xl">
            {g.title}
          </h2>
        </div>
        <div
          role="tablist"
          data-anim="fade"
          className="mt-8 flex flex-wrap justify-center gap-2"
          aria-label="Filter by duration"
        >
          {g.filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`label-caps border px-4 py-2 text-[0.68rem] transition-colors ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div data-anim="cards" className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <article key={i.name}>
              <BeforeAfter before={i.before} after={i.after} name={i.name} />
              <p className="label-caps mt-5 text-[0.7rem]">
                {i.name}, {i.age}, {i.city}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{i.duration}</p>
              <p className="mt-3 text-muted-foreground">"{i.quote}"</p>
              <p className="mt-4 inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.68rem] text-muted-foreground">
                <CheckCircle size={14} weight="light" className="text-primary" /> Verified buyer
              </p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-[60ch] text-center text-xs text-muted-foreground">
          {g.disclaimer}
        </p>
      </div>
    </section>
  );
}

/* 3. VIDEO STORIES */
type VideoItem = (typeof realResults.videos.items)[number];

function VideoCard({ v, onOpen }: { v: VideoItem; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = wrap.current;
    const vid = ref.current;
    if (!el || !vid || !v.video) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          vid.play().catch(() => {});
        } else vid.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [v.video]);
  return (
    <button
      ref={wrap}
      onClick={onOpen}
      className="group relative aspect-[9/16] w-[74vw] shrink-0 snap-start overflow-hidden bg-beige text-left sm:w-[calc(25%-18px)]"
      aria-label={`Play story from ${v.name}`}
    >
      {v.video ? (
        <video
          ref={ref}
          src={v.video}
          poster={v.poster ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : v.poster ? (
        <img
          src={v.poster}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Placeholder label="Customer video coming soon" className="absolute inset-0" />
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-background/85 transition-transform group-hover:scale-105">
          <Play size={22} weight="fill" className="ml-0.5" />
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-4 text-background">
        <span className="label-caps block text-[0.65rem]">
          {v.name} · {v.city}
        </span>
        <span className="mt-1 block text-sm">{v.caption}</span>
      </span>
    </button>
  );
}

function VideoModal({ v, onClose }: { v: VideoItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  useScrollLock(true);
  const youtubeEmbed = v.youtube?.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/,
  )?.[1];
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Story from ${v.name}`}
    >
      <div className="absolute inset-0 bg-ink/70" onClick={onClose} />
      <div className="relative aspect-[9/16] max-h-[85vh] w-full max-w-sm bg-ink">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-background"
        >
          <X size={20} weight="light" />
        </button>
        {v.video ? (
          <video
            src={v.video}
            poster={v.poster ?? undefined}
            controls
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : youtubeEmbed ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeEmbed}?autoplay=1`}
            title={`Story from ${v.name}`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <Placeholder label="Customer video coming soon" className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

function VideoStories() {
  const t = realResults.videos;
  const [active, setActive] = useState<VideoItem | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section id="stories" className="section-y scroll-mt-32 border-t">
      <div className="container-x">
        <div className="text-center">
          <h2 data-anim="heading" className="text-xl md:text-3xl">
            {t.title}
          </h2>
        </div>
        <div className="relative mt-12">
          <div
            ref={track}
            data-anim="cards"
            className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 sm:mx-0 sm:px-0"
          >
            {t.items.map((v) => (
              <VideoCard key={v.name + v.caption} v={v} onOpen={() => setActive(v)} />
            ))}
          </div>
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous stories"
            className="absolute -left-2 top-[38%] hidden h-12 w-12 place-items-center rounded-full border bg-background md:grid lg:-left-6 group"
          >
            <ArrowLeft size={20} weight="light" className="arrow-nudge-back" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next stories"
            className="absolute -right-2 top-[38%] hidden h-12 w-12 place-items-center rounded-full border bg-background md:grid lg:-right-6 group"
          >
            <ArrowRight size={20} weight="light" className="arrow-nudge" />
          </button>
        </div>
      </div>
      {active && <VideoModal v={active} onClose={() => setActive(null)} />}
    </section>
  );
}

/* 4. SERUM VS REAL INGREDIENTS */
function SerumVs() {
  const s = realResults.serum;
  const cell = (v: string | boolean) =>
    v === true ? (
      <Check size={20} weight="light" className="mx-auto text-primary" aria-label="Yes" />
    ) : v === false ? (
      <X size={18} weight="light" className="mx-auto text-muted-foreground" aria-label="No" />
    ) : (
      <span className="text-sm">{v}</span>
    );
  return (
    <section className="section-y border-t">
      <div className="container-x max-w-5xl">
        <div className="text-center">
          <p data-anim="fade" className="label-caps text-muted-foreground">
            {s.kicker}
          </p>
          <h2 data-anim="heading" className="mt-3 text-xl md:text-3xl">
            {s.title}
          </h2>
        </div>
        <div data-anim="cards" className="mt-12 grid gap-6 md:grid-cols-2">
          {[s.left, s.right].map((c, k) => (
            <div key={c.title} className={`border p-8 ${k ? "border-primary" : ""}`}>
              <h3 className="label-caps text-[0.75rem]">{c.title}</h3>
              <ul className="mt-6 space-y-3">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-3 text-muted-foreground">
                    <Check
                      size={18}
                      weight="light"
                      className={`mt-0.5 shrink-0 ${k ? "text-primary" : "text-muted-foreground"}`}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div data-anim="fade" className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b">
                <th className="py-4" />
                {s.table.columns.map((c, k) => (
                  <th
                    key={c}
                    className={`label-caps py-4 text-center text-[0.65rem] ${k ? "" : "text-muted-foreground"}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r) => (
                <tr key={r.label} className="border-b">
                  <th scope="row" className="py-4 pr-4 text-left text-sm font-normal">
                    {r.label}
                  </th>
                  {r.values.map((v, k) => (
                    <td key={k} className="py-4 text-center">
                      {cell(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-10 max-w-[55ch] text-center text-muted-foreground">{s.closing}</p>
      </div>
    </section>
  );
}

/* 5. INGREDIENT SPOTLIGHT */
function Spotlight() {
  const s = realResults.spotlight;
  return (
    <section className="section-y border-t">
      <div className="container-x">
        <div className="text-center">
          <h2 data-anim="heading" className="text-xl md:text-3xl">
            {s.title}
          </h2>
        </div>
        <div data-anim="cards" className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {s.items.map((i) => (
            <div key={i.name} className="text-center">
              <div className="overflow-hidden bg-beige">
                <img
                  src={i.image}
                  alt={i.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </div>
              <h3 className="label-caps mt-5 text-[0.72rem]">{i.name}</h3>
              <p className="mx-auto mt-2 max-w-[24ch] text-sm text-muted-foreground">{i.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 6. SHARE YOUR GLOW */
function ShareGlow() {
  const s = realResults.share;
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [consent, setConsent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };
  useScrollLock(open);
  return (
    <section className="section-y bg-blush">
      <div className="container-x max-w-2xl text-center">
        <h2 data-anim="heading" className="text-xl md:text-3xl">
          {s.title}
        </h2>
        <p className="mx-auto mt-5 max-w-[50ch] text-muted-foreground">{s.text}</p>
        <button
          onClick={() => {
            setOpen(true);
            setDone(false);
          }}
          className="btn btn-primary mt-8"
        >
          {s.cta}
        </button>
      </div>
      {open && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-title"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-background p-8 md:p-10">
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center"
            >
              <X size={22} weight="light" />
            </button>
            {done ? (
              <p role="status" className="py-10 text-center">
                {s.success}
              </p>
            ) : (
              <form onSubmit={submit} className="grid gap-4">
                <h3 id="share-title" className="text-xl">
                  {s.title}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Name"
                    aria-label="Name"
                    className="min-h-12 border border-input bg-background px-4 outline-none focus:border-foreground"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    aria-label="Email"
                    className="min-h-12 border border-input bg-background px-4 outline-none focus:border-foreground"
                  />
                  <input
                    required
                    placeholder="City"
                    aria-label="City"
                    className="min-h-12 border border-input bg-background px-4 outline-none focus:border-foreground"
                  />
                  <input
                    placeholder="How long have you used it?"
                    aria-label="How long have you used it"
                    className="min-h-12 border border-input bg-background px-4 outline-none focus:border-foreground"
                  />
                </div>
                <textarea
                  required
                  placeholder="Your story"
                  aria-label="Your story"
                  rows={4}
                  className="border border-input bg-background px-4 py-3 outline-none focus:border-foreground"
                />
                <div>
                  <label
                    htmlFor="share-photo"
                    className="label-caps text-[0.68rem] text-muted-foreground"
                  >
                    Photo (optional)
                  </label>
                  <input
                    id="share-photo"
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-sm"
                  />
                </div>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  I agree SkinFusion may share my photos and story
                </label>
                <button className="btn btn-primary">{s.cta}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* 7. FINAL CTA */
function FinalCta() {
  const { add } = useCart();
  const { product } = Route.useLoaderData();
  const variant = product.variants[0];
  return (
    <section className="section-y">
      <div className="container-x max-w-4xl">
        <div className="text-center">
          <h2 data-anim="heading" className="text-xl md:text-3xl">
            {realResults.finalCta.title}
          </h2>
        </div>
        <div
          data-anim="fade"
          className="mx-auto mt-12 grid max-w-2xl items-center gap-8 border p-6 sm:grid-cols-[200px_1fr] sm:p-8"
        >
          {product.featuredImage && (
            <ProductImage image={product.featuredImage} className="aspect-[4/5] w-full bg-beige" />
          )}
          <div className="text-center sm:text-left">
            <h3 className="text-lg">{product.title}</h3>
            {product.rating && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
                <Stars value={product.rating.value} />{" "}
                <span data-count>{product.rating.value}</span> ·{" "}
                <span data-count>{product.rating.count}</span> reviews
              </div>
            )}
            {variant && (
              <p className="mt-4 text-xl">
                {rs(money(variant.price))}{" "}
                {variant.compareAtPrice && (
                  <span className="ml-2 text-base text-muted-foreground line-through">
                    {rs(money(variant.compareAtPrice))}
                  </span>
                )}
              </p>
            )}
            <button
              onClick={() => variant && add(product, variant, 1, { openDrawer: true })}
              disabled={!variant?.availableForSale}
              className="btn btn-primary mt-6 w-full sm:w-auto"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function RealResultsPage() {
  const scope = useRef<HTMLElement>(null);
  useScrollAnimations(scope);
  return (
    <main ref={scope}>
      <PageHero />
      <Gallery />
      <VideoStories />
      <SerumVs />
      <Spotlight />
      <ShareGlow />
      <FinalCta />
      <p className="container-x max-w-3xl pb-16 text-center text-xs text-muted-foreground">
        {realResults.disclaimer}
      </p>
    </main>
  );
}
