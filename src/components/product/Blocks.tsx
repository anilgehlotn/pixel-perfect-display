import { Fragment, useRef, useState, type ReactNode } from "react";
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
 * "SkinFusion vs. the rest" (homepage, and the product page with `cta={false}`), "head to
 * head": inside a blush panel, a green SkinFusion card (photo, five coral ticks, the button)
 * faces a white "The rest" card, with a coral "vs" between them and the tick score below.
 * - Phones: the cards stack (SkinFusion first, "vs" on the seam); on "The rest" each point is
 *   a small heading with two answer chips (Tea bags, Supplements).
 * - Desktop: one grid, so every point lines up straight across both cards.
 * Animation: lib/animations/comparison.ts.
 */
export function ComparisonTable({ cta = true }: { cta?: boolean }) {
  const [ours] = comparison.columns;
  const scope = useRef<HTMLElement>(null);
  useComparisonReveal(scope);
  const rows = comparison.rows;
  const total = rows.length;
  const score = comparison.columns.map((_, ci) => rows.filter((r) => r.values[ci] === true).length);
  const lower = (v: string | boolean) => {
    const t = answer(v);
    return t.charAt(0).toLowerCase() + t.slice(1);
  };

  const tick = (
    <span
      data-cmp-tick
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
    >
      <Check size={14} weight="bold" aria-hidden="true" />
    </span>
  );
  const usHeader = (
    <>
      <div className="aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-green-soft">
        <div data-a-photo className="h-full w-full">
          <Img
            media={media.comparison}
            sizes="(min-width: 1024px) 34vw, 90vw"
            className="h-full w-full object-[62%_50%]"
          />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Leaf size={22} weight="light" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-2xl leading-tight">{ours}</span>
          <span className="block text-sm text-cream/70">{comparison.ourTag}</span>
        </span>
      </div>
    </>
  );
  const themHeader = (
    <div className="flex items-center gap-3">
      <span className="flex -space-x-2">
        {OTHER_ICONS.map((Ic, i) => (
          <span
            key={i}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-surface bg-beige text-muted-foreground"
          >
            <Ic size={20} weight="light" aria-hidden="true" />
          </span>
        ))}
      </span>
      <span>
        <span className="block text-2xl leading-tight text-ink">{comparison.theRest.title}</span>
        <span className="block text-sm text-muted-foreground">{comparison.theRest.sub}</span>
      </span>
    </div>
  );
  const chips = (row: (typeof rows)[number]) => (
    <span className="mt-2 flex flex-wrap gap-2">
      {comparison.shortNames.map((name, oi) => {
        const Ic = OTHER_ICONS[oi] ?? Coffee;
        return (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 rounded-full bg-beige px-3 py-1.5 text-sm leading-tight text-ink"
          >
            <Ic
              size={14}
              weight="light"
              className="shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{name}:</span>
            {lower(row.values[oi + 1] ?? false)}
          </span>
        );
      })}
    </span>
  );
  const vs = (
    <span
      data-a-vs
      aria-hidden="true"
      className="grid h-16 w-16 place-items-center rounded-full border-[5px] border-blush bg-primary text-xl font-medium text-primary-foreground"
    >
      vs
    </span>
  );
  const button = cta && (
    <a href={comparison.cta.href} className="btn btn-primary w-full">
      {comparison.cta.label}
    </a>
  );
  const light = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-card bg-gradient-to-b from-cream/[0.12] to-transparent"
    />
  );

  return (
    <section ref={scope} aria-labelledby="compare-title" className="section-y px-4 md:px-6">
      <div className="mx-auto max-w-[84rem] rounded-card bg-blush px-4 py-12 sm:px-10 sm:py-14 lg:p-16">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p data-cmp-intro className="mb-2 text-sm font-medium tracking-[0.06em] text-ink">
              {comparison.eyebrow}
            </p>
            <h2 id="compare-title" data-cmp-title className="title">
              {comparison.title}
            </h2>
          </div>
          <p data-cmp-intro className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            {comparison.text}
          </p>
        </div>

        {/* Phones and tablets: the two cards stacked, "vs" on the seam. */}
        <div data-a-layout="stack" className="mt-10 lg:hidden">
          <article
            data-a-side="us"
            className="relative overflow-hidden rounded-card bg-green p-5 text-cream sm:p-7"
          >
            {light}
            <div className="relative">
              {usHeader}
              <ul className="mt-4">
                {rows.map((r) => (
                  <li
                    key={r.label}
                    className="flex items-center gap-3 border-t border-cream/15 py-3 text-[1.02rem] leading-snug"
                  >
                    {tick}
                    {r.label}
                    <span className="sr-only">: {answer(r.values[0] ?? false)}</span>
                  </li>
                ))}
              </ul>
              {button && <div className="mt-4">{button}</div>}
            </div>
          </article>
          <div className="relative z-[1] -my-5 flex justify-center">{vs}</div>
          <article data-a-side="them" className="rounded-card bg-surface p-5 pt-8 sm:p-7 sm:pt-9">
            {themHeader}
            <ul className="mt-4">
              {rows.map((r) => (
                <li key={r.label} data-a-row className="border-t border-ink/[0.08] py-3">
                  <span className="block text-[1.02rem] leading-snug text-green">{r.label}</span>
                  {chips(r)}
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* Desktop: one grid, so each point lines up across both cards. */}
        <div
          data-a-layout="wide"
          className="relative mt-14 hidden grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] lg:grid"
        >
          {/* Card backgrounds and the "vs", behind the cells. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)]"
          >
            <span data-a-side="us" className="relative rounded-card bg-green">
              {light}
            </span>
            <span className="grid place-items-center">{vs}</span>
            <span data-a-side="them" className="rounded-card bg-surface" />
          </div>

          <div data-a-side="us" className="relative flex items-center gap-4 px-8 pb-5 pt-8 text-cream">
            {/* Desktop: a compact header (round photo + name), level with "The rest". */}
            <span className="relative shrink-0">
              <span className="block h-16 w-16 overflow-hidden rounded-full bg-green-soft">
                <span data-a-photo className="block h-full w-full">
                  <Img
                    media={media.comparison}
                    sizes="4rem"
                    className="h-full w-full object-[62%_50%]"
                  />
                </span>
              </span>
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-green bg-primary text-primary-foreground">
                <Leaf size={14} weight="light" aria-hidden="true" />
              </span>
            </span>
            <span>
              <span className="block text-2xl leading-tight">{ours}</span>
              <span className="block text-sm text-cream/70">{comparison.ourTag}</span>
            </span>
          </div>
          <span />
          <div data-a-side="them" className="relative flex items-center px-8 pb-5 pt-8">
            {themHeader}
          </div>

          {rows.map((r) => (
            <Fragment key={r.label}>
              <div data-a-side="us" className="relative px-8">
                <span className="flex h-full items-center gap-3 border-t border-cream/15 py-4 text-lg leading-snug text-cream">
                  {tick}
                  {r.label}
                  <span className="sr-only">: {answer(r.values[0] ?? false)}</span>
                </span>
              </div>
              <span />
              <div data-a-side="them" className="relative px-8">
                <span
                  data-a-row
                  className="flex h-full flex-col justify-center border-t border-ink/[0.08] py-4"
                >
                  <span className="sr-only">{r.label}: </span>
                  {chips(r)}
                </span>
              </div>
            </Fragment>
          ))}

          <div data-a-side="us" className="relative px-8 pb-8 pt-3">
            {button}
          </div>
          <span />
          <span />
        </div>

        {/* The score, and the small print. */}
        <p data-a-score className="mt-8 text-center text-sm text-muted-foreground">
          {comparison.scoreTitle}:{" "}
          <span className="font-medium text-green">
            {ours} {score[0]}
          </span>
          {comparison.shortNames.map((n, i) => (
            <span key={n}>
              {" · "}
              {n} {score[i + 1]}
            </span>
          ))}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">{comparison.note}</p>
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
