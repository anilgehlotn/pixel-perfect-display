import type { ReactNode } from "react";
import { Check, Minus, Plus } from "@phosphor-icons/react";
import {
  comparison,
  packaging,
  reviews,
  standards,
  FEATURED_PRODUCT_HANDLE,
  type Ingredient,
  type ProductDetails,
} from "@/data/content";
import { media, type MediaImage } from "@/data/media";
import { Stars } from "@/components/site/Stars";
import { Img } from "@/components/home/media";
import { Icon } from "./icons";
import { Pouch } from "./Pouch";
import { Wash } from "./Wash";

/* Shared sections for the homepage and the product page. Copy comes from content.ts. */

/** Centred section title, with an optional small kicker above and a line below. */
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
          className={`mb-4 text-[0.78rem] font-medium uppercase tracking-[0.2em] ${dark ? "text-cream/85" : "text-ink"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2 id={id} data-anim="fade" className={`title ${dark ? "text-cream" : ""}`}>
        {title}
      </h2>
      {text && (
        <p
          data-anim="fade"
          className={`mt-5 leading-relaxed ${dark ? "text-cream/85" : "text-muted-foreground"} ${align === "center" ? "mx-auto max-w-xl" : ""}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/** "SkinFusion vs. the rest": our column in rose with the pouch on top. */
export function ComparisonTable() {
  const [ours, ...others] = comparison.columns;
  const look = packaging[FEATURED_PRODUCT_HANDLE];
  return (
    <section aria-labelledby="compare-title" className="bg-blush px-4 py-16 md:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 lg:grid-cols-[0.75fr_1.6fr] lg:gap-16">
        <div className="max-w-sm">
          <h2 id="compare-title" data-anim="fade" className="headline">
            {comparison.title}
          </h2>
          <p data-anim="fade" className="mt-5 leading-relaxed text-ink/80">
            {comparison.text}
          </p>
        </div>
        <div data-anim="fade" className="min-w-0">
          <table className="w-full table-fixed border-separate border-spacing-0 text-center text-sm">
            <caption className="sr-only">
              {ours} compared with {others.join(" and ")}
            </caption>
            <colgroup>
              <col className="w-[36%] sm:w-[31%]" />
              <col />
              <col />
              <col className="hidden sm:table-column" />
            </colgroup>
            <thead>
              <tr>
                <td />
                <th scope="col" className="rounded-t-xl bg-rose px-2 pb-4 pt-3 align-bottom">
                  {look && (
                    <Pouch
                      look={look}
                      shadow={false}
                      className="mx-auto mb-2 h-20 w-auto md:h-24"
                    />
                  )}
                  <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-wine">
                    {ours}
                  </span>
                </th>
                {others.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`px-2 pb-4 align-bottom text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink/70 ${i === 1 ? "hidden sm:table-cell" : ""}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, r) => {
                const last = r === comparison.rows.length - 1;
                return (
                  <tr key={row.label}>
                    <th
                      scope="row"
                      className="border-t border-ink/15 py-4 pr-3 text-left text-[0.8rem] font-medium uppercase leading-snug tracking-[0.08em] md:text-[0.85rem]"
                    >
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={`border-t px-2 py-4 ${i === 0 ? `border-wine/10 bg-rose ${last ? "rounded-b-xl" : ""}` : "border-ink/15 text-ink/75"} ${i === 2 ? "hidden sm:table-cell" : ""}`}
                      >
                        <Cell value={v} strong={i === 0} />
                      </td>
                    ))}
                  </tr>
                );
              })}
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
          size={24}
          weight={strong ? "bold" : "light"}
          className={`mx-auto ${strong ? "text-wine" : ""}`}
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

// One pastel per icon, like hand-painted swatches.
const WASHES = ["#fbd3d7", "#cfe3f3", "#f9d6c4", "#d6e9cf", "#e3d9f1", "#f7e3b4"];

/** Row of watercolour circles with line icons. */
export function Standards({ title }: { title: string }) {
  return (
    <section aria-labelledby="standards-title" className="px-4 py-16 md:px-6 lg:py-24">
      <div className="mx-auto max-w-[80rem]">
        <h2 id="standards-title" data-anim="fade" className="title text-center">
          {title}
        </h2>
        <ul
          data-anim="cards"
          className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-x-4 gap-y-10 md:grid-cols-6"
        >
          {standards.map((s, i) => (
            <li key={s.label} className="flex flex-col items-center text-center">
              <span className="relative grid h-24 w-24 place-items-center md:h-28 md:w-28">
                <Wash
                  color={WASHES[i % WASHES.length]!}
                  seed={i + 2}
                  className="absolute inset-0 h-full w-full"
                />
                <Icon name={s.icon} size={40} className="relative text-ink" />
              </span>
              <span className="mt-3 text-sm leading-snug">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Four ingredient photos on watercolour, with their Chinese names, plus true facts. */
export function Ingredients({
  items,
  title,
  text,
  facts,
  id = "ingredients",
}: {
  items: Ingredient[];
  title: string;
  text?: string | undefined;
  facts?: { value: string; label: string }[];
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 bg-sand px-4 py-16 md:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-[80rem]">
        <SectionIntro id={`${id}-title`} title={title} text={text} />
        <ul
          data-anim="cards"
          className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
        >
          {items.map((ing, i) => (
            <li key={ing.name} className="flex flex-col items-center text-center">
              <div className="relative w-44 md:w-48">
                <Wash
                  color={WASHES[i % WASHES.length]!}
                  seed={i + 11}
                  className="absolute -inset-5 h-[calc(100%+2.5rem)] w-[calc(100%+2.5rem)]"
                />
                <div className="relative aspect-square overflow-hidden rounded-full">
                  <Img
                    media={media.ingredients[ing.image] as MediaImage}
                    sizes="12rem"
                    className="h-full w-full"
                  />
                </div>
                <span
                  lang="zh-Hans"
                  className="absolute -right-2 -top-2 grid h-12 w-12 place-items-center rounded-full bg-wine text-lg text-cream"
                >
                  {ing.hanzi.slice(0, 1)}
                </span>
              </div>
              <h3 className="mt-8 text-[0.9rem] font-medium uppercase tracking-[0.2em]">
                {ing.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <span lang="zh-Hans">{ing.hanzi}</span> <span className="italic">{ing.pinyin}</span>
              </p>
              <p className="mt-4 max-w-xs leading-relaxed text-ink/80">{ing.text}</p>
            </li>
          ))}
        </ul>
        {facts && (
          <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 border-t border-ink/15 pt-10 text-center">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm">
                  {f.label}
                </dt>
                <dd
                  data-count
                  className="order-1 text-5xl font-light tabular-nums text-wine md:text-6xl"
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
          <h2 id="ritual-title" data-anim="fade" className="title">
            {title}
          </h2>
          <ol data-anim="cards" className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 leading-relaxed">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush text-sm font-medium text-wine"
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

/** Rating summary and customer quotes. Quotes marked isDemo are placeholders. */
export function Reviews({ rating }: { rating: { value: number; count: number } | null }) {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="scroll-mt-28 px-4 py-16 md:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-[80rem]">
        <div className="flex flex-col items-center text-center">
          <h2 id="reviews-title" data-anim="fade" className="title">
            {reviews.title}
          </h2>
          {rating && (
            <p
              data-anim="fade"
              className="mt-5 flex items-center gap-3 text-sm text-muted-foreground"
            >
              <Stars value={rating.value} size={18} />
              <span>
                <span className="font-medium text-ink">{rating.value.toFixed(1)}</span> from{" "}
                {rating.count.toLocaleString("en-IN")} reviews
              </span>
            </p>
          )}
        </div>
        <ul data-anim="cards" className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8 lg:mt-14">
          {reviews.quotes.map((q, i) => (
            <li key={q.name} className="flex flex-col border-t border-ink/15 pt-7">
              <Stars value={5} size={15} />
              <h3 className="mt-4 text-[0.85rem] font-medium uppercase tracking-[0.16em]">
                {q.title}
              </h3>
              <blockquote className="mt-3 flex-1 text-[1.05rem] leading-relaxed text-ink/85">
                {q.text}
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-sand">
                  {media.reviews[i] && (
                    <Img media={media.reviews[i]} sizes="3rem" className="h-full w-full" />
                  )}
                </div>
                <p className="text-sm">
                  {q.name}, <span className="text-muted-foreground">{q.city}</span>
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
    <details open={defaultOpen} className="group border-b border-ink/15">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-[0.82rem] font-medium uppercase tracking-[0.18em] [&::-webkit-details-marker]:hidden">
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
    <section aria-labelledby="faq-title" className="bg-blush px-4 py-16 md:px-6 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <SectionIntro id="faq-title" title={title} />
        <div data-anim="fade" className="mt-10 border-t border-ink/15">
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
