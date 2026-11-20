import type { ReactNode } from "react";
import { Check, Minus, Plus, Quotes } from "@phosphor-icons/react";
import {
  comparison,
  home,
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

/** Centred eyebrow + uppercase title (+ optional line). */
export function SectionIntro({
  id,
  eyebrow,
  title,
  text,
  tone = "light",
  align = "center",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  text?: string | undefined;
  tone?: "light" | "dark";
  align?: "center" | "left";
}) {
  const dark = tone === "dark";
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      {eyebrow && (
        <p data-anim="fade" className={`label-caps ${dark ? "text-cream/80" : "text-jujube"}`}>
          {eyebrow}
        </p>
      )}
      <h2 id={id} data-anim="fade" className={`title mt-4 ${dark ? "text-cream" : ""}`}>
        {title}
      </h2>
      {text && (
        <p
          data-anim="fade"
          className={`mt-5 text-[1.0625rem] leading-relaxed ${dark ? "text-cream/85" : "text-muted-foreground"} ${align === "center" ? "mx-auto max-w-xl" : ""}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/** "Not your usual cup": SkinFusion column highlighted. Phones drop the third column. */
export function ComparisonTable() {
  const [ours, ...others] = comparison.columns;
  return (
    <section aria-labelledby="compare-title" className="bg-blush section-y px-4 md:px-6">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16">
        <div className="max-w-md">
          <p data-anim="fade" className="label-caps text-jujube">
            {comparison.eyebrow}
          </p>
          <h2 id="compare-title" data-anim="lines" className="headline mt-4">
            {comparison.title}
          </h2>
          <p
            data-anim="fade"
            className="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            {comparison.text}
          </p>
        </div>
        <div data-anim="fade" className="overflow-hidden">
          <table className="w-full table-fixed border-collapse text-center text-sm md:text-[0.95rem]">
            <caption className="sr-only">
              {ours} compared with {others.join(" and ")}
            </caption>
            <colgroup>
              <col className="w-[38%] sm:w-[34%]" />
              <col />
              <col />
              <col className="hidden sm:table-column" />
            </colgroup>
            <thead>
              <tr>
                <td />
                <th
                  scope="col"
                  className="bg-jujube px-2 py-5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-cream md:text-xs"
                >
                  {ours}
                </th>
                {others.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`px-2 py-5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground md:text-xs ${i === 1 ? "hidden sm:table-cell" : ""}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.label} className="border-t border-ink/10">
                  <th
                    scope="row"
                    className="py-4 pr-3 text-left font-serif text-[1.05rem] font-medium leading-snug md:text-xl"
                  >
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-2 py-4 ${i === 0 ? "bg-surface" : "text-muted-foreground"} ${i === 2 ? "hidden sm:table-cell" : ""}`}
                    >
                      <Cell value={v} strong={i === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Cell({ value, strong }: { value: string | boolean; strong: boolean }) {
  if (value === true)
    return (
      <>
        <Check
          size={22}
          weight={strong ? "regular" : "light"}
          className={`mx-auto ${strong ? "text-jujube" : ""}`}
          aria-hidden="true"
        />
        <span className="sr-only">Yes</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus size={20} weight="light" className="mx-auto" aria-hidden="true" />
        <span className="sr-only">No</span>
      </>
    );
  return <span className="text-xs leading-snug md:text-sm">{value}</span>;
}

/** Row of soft circles with line icons. */
export function Standards({ title = home.standards.title }: { title?: string }) {
  return (
    <section aria-labelledby="standards-title" className="section-y px-4 md:px-6">
      <div className="mx-auto max-w-[80rem]">
        <h2 id="standards-title" data-anim="fade" className="title text-center">
          {title}
        </h2>
        <ul
          data-anim="cards"
          className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-x-4 gap-y-10 md:grid-cols-6"
        >
          {standards.map((s) => (
            <li key={s.label} className="flex flex-col items-center text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-blush text-jujube md:h-24 md:w-24">
                <Icon name={s.icon} size={34} />
              </span>
              <span className="mt-4 text-sm leading-snug">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Deep jujube block: four ingredient circles with their Chinese names, plus true facts. */
export function Ingredients({
  items,
  eyebrow,
  title,
  text,
  facts,
  id = "ingredients",
}: {
  items: Ingredient[];
  eyebrow: string;
  title: string;
  text?: string | undefined;
  facts?: { value: string; label: string }[];
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 bg-jujube section-y px-4 text-cream md:px-6"
    >
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id={`${id}-title`} eyebrow={eyebrow} title={title} text={text} tone="dark" />
        <ul
          data-anim="cards"
          className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {items.map((ing) => (
            <li key={ing.name} className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="aspect-square w-40 overflow-hidden rounded-full ring-1 ring-gold/60 ring-offset-[6px] ring-offset-jujube md:w-48">
                  <Img
                    media={media.ingredients[ing.image] as MediaImage}
                    sizes="12rem"
                    className="h-full w-full"
                  />
                </div>
              </div>
              <p lang="zh-Hans" className="mt-7 font-serif text-3xl text-gold">
                {ing.hanzi}
              </p>
              <h3 className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-cream">
                {ing.name}
              </h3>
              <p className="mt-1 font-serif text-lg italic text-cream/80">{ing.pinyin}</p>
              <p className="mt-4 max-w-xs leading-relaxed text-cream/85">{ing.text}</p>
            </li>
          ))}
        </ul>
        {facts && (
          <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 border-t border-cream/20 pt-10 text-center lg:mt-20">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-2 text-xs uppercase tracking-[0.18em] text-cream/80 md:text-sm">
                  {f.label}
                </dt>
                <dd data-count className="order-1 font-serif text-5xl tabular-nums md:text-7xl">
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

/** "How to enjoy": photo + three numbered steps (+ tasting notes on the product page). */
export function Steps({
  steps,
  eyebrow,
  title,
  aside,
}: {
  steps: ProductDetails["steps"];
  eyebrow: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <section aria-labelledby="ritual-title" className="section-y px-4 md:px-6">
      <div className="mx-auto grid max-w-[80rem] items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div data-anim="media" className="overflow-hidden bg-beige">
          <Img
            media={media.ritual.image}
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="aspect-[4/5] w-full"
          />
        </div>
        <div>
          <SectionIntro id="ritual-title" eyebrow={eyebrow} title={title} align="left" />
          <ol data-anim="cards" className="mt-10 space-y-8">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t pt-6">
                <span aria-hidden="true" className="font-serif text-4xl leading-none text-jujube">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.18em]">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {aside}
        </div>
      </div>
    </section>
  );
}

/** Rating summary and customer quotes. Quotes marked isDemo are placeholders. */
export function Reviews({ rating }: { rating: { value: number; count: number } | null }) {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="scroll-mt-24 section-y px-4 md:px-6"
    >
      <div className="mx-auto max-w-[80rem]">
        <div className="flex flex-col items-center text-center">
          <p data-anim="fade" className="label-caps text-jujube">
            {reviews.eyebrow}
          </p>
          <h2 id="reviews-title" data-anim="fade" className="title mt-4">
            {reviews.title}
          </h2>
          {rating && (
            <div data-anim="fade" className="mt-7 flex flex-col items-center gap-2">
              <p className="flex items-center gap-3">
                <span className="font-serif text-5xl leading-none">{rating.value.toFixed(1)}</span>
                <Stars value={rating.value} size={20} />
              </p>
              <p className="text-sm text-muted-foreground">
                Based on {rating.count.toLocaleString("en-IN")} reviews
              </p>
            </div>
          )}
        </div>
        <ul data-anim="cards" className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6 lg:mt-16">
          {reviews.quotes.map((q, i) => (
            <li key={q.name} className="flex flex-col bg-surface p-7 ring-1 ring-ink/[0.06] md:p-9">
              <div className="flex items-center justify-between">
                <Stars value={5} size={14} />
                <Quotes size={28} weight="light" className="text-rose" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-sm font-medium uppercase tracking-[0.16em]">{q.title}</h3>
              <blockquote className="mt-3 flex-1 font-serif text-xl leading-snug">
                {q.text}
              </blockquote>
              <div className="mt-8 flex items-center gap-3 border-t pt-5">
                <div className="h-11 w-11 overflow-hidden rounded-full bg-beige">
                  {media.reviews[i] && (
                    <Img media={media.reviews[i]} sizes="3rem" className="h-full w-full" />
                  )}
                </div>
                <p className="text-sm">
                  {q.name}
                  <span className="text-muted-foreground"> · {q.city}</span>
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
  size = "md",
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <details open={defaultOpen} className="group border-b">
      <summary
        className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden ${size === "lg" ? "font-serif text-xl md:text-2xl" : "text-[0.8125rem] font-medium uppercase tracking-[0.18em]"}`}
      >
        {title}
        <Plus
          size={18}
          weight="light"
          aria-hidden="true"
          className="shrink-0 transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="pb-6 leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

export function Faq({
  items,
  eyebrow,
  title,
}: {
  items: { q: string; a: string }[];
  eyebrow: string;
  title: string;
}) {
  return (
    <section aria-labelledby="faq-title" className="bg-blush section-y px-4 md:px-6">
      <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <SectionIntro id="faq-title" eyebrow={eyebrow} title={title} align="left" />
        <div data-anim="fade" className="border-t">
          {items.map((f) => (
            <Disclosure key={f.q} title={f.q} size="lg">
              <p className="max-w-2xl">{f.a}</p>
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
