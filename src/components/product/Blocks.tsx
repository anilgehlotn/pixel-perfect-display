import { useState, type ReactNode } from "react";
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

export function ComparisonTable({ cta = true }: { cta?: boolean }) {
  const [ours, ...others] = comparison.columns;
  const [vs, setVs] = useState(0);
  // Phones: only the chosen competitor column; md and up: all of them.
  const shown = (i: number) => (i === vs ? "" : "hidden md:table-cell");
  const shownCol = (i: number) => (i === vs ? "" : "hidden md:table-column");
  return (
    <section aria-labelledby="compare-title" className="px-4 py-16 md:px-6 lg:py-24">
      <div className="mx-auto max-w-[68rem]">
        <SectionIntro
          id="compare-title"
          eyebrow={comparison.eyebrow}
          title={comparison.title}
          text={comparison.text}
        />

        {others.length > 1 && (
          <div className="mt-8 flex justify-center md:hidden">
            <div
              role="group"
              aria-label={comparison.compareWith}
              className="inline-flex rounded-full bg-blush p-1"
            >
              {others.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={vs === i}
                  onClick={() => setVs(i)}
                  className={`min-h-11 rounded-full px-4 text-sm transition-colors ${vs === i ? "bg-green text-cream" : "text-green"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div data-anim="fade" className="mt-6 min-w-0 md:mt-14">
          <table className="w-full table-fixed border-separate border-spacing-0 text-center">
            <caption className="sr-only">
              {ours} compared with {others.join(" and ")}
            </caption>
            <colgroup>
              <col className="w-[40%] md:w-[34%]" />
              <col className="w-[30%] md:w-[24%]" />
              {others.map((c, i) => (
                <col key={c} className={shownCol(i)} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <td />
                <th
                  scope="col"
                  className="rounded-t-[1.75rem] bg-green px-2 pb-5 pt-6 align-bottom font-normal text-cream md:px-4 md:pt-8"
                >
                  <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Leaf size={22} weight="light" aria-hidden="true" />
                  </span>
                  <span className="block text-base md:text-xl">{ours}</span>
                  <span className="mt-1 block text-xs text-cream/70">{comparison.ourTag}</span>
                </th>
                {others.map((c, i) => {
                  const ColIcon = OTHER_ICONS[i] ?? Coffee;
                  return (
                    <th
                      key={c}
                      scope="col"
                      className={`px-2 pb-5 align-bottom font-normal md:px-4 ${shown(i)}`}
                    >
                      <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-beige text-muted-foreground">
                        <ColIcon size={22} weight="light" aria-hidden="true" />
                      </span>
                      <span className="block text-sm leading-snug text-muted-foreground md:text-base">
                        {c}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className="border-t border-ink/10 py-5 pr-3 text-left text-[0.95rem] font-normal leading-snug text-ink md:pr-6 md:text-lg"
                  >
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={
                        i === 0
                          ? "border-t border-cream/10 bg-green px-2 py-5 text-cream"
                          : `border-t border-ink/10 px-2 py-5 text-muted-foreground ${shown(i - 1)}`
                      }
                    >
                      <Cell value={v} ours={i === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td />
                <td className="rounded-b-[1.75rem] bg-green px-2 pb-6 pt-3 md:px-4">
                  {cta && (
                    <a
                      href={comparison.cta.href}
                      className="btn btn-primary w-full whitespace-normal px-3 text-sm leading-tight md:text-base"
                    >
                      {comparison.cta.label}
                    </a>
                  )}
                </td>
                {others.map((c, i) => (
                  <td key={c} className={shown(i)} />
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

function Cell({ value, ours }: { value: string | boolean; ours: boolean }) {
  if (value === true)
    return ours ? (
      <>
        <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check size={18} weight="bold" aria-hidden="true" />
        </span>
        <span className="sr-only">Yes</span>
      </>
    ) : (
      <>
        <Check size={22} weight="light" className="mx-auto text-green" aria-hidden="true" />
        <span className="sr-only">Yes</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus size={20} weight="light" className="mx-auto text-ink/35" aria-hidden="true" />
        <span className="sr-only">No</span>
      </>
    );
  return <span className="text-xs leading-snug md:text-sm">{value}</span>;
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
