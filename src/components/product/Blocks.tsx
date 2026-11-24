import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/animations/gsap";
import { usePauseWhenHidden } from "@/lib/animations/usePauseWhenHidden";
import { Check, CircleHalf, Coffee, Leaf, Minus, Pill, Plus } from "@phosphor-icons/react";
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
 * "SkinFusion vs. the rest" (homepage, and the product page with `cta={false}`). A light
 * section that follows the green ingredients block: title left and intro right (like the
 * section above), then the cup in a tall arch (sticky on desktop) beside a comparison board
 * that shows SkinFusion and BOTH competitors at once: a raised green SkinFusion column with
 * coral ticks, then Regular tea bags and Beauty supplements. Phones: each point with three
 * tiles under it. Below the rows, "Ticks out of five" as three bars that fill as they count.
 * Animation: lib/animations/comparison.ts.
 */
export function ComparisonTable({ cta = true }: { cta?: boolean }) {
  const [ours, ...others] = comparison.columns;
  const scope = useRef<HTMLElement>(null);
  usePauseWhenHidden(scope);
  useComparisonReveal(scope);
  // One point open at a time; its detail panel fades in under the row.
  const [openRow, setOpenRow] = useState<number | null>(null);
  const toggle = (i: number) => setOpenRow((cur) => (cur === i ? null : i));
  useEffect(() => {
    if (openRow === null) return;
    const panel = scope.current?.querySelector(`#cmp-detail-${openRow} [data-cmp-detail]`);
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      panel,
      { y: -8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", clearProps: "transform,opacity" },
    );
  }, [openRow]);
  const total = comparison.rows.length;
  const score = comparison.columns.map(
    (_, ci) => comparison.rows.filter((r) => r.values[ci] === true).length,
  );
  // Phones: three tile columns (SkinFusion a little wider). md+: a label column first.
  // Phones: the point, then three slim columns. md+: wider columns with words.
  const cols =
    "grid-cols-[minmax(0,1fr)_2.5rem_2.5rem_2.5rem] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]";
  return (
    <section ref={scope} aria-labelledby="compare-title" className="section-y px-4 md:px-6">
      <div className="relative mx-auto max-w-[84rem] overflow-hidden rounded-card bg-blush px-4 py-12 sm:px-10 sm:py-14 lg:p-16">
        <div className="relative grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
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

        <div className="mt-10 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-start lg:gap-10">
          {/* The cup in an arch (like the ingredient cards above); sticky on desktop. */}
          <figure
            data-cmp-arch
            className="relative mx-auto w-full max-w-[15rem] sm:max-w-xs lg:sticky lg:top-28 lg:max-w-none"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-b-[1.75rem] rounded-t-[50%_40%] bg-beige">
              <div data-cmp-depth className="absolute -inset-6">
                <Img
                  media={media.comparison}
                  sizes="(min-width: 1024px) 30vw, 60vw"
                  className="h-full w-full"
                />
              </div>
            </div>
            {/* Inset photo of whole jujubes, overlapping the arch's corner. */}
            <div className="absolute -right-3 bottom-20 w-[40%] sm:-right-6">
              <div
                data-cmp-inset
                className="aspect-square overflow-hidden rounded-full border-4 border-blush"
              >
                <Img
                  media={media.ingredients.jujube}
                  sizes="(min-width: 1024px) 12vw, 30vw"
                  className="h-full w-full"
                />
              </div>
            </div>
            {/* A slowly turning circular text badge (desktop with a mouse turns it; CSS). */}
            <div
              data-cmp-ring-badge
              aria-hidden="true"
              className="absolute -left-4 top-6 w-[34%] sm:-left-8"
            >
              <svg viewBox="0 0 120 120" className="cmp-spin block h-auto w-full text-green">
                <defs>
                  <path id="cmp-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <circle cx="60" cy="60" r="58" className="fill-cream" />
                <text className="fill-current text-[10.5px] tracking-[0.18em]">
                  <textPath href="#cmp-circle">{comparison.badge}</textPath>
                </text>
                <g transform="translate(48 48)" className="text-primary">
                  <path
                    d="M12 2C6 6 4 11 6 16c1.5 3.5 5 5 8 4 4-1.5 6-6 5-11-1-4-4-6-7-7Z"
                    className="fill-current"
                  />
                </g>
              </svg>
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

          {/* The board: SkinFusion against both at once; each point opens a detail. */}
          <div>
            <div data-cmp-board className="relative rounded-card bg-surface px-3 pb-4 pt-2 sm:px-6">
              {/* Phones: the tap hint and which symbol means what (above the columns). */}
              <p className="relative pt-3 text-sm text-green md:hidden">{comparison.tapHint}</p>
              {/* Phones: which icon is which, and what the symbols mean. */}
              <div className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[0.9rem] bg-beige/60 px-3 py-2 text-xs text-muted-foreground md:hidden">
                {comparison.columns.map((name, ci) => {
                  const KeyIcon = ci === 0 ? Leaf : (OTHER_ICONS[ci - 1] ?? Coffee);
                  return (
                    <span key={name} className="inline-flex items-center gap-1">
                      <KeyIcon size={13} weight="light" aria-hidden="true" />
                      {name}
                    </span>
                  );
                })}
                <span className="inline-flex items-center gap-1">
                  <Check size={13} weight="light" aria-hidden="true" />
                  {comparison.legend.yes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CircleHalf size={13} weight="light" aria-hidden="true" />
                  {comparison.legend.partly}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Minus size={13} weight="light" aria-hidden="true" />
                  {comparison.legend.no}
                </span>
              </div>

              <div className="relative">
                {/* A soft coral glow that travels down the board with the row in focus. */}
                <span
                  data-cmp-glow
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-0 h-52 w-[70%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
                />
                {/* A thin coral line that draws down the side as the rows reveal. */}
                <span
                  data-cmp-line
                  aria-hidden="true"
                  className="absolute -left-3 bottom-6 top-10 w-[2px] origin-top rounded-full bg-primary sm:-left-6"
                />
                {/* The raised green SkinFusion column. */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 -bottom-2 top-0 grid gap-2 md:gap-3 ${cols}`}
                >
                  <span />
                  <span
                    data-cmp-col
                    className="relative origin-top overflow-hidden rounded-full bg-green md:rounded-[1.25rem]"
                  >
                    <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cream/[0.14] to-transparent" />
                  </span>
                  <span />
                  <span />
                </div>

                {/* Column heads. */}
                <div
                  aria-hidden="true"
                  className={`relative grid items-end gap-2 pb-3 pt-5 md:gap-3 md:pb-4 ${cols}`}
                >
                  <span />
                  {comparison.columns.map((name, ci) => {
                    const HeadIcon = ci === 0 ? Leaf : (OTHER_ICONS[ci - 1] ?? Coffee);
                    return (
                      <span
                        key={name}
                        data-cmp-head
                        className="flex flex-col items-center text-center"
                      >
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full md:mb-2 md:h-10 md:w-10 ${ci === 0 ? "bg-primary text-primary-foreground" : "bg-beige text-muted-foreground"}`}
                        >
                          <HeadIcon size={16} weight="light" aria-hidden="true" />
                        </span>
                        <span
                          className={`hidden text-base md:block ${ci === 0 ? "text-cream" : "text-muted-foreground"}`}
                        >
                          {name}
                        </span>
                      </span>
                    );
                  })}
                </div>

                <ul
                  className="relative"
                  aria-label={`${ours} compared with ${others.join(" and ")}`}
                >
                  {comparison.rows.map((row, ri) => {
                    const open = openRow === ri;
                    const panelId = `cmp-detail-${ri}`;
                    return (
                      <li key={row.label} data-cmp-row className="border-t border-ink/[0.06]">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => toggle(ri)}
                          className={`group grid min-h-14 w-full items-center gap-2 py-3 text-left md:gap-3 md:py-5 ${cols}`}
                        >
                          <span
                            data-cmp-label
                            className="flex items-center gap-2 pr-1 text-[0.98rem] leading-snug text-green md:text-lg"
                          >
                            <Plus
                              size={14}
                              weight="light"
                              aria-hidden="true"
                              className={`shrink-0 text-primary transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                            />
                            {row.label}
                          </span>
                          {row.values.map((v, ci) => (
                            <span
                              key={ci}
                              data-cmp-tile={ci === 0 ? "ours" : "other"}
                              className="flex items-center justify-center gap-2 text-sm"
                            >
                              <span className="sr-only">
                                {comparison.columns[ci]}: {answer(v)}
                              </span>
                              {ci === 0 ? (
                                <>
                                  <span
                                    data-cmp-mark
                                    aria-hidden="true"
                                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground md:h-8 md:w-8"
                                  >
                                    <Check size={14} weight="bold" />
                                  </span>
                                  <span aria-hidden="true" className="hidden text-cream md:inline">
                                    {answer(v)}
                                  </span>
                                </>
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="flex items-center gap-1.5 text-muted-foreground"
                                >
                                  {v === true ? (
                                    <Check
                                      size={17}
                                      weight="light"
                                      className="shrink-0 text-green"
                                    />
                                  ) : v === false ? (
                                    <Minus
                                      size={17}
                                      weight="light"
                                      className="shrink-0 text-ink/40"
                                    />
                                  ) : (
                                    <CircleHalf
                                      size={17}
                                      weight="light"
                                      className="shrink-0 text-ink/55 md:hidden"
                                    />
                                  )}
                                  <span className="hidden md:inline">{answer(v)}</span>
                                </span>
                              )}
                            </span>
                          ))}
                        </button>
                        <div id={panelId} hidden={!open} className="relative pb-4">
                          <div
                            data-cmp-detail
                            className="rounded-[1.1rem] bg-blush px-4 py-3.5 text-sm leading-relaxed text-ink"
                          >
                            <p>{row.detail}</p>
                            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground md:hidden">
                              {others.map((name, oi) => (
                                <li key={name}>
                                  {name}: {answer(row.values[oi + 1] ?? false)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {cta && (
                  <div className={`relative hidden gap-3 pt-3 md:grid ${cols}`}>
                    <span />
                    <span data-cmp-cta className="block px-2">
                      <a href={comparison.cta.href} className="btn btn-primary w-full px-3 text-sm">
                        {comparison.cta.label}
                      </a>
                    </span>
                  </div>
                )}
              </div>

              {cta && (
                <div data-cmp-cta className="relative mt-5 md:hidden">
                  <a href={comparison.cta.href} className="btn btn-primary w-full">
                    {comparison.cta.label}
                  </a>
                </div>
              )}

              {/* Ticks out of five. */}
              <div data-cmp-score className="relative mt-5 border-t border-ink/[0.06] pt-5">
                <p className="text-sm text-muted-foreground">{comparison.scoreTitle}</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {comparison.columns.map((name, ci) => {
                    const n = score[ci] ?? 0;
                    return (
                      <li
                        key={name}
                        className="grid grid-cols-[7.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 sm:grid-cols-[10rem_minmax(0,1fr)_3rem]"
                      >
                        <span
                          className={`text-sm leading-tight ${ci === 0 ? "text-green" : "text-muted-foreground"}`}
                        >
                          {name}
                        </span>
                        <span className="h-2 overflow-hidden rounded-full bg-beige">
                          <span
                            data-cmp-bar
                            className={`block h-full origin-left rounded-full ${ci === 0 ? "bg-primary" : "bg-ink/25"}`}
                            style={{ width: `${(n / total) * 100}%` }}
                          />
                        </span>
                        <span
                          className={`text-right text-sm tabular-nums ${ci === 0 ? "text-green" : "text-muted-foreground"}`}
                        >
                          <span data-cmp-count>{`${n}/${total}`}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
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
