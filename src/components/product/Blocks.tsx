import { useRef, useState, type ReactNode } from "react";
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
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
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
 * "SkinFusion vs. the rest", a dark spec-sheet panel (homepage, and the product page with
 * `cta={false}`): headline, the cup in a ringed circle with three floating fact chips, four
 * big counting numbers, then the comparison as cards: a bright raised SkinFusion card with
 * coral ticks beside two muted glass cards (phones: SkinFusion first, the others in a
 * sideways swipe). Animation: lib/animations/comparison.ts.
 */
export function ComparisonTable({ cta = true }: { cta?: boolean }) {
  const [ours, ...others] = comparison.columns;
  const scope = useRef<HTMLElement>(null);
  usePauseWhenHidden(scope);
  useComparisonReveal(scope);
  const chipPlace = [
    "left-0 top-[12%] lg:-translate-x-[8%]",
    "right-0 top-[44%] lg:translate-x-[6%]",
    "bottom-[5%] left-[8%]",
  ];
  return (
    <section ref={scope} aria-labelledby="compare-title" className="px-4 py-16 md:px-6 lg:py-24">
      <div className="relative mx-auto max-w-[84rem] overflow-hidden rounded-card bg-green px-5 py-14 text-cream sm:px-10 lg:px-16 lg:py-20">
        {/* Soft coral glow behind the cup. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[22rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl lg:top-[20rem] lg:h-[40rem] lg:w-[40rem]"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <p data-cmp-intro className="text-sm font-medium tracking-[0.06em] text-cream/70">
            {comparison.eyebrow}
          </p>
          <h2
            id="compare-title"
            data-cmp-intro
            className="mt-3 text-[clamp(2.25rem,1.4rem+3.6vw,4.25rem)] font-normal leading-[1.05] tracking-[-0.03em] text-cream"
          >
            {comparison.title}
          </h2>
          <p data-cmp-intro className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/75">
            {comparison.text}
          </p>
        </div>

        {/* The cup in its orbit, with floating fact chips. */}
        <div className="relative mx-auto mt-12 aspect-square w-[min(86vw,26rem)] lg:mt-16 lg:w-[30rem]">
          <div data-cmp-orbit className="absolute inset-0">
            <svg
              viewBox="0 0 200 200"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
            >
              <circle
                data-cmp-ring
                cx="100"
                cy="100"
                r="98"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.18"
                strokeWidth="0.6"
              />
              <circle
                data-cmp-ring
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.28"
                strokeWidth="0.6"
                strokeDasharray="1.5 3"
              />
              <circle
                data-cmp-ring
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="0.6"
              />
            </svg>
          </div>
          <div data-cmp-photo className="absolute inset-[16%] overflow-hidden rounded-full">
            <div data-cmp-depth className="absolute -inset-4">
              <Img
                media={media.comparison}
                sizes="(min-width: 1024px) 22rem, 60vw"
                className="h-full w-full"
              />
            </div>
          </div>
          {comparison.chips.map((chip, i) => (
            <span key={chip} className={`absolute ${chipPlace[i] ?? ""}`}>
              <span data-cmp-chip className="block">
                <span
                  className="cmp-float flex items-center gap-2 rounded-full bg-cream py-2 pl-2 pr-4 text-sm text-green"
                  style={{ animationDelay: `${-i * 1.6}s` }}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check size={12} weight="bold" aria-hidden="true" />
                  </span>
                  {chip}
                </span>
              </span>
            </span>
          ))}
        </div>

        {/* Big numbers. */}
        <dl className="relative mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] bg-cream/15 lg:mt-16 lg:grid-cols-4">
          {comparison.stats.map((st) => (
            <div
              key={st.label}
              data-cmp-stat
              className="flex flex-col-reverse gap-1 bg-green p-5 sm:p-7"
            >
              <dt className="text-sm leading-snug text-cream/70">{st.label}</dt>
              <dd
                data-cmp-count
                className="text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none tracking-[-0.03em] text-cream tabular-nums"
              >
                {st.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* The comparison as cards. */}
        <div className="relative mt-14 lg:mt-20">
          <div className="flex items-end justify-between gap-4">
            <h3 data-cmp-intro className="text-2xl font-normal text-cream sm:text-3xl">
              {comparison.cardsTitle}
            </h3>
            <p className="text-sm text-cream/60 lg:hidden">{comparison.swipe}</p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:items-start">
            {/* SkinFusion: bright and raised. */}
            <div
              data-cmp-ours
              className="relative rounded-[1.75rem] bg-cream p-6 text-green ring-2 ring-primary sm:p-8 lg:-mt-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Leaf size={22} weight="light" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xl">{ours}</span>
                  <span className="block text-sm text-muted-foreground">{comparison.ourTag}</span>
                </span>
              </div>
              <ul className="mt-6 flex flex-col">
                {comparison.rows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center gap-3 border-t border-green/10 py-3.5"
                  >
                    <span
                      data-cmp-tick
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Check size={14} weight="bold" aria-hidden="true" />
                    </span>
                    <span className="text-base leading-snug">
                      {row.label}
                      <span className="sr-only">: {answer(row.values[0] ?? false)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {cta && (
                <a href={comparison.cta.href} className="btn btn-primary mt-4 w-full">
                  {comparison.cta.label}
                </a>
              )}
            </div>

            {/* The others: muted glass cards (phones: a sideways swipe). */}
            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:-mx-10 sm:px-10 lg:col-span-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {others.map((name, ci) => {
                const ColIcon = OTHER_ICONS[ci] ?? Coffee;
                return (
                  <div
                    key={name}
                    data-cmp-other
                    className="w-[82%] shrink-0 snap-start rounded-[1.75rem] bg-cream/[0.06] p-6 ring-1 ring-cream/15 sm:w-[60%] sm:p-8 lg:w-auto"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream/80">
                        <ColIcon size={22} weight="light" aria-hidden="true" />
                      </span>
                      <span className="text-xl text-cream/90">{name}</span>
                    </div>
                    <ul className="mt-6 flex flex-col">
                      {comparison.rows.map((row) => {
                        const v = row.values[ci + 1] ?? false;
                        return (
                          <li key={row.label} className="border-t border-cream/10 py-3.5">
                            <span className="block text-xs text-cream/50">{row.label}</span>
                            <span className="mt-1 flex items-center gap-2 text-base text-cream/85">
                              {v === true ? (
                                <Check size={16} weight="light" aria-hidden="true" />
                              ) : v === false ? (
                                <Minus
                                  size={16}
                                  weight="light"
                                  className="text-cream/40"
                                  aria-hidden="true"
                                />
                              ) : null}
                              {answer(v)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
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
