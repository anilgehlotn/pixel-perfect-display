import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Check, Coffee, Leaf, Minus, Pill, Plus } from "@phosphor-icons/react";
import {
  comparison,
  reviews,
  standards,
  type Ingredient,
  type ProductDetails,
} from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { Stars } from "@/components/site/Stars";
import { Img } from "@/components/home/media";
import { Icon } from "./icons";
import { gsap } from "@/lib/animations/gsap";
import { useComparisonReveal } from "@/lib/animations/comparison";

/* Shared sections for the homepage and the product page. Copy comes from content.ts. */

/** Centred section title (gold serif), with an optional small line above and text below. */
export function SectionIntro({
  id,
  eyebrow,
  title,
  text,
  tone = "light",
  align = "center",
}: {
  id: string;
  eyebrow?: string | undefined;
  title: string;
  text?: string | undefined;
  tone?: "light" | "dark";
  align?: "center" | "left";
}) {
  const dark = tone === "dark";
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      {eyebrow && (
        <p
          data-anim="fade"
          className={`mb-2 text-sm font-medium tracking-[0.06em] ${dark ? "text-cream/85" : "text-ink"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2 id={id} data-anim="fade" className={`title ${dark ? "text-cream" : "text-gold"}`}>
        {title}
      </h2>
      {text && (
        <p
          data-anim="fade"
          className={`mt-4 leading-relaxed ${dark ? "text-cream/85" : "text-muted-foreground"} ${align === "center" ? "mx-auto max-w-xl" : ""}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/** "SkinFusion vs. the rest": our column in green. Phones drop the third column. */
/**
 * "SkinFusion vs. the rest". A real table (screen readers read it row by row) styled as a
 * raised green SkinFusion column with coral tick badges, beside quieter columns with icons.
 * Phones show SkinFusion against one other column at a time, picked with a pill switch;
 * from md all columns show. `cta` adds "See Skin Glow Tea" at the foot of our column
 * (off on the product page itself).
 */
const OTHER_ICONS = [Coffee, Pill];

/**
 * "SkinFusion vs. the rest" (homepage, and the product page with `cta={false}`). A light
 * section that follows the green ingredients block: title left and intro right (like the
 * section above), then the cup in a tall arch (sticky on desktop) beside a comparison board.
 * The board has a raised green SkinFusion column with coral ticks against one competitor at
 * a time, chosen with a switch whose pill slides and whose answers flip over row by row.
 * Phones: the arch on top, then each row as the point with two tiles under it.
 * Animation: lib/animations/comparison.ts (scroll) and the switch below.
 */
export function ComparisonTable({ cta = true }: { cta?: boolean }) {
  const [ours, ...others] = comparison.columns;
  const [vs, setVs] = useState(0);
  const scope = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const switching = useRef(false);
  useComparisonReveal(scope);

  // The switch pill: sized to the active button, slid there (transform only).
  useLayoutEffect(() => {
    const el = pill.current;
    const btn = btns.current[vs];
    if (!el || !btn) return;
    el.style.width = `${btn.offsetWidth}px`;
    gsap.to(el, { x: btn.offsetLeft - 4, duration: 0.55, ease: "expo.out" });
  }, [vs]);

  // The competitor's answers flip in after a switch.
  useEffect(() => {
    if (!switching.current) return;
    switching.current = false;
    const swaps = scope.current?.querySelectorAll("[data-cmp-swap]");
    if (!swaps?.length) return;
    gsap.fromTo(
      swaps,
      { yPercent: 60, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "expo.out",
        stagger: 0.05,
        clearProps: "transform,opacity",
      },
    );
  }, [vs]);

  const choose = (i: number) => {
    if (i === vs) return;
    const swaps = scope.current?.querySelectorAll("[data-cmp-swap]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!swaps?.length || reduced) {
      setVs(i);
      return;
    }
    gsap.to(swaps, {
      yPercent: -60,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      stagger: 0.03,
      onComplete: () => {
        switching.current = true;
        setVs(i);
      },
    });
  };

  const other = others[vs] ?? others[0] ?? "";
  const cols = "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]";
  return (
    <section ref={scope} aria-labelledby="compare-title" className="section-y px-4 md:px-6">
      <div className="mx-auto max-w-[84rem]">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p data-cmp-intro className="mb-2 text-sm font-medium tracking-[0.06em] text-ink">
              {comparison.eyebrow}
            </p>
            <h2 id="compare-title" data-cmp-intro className="title">
              {comparison.title}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-5">
            <p data-cmp-intro className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {comparison.text}
            </p>
            {others.length > 1 && (
              <div
                data-cmp-intro
                role="group"
                aria-label={comparison.compareWith}
                className="relative inline-flex rounded-full bg-blush p-1"
              >
                <span
                  ref={pill}
                  aria-hidden="true"
                  className="absolute bottom-1 left-1 top-1 rounded-full bg-green"
                />
                {others.map((c, i) => (
                  <button
                    key={c}
                    ref={(el) => {
                      btns.current[i] = el;
                    }}
                    type="button"
                    aria-pressed={vs === i}
                    onClick={() => choose(i)}
                    className={`relative min-h-11 rounded-full px-4 text-sm transition-colors duration-300 sm:px-5 ${vs === i ? "text-cream" : "text-green hover:text-green/70"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-10">
          {/* The cup in an arch (like the ingredient cards above); sticky on desktop. */}
          <figure
            data-cmp-arch
            className="relative mx-auto w-full max-w-[17rem] sm:max-w-xs lg:sticky lg:top-28 lg:max-w-none"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-b-[1.75rem] rounded-t-full bg-beige">
              <div data-cmp-depth className="absolute -inset-6">
                <Img
                  media={media.comparison}
                  sizes="(min-width: 1024px) 34vw, 70vw"
                  className="h-full w-full"
                />
              </div>
            </div>
            <figcaption
              data-cmp-chip
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-cream py-2 pl-2 pr-4 text-sm text-green"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                <Leaf size={14} weight="light" aria-hidden="true" />
              </span>
              {comparison.photoCaption}
            </figcaption>
          </figure>

          {/* The board. */}
          <div>
            <div data-cmp-board className="relative rounded-card bg-surface px-4 pb-4 pt-2 sm:px-6">
              {/* A thin coral line that draws down the side as the rows reveal. */}
              <span
                data-cmp-line
                aria-hidden="true"
                className="absolute bottom-10 left-0 top-10 w-[2px] origin-top rounded-full bg-primary"
              />
              {/* The raised green SkinFusion column (tablet and up). */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-4 bottom-4 top-2 hidden gap-3 sm:inset-x-6 md:grid ${cols}`}
              >
                <span />
                <span data-cmp-col className="origin-top rounded-[1.25rem] bg-green" />
                <span />
              </div>

              <div className={`relative grid grid-cols-2 items-end gap-3 pb-4 pt-5 ${cols}`}>
                <span className="hidden md:block" />
                <span
                  data-cmp-head
                  className="flex flex-col items-center text-center md:text-cream"
                >
                  <span className="mb-2 hidden h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground md:grid">
                    <Leaf size={20} weight="light" aria-hidden="true" />
                  </span>
                  <span className="text-base text-green md:text-lg md:text-cream">{ours}</span>
                  <span className="text-xs text-muted-foreground md:text-cream/70">
                    {comparison.ourTag}
                  </span>
                </span>
                <span data-cmp-head className="flex flex-col items-center text-center">
                  <span className="mb-2 hidden h-10 w-10 place-items-center rounded-full bg-beige text-muted-foreground md:grid">
                    {(() => {
                      const ColIcon = OTHER_ICONS[vs] ?? Coffee;
                      return <ColIcon size={20} weight="light" aria-hidden="true" />;
                    })()}
                  </span>
                  <span className="overflow-hidden">
                    <span
                      data-cmp-swap
                      className="block text-base text-muted-foreground md:text-lg"
                    >
                      {other}
                    </span>
                  </span>
                </span>
              </div>

              <ul className="relative" aria-label={`${ours} compared with ${other}`}>
                {comparison.rows.map((row) => {
                  const v = row.values[vs + 1] ?? false;
                  return (
                    <li
                      key={row.label}
                      data-cmp-row
                      className={`grid grid-cols-2 gap-3 border-t border-ink/[0.06] py-4 md:items-center md:py-5 ${cols}`}
                    >
                      <span
                        data-cmp-label
                        className="col-span-2 text-lg leading-snug text-green md:col-span-1"
                      >
                        {row.label}
                      </span>
                      <span className="flex items-center gap-2 rounded-[1rem] bg-green p-3 text-sm text-cream md:justify-center md:bg-transparent md:p-0">
                        <span
                          data-cmp-mark
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check size={15} weight="bold" aria-hidden="true" />
                        </span>
                        {answer(row.values[0] ?? false)}
                      </span>
                      <span className="flex items-center overflow-hidden rounded-[1rem] bg-beige p-3 text-sm text-ink md:justify-center md:bg-transparent md:p-0 md:text-muted-foreground">
                        <span data-cmp-swap className="flex items-center gap-2">
                          {v === true ? (
                            <Check
                              size={17}
                              weight="light"
                              className="shrink-0 text-green"
                              aria-hidden="true"
                            />
                          ) : v === false ? (
                            <Minus
                              size={17}
                              weight="light"
                              className="shrink-0 text-ink/40"
                              aria-hidden="true"
                            />
                          ) : null}
                          {answer(v)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              {cta && (
                <div className={`relative grid gap-3 pt-3 ${cols}`}>
                  <span className="hidden md:block" />
                  <span data-cmp-cta className="block md:px-3">
                    <a href={comparison.cta.href} className="btn btn-primary w-full">
                      {comparison.cta.label}
                    </a>
                  </span>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{comparison.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A comparison answer as words: Yes / No, or its short text. */
function answer(v: string | boolean) {
  return v === true ? comparison.yes : v === false ? comparison.no : v;
}

/** "Our promise": gold line icons in cream circles. */
export function Standards({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <section aria-labelledby="standards-title" className="bg-blush px-4 py-16 md:px-6 lg:py-20">
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id="standards-title" eyebrow={eyebrow} title={title} />
        <ul
          data-anim="cards"
          className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-x-4 gap-y-10 md:grid-cols-6 lg:mt-12"
        >
          {standards.map((s) => (
            <li key={s.label} className="flex flex-col items-center text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full border border-gold/50 bg-surface text-gold-deep md:h-24 md:w-24">
                <Icon name={s.icon} size={36} />
              </span>
              <span className="mt-3 text-sm leading-snug text-ink">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Four ingredients in arch frames with their Chinese names, plus true facts. */
export function Ingredients({
  items,
  eyebrow,
  title,
  text,
  facts,
  id = "ingredients",
}: {
  items: Ingredient[];
  eyebrow?: string | undefined;
  title: string;
  text?: string | undefined;
  facts?: { value: string; label: string }[];
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 px-4 py-16 md:px-6 lg:py-20"
    >
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id={`${id}-title`} eyebrow={eyebrow} title={title} text={text} />
        <ul
          data-anim="cards"
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:mt-12 lg:grid-cols-4 lg:gap-x-8"
        >
          {items.map((ing) => (
            <li key={ing.name} className="flex flex-col text-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-sand">
                <Img
                  media={media.ingredients[ing.image] as MediaImage}
                  sizes="(min-width: 1024px) 18rem, 45vw"
                  className="h-full w-full"
                />
              </div>
              <p lang="zh-Hans" className="mt-4 text-sm text-gold-deep">
                {ing.hanzi} <span className="italic">{ing.pinyin}</span>
              </p>
              <h3 className="mt-1 font-serif text-xl md:text-2xl">{ing.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80 md:text-base">{ing.text}</p>
            </li>
          ))}
        </ul>
        {facts && (
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-3 border-t border-ink/10 pt-10 text-center">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-sm text-muted-foreground">{f.label}</dt>
                <dd
                  data-count
                  className="order-1 text-5xl font-light tabular-nums text-green md:text-6xl"
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

/** "How to enjoy": photo and the three brewing steps (a real sequence, so it is numbered). */
export function Steps({
  steps,
  title,
  aside,
}: {
  steps: ProductDetails["steps"];
  title: string;
  aside?: ReactNode;
}) {
  return (
    <section aria-labelledby="ritual-title" className="grid lg:grid-cols-2">
      <div data-anim="media" className="overflow-hidden bg-sand">
        <Img
          media={media.ritual.image}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/5] h-full w-full lg:aspect-auto"
        />
      </div>
      <div className="flex items-center px-6 py-14 lg:px-16 lg:py-20 xl:px-24">
        <div className="max-w-md">
          <h2 id="ritual-title" data-anim="fade" className="title text-gold">
            {title}
          </h2>
          <ol data-anim="cards" className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 leading-relaxed">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green text-sm font-medium text-cream"
                >
                  {i + 1}
                </span>
                <p>
                  <span className="font-medium">{s.title}.</span>{" "}
                  <span className="text-ink/80">{s.text}</span>
                </p>
              </li>
            ))}
          </ol>
          {aside}
        </div>
      </div>
    </section>
  );
}

/** Rating summary and customer quotes under arch photos. Quotes marked isDemo are placeholders. */
export function Reviews({ rating }: { rating: { value: number; count: number } | null }) {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="scroll-mt-28 px-4 py-16 md:px-6 lg:py-20"
    >
      <div className="mx-auto max-w-[72rem]">
        <SectionIntro id="reviews-title" eyebrow={reviews.eyebrow} title={reviews.title} />
        {rating && (
          <p
            data-anim="fade"
            className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            <Stars value={rating.value} size={18} />
            <span>
              <span className="font-medium text-ink">{rating.value.toFixed(1)}</span> from{" "}
              {rating.count.toLocaleString("en-IN")} reviews
            </span>
          </p>
        )}
        <ul data-anim="cards" className="mt-10 grid gap-12 md:grid-cols-3 md:gap-10 lg:mt-12">
          {reviews.quotes.map((q, i) => (
            <li key={q.name} className="flex flex-col">
              <div className="mx-auto aspect-square w-48 overflow-hidden rounded-t-full bg-sand md:w-full md:max-w-[15rem]">
                {media.reviews[i] && (
                  <Img media={media.reviews[i]} sizes="15rem" className="h-full w-full" />
                )}
              </div>
              <div className="mx-auto w-full max-w-[15rem] md:max-w-[17rem]">
                <Stars value={5} size={15} className="mt-5 text-gold" />
                <blockquote className="mt-3 leading-relaxed text-ink/85">
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <p className="mt-4 font-serif text-lg text-green">
                  {q.name}
                  <span className="ml-2 font-sans text-sm text-muted-foreground">{q.city}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Native disclosure (works without JavaScript; the content is in the server HTML). */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-ink/10">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <Plus
          size={18}
          weight="light"
          aria-hidden="true"
          className="shrink-0 transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="pb-6 leading-relaxed text-ink/80">{children}</div>
    </details>
  );
}

export function Faq({ items, title }: { items: { q: string; a: string }[]; title: string }) {
  return (
    <section aria-labelledby="faq-title" className="bg-blush px-4 py-16 md:px-6 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionIntro id="faq-title" title={title} />
        <div data-anim="fade" className="mt-10 border-t border-ink/10">
          {items.map((f) => (
            <Disclosure key={f.q} title={f.q}>
              <p className="max-w-2xl">{f.a}</p>
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
