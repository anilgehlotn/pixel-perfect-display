import { useRef, useState } from "react";
import {
  Star,
  Check,
  X,
  ArrowRight,
  HandHeart,
  Plant,
  HouseLine,
  Leaf,
  Drop,
  Sun,
} from "@phosphor-icons/react";
import {
  images,
  hero,
  product,
  products,
  packs,
  inside,
  comparison,
  standards,
  mission,
  reviews,
  journal,
  type Product,
} from "@/data/content";
import { useCart } from "@/lib/cart/context";
import { rs } from "@/lib/format";
import { Reveal } from "./Reveal";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex text-primary" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} weight={s <= Math.round(value) ? "fill" : "light"} />
      ))}
    </span>
  );
}

function Img({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src)
    return (
      <div role="img" aria-label={alt} className={`grid place-items-center bg-beige ${className}`}>
        <span className="label-caps px-4 text-center text-[0.65rem] text-muted-foreground">
          {alt}
        </span>
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}

function Heading({
  kicker,
  title,
  center = true,
}: {
  kicker?: string;
  title: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      {kicker && <p className="label-caps text-muted-foreground">{kicker}</p>}
      <h2 className="mt-3 text-xl md:text-3xl">{title}</h2>
    </Reveal>
  );
}

/* 2. HERO */
export function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-beige">
      <img
        src={images.hero}
        alt="Glass cups of golden tea with jujubes, snow fungus, goji berries and pink blossoms on a peach surface"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-scrim" />
      <div className="absolute bottom-[18%] left-[6%] right-[6%] max-w-xl animate-fade-up text-on-image md:bottom-[22%]">
        <p className="label-caps text-[0.7rem]">{hero.kicker}</p>
        <h1 className="mt-4 text-[28px] md:text-[40px]">{hero.title}</h1>
        <a href="#featured" className="btn btn-primary mt-8">
          {hero.cta}
        </a>
      </div>
    </section>
  );
}

/* 3. POPULAR TEAS */
function ProductCard({ p, delay }: { p: Product; delay: number }) {
  const { add } = useCart();
  return (
    <Reveal
      delay={delay}
      as="article"
      className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[calc(25%-18px)]"
    >
      <div className="group relative aspect-[4/5] overflow-hidden bg-beige">
        <Img
          src={p.image}
          alt={p.image ? `${p.name} pouch` : `${p.name} image coming soon`}
          className="absolute inset-0 h-full w-full transition-[transform,opacity] duration-700 group-hover:scale-[1.04]"
        />
        {p.hoverImage && (
          <img
            src={p.hoverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}
        {p.badge && (
          <span className="label-caps absolute left-3 top-3 grid h-16 w-16 place-items-center rounded-full bg-primary text-center text-[0.55rem] leading-tight text-primary-foreground">
            {p.badge}
          </span>
        )}
        {p.tag && (
          <span className="label-caps absolute right-3 top-3 bg-primary px-2.5 py-1 text-[0.6rem] text-primary-foreground">
            {p.tag}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-center text-sm">{p.name}</h3>
      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Stars value={p.rating} /> ({p.reviews})
      </div>
      <p className="mt-2 text-center">
        <span>{rs(p.price)}</span>{" "}
        <span className="ml-2 text-muted-foreground line-through">{rs(p.mrp)}</span>
      </p>
      <button
        onClick={() =>
          add({
            key: `${p.id}-1`,
            name: p.name,
            image: p.image,
            packLabel: "1 Pouch",
            unitPrice: p.price,
            qty: 1,
            subscribe: false,
          })
        }
        className="btn btn-primary mt-4 w-full"
      >
        Add to cart
      </button>
    </Reveal>
  );
}

export function PopularTeas() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = () => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <section id="shop" className="section-y scroll-mt-32">
      <div className="container-x">
        <Heading kicker="Skin rituals from nature" title="Popular teas" />
        <div className="relative mt-12">
          <div
            ref={track}
            className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 lg:mx-0 lg:px-0"
          >
            {products.map((p, k) => (
              <ProductCard key={p.id} p={p} delay={k * 80} />
            ))}
          </div>
          <button
            onClick={scroll}
            aria-label="Next products"
            className="absolute -right-2 top-[38%] hidden h-12 w-12 place-items-center rounded-full border bg-background md:grid lg:-right-6"
          >
            <ArrowRight size={20} weight="light" />
          </button>
        </div>
        <div className="mt-12 text-center">
          <a href="#featured" className="btn btn-primary">
            Shop all
          </a>
        </div>
      </div>
    </section>
  );
}

/* 4. FEATURED */
export function FeaturedProduct() {
  const [pack, setPack] = useState("1");
  const { add } = useCart();
  const p = packs.find((x) => x.id === pack) ?? packs[0]!;
  const total = product.price * (1 - p.discount) * p.qty;
  return (
    <section id="featured" className="section-y scroll-mt-32 border-t">
      <div className="container-x">
        <Heading kicker="Meet your new daily ritual" title={product.name} />
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal className="bg-beige">
            <img
              src={images.pouch}
              alt="SkinFusion TCM Edition Skin Glow Tea pouch with jujubes, goji and snow fungus"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={80} className="self-center">
            <h3 className="text-lg md:text-xl">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{product.size}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Stars value={product.rating} /> {product.rating} · {product.reviewCount} reviews
            </div>
            <p className="mt-5 text-xl">
              {rs(product.price)}{" "}
              <span className="ml-2 text-base text-muted-foreground line-through">
                {rs(product.mrp)}
              </span>
            </p>
            <p className="mt-5 max-w-[65ch] text-muted-foreground">{product.description}</p>
            <div className="mt-8 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Pack size">
              {packs.map((x) => (
                <button
                  key={x.id}
                  role="radio"
                  aria-checked={pack === x.id}
                  onClick={() => setPack(x.id)}
                  className={`min-h-20 border px-2 py-3 text-center transition-colors ${pack === x.id ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-foreground"}`}
                >
                  <span className="label-caps block text-[0.65rem]">{x.label}</span>
                  {x.note && (
                    <span className="mt-1 block text-[0.7rem] leading-tight">{x.note}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                add(
                  {
                    key: `skin-glow-tea-${pack}`,
                    name: product.short,
                    image: images.pouch,
                    packLabel: p.label,
                    unitPrice: total,
                    qty: 1,
                    subscribe: false,
                  },
                  { openDrawer: true },
                )
              }
              className="btn btn-primary mt-6 w-full"
            >
              Add to cart · {rs(total)}
            </button>
            <a href="#inside" className="label-caps mt-5 inline-block underline underline-offset-4">
              View product details
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* 5. WHAT'S INSIDE */
export function WhatsInside() {
  return (
    <section id="inside" className="grid scroll-mt-32 lg:grid-cols-2">
      <div className="flex items-center bg-background px-6 py-16 lg:px-16 lg:py-32 xl:px-24">
        <Reveal className="max-w-xl">
          <p className="label-caps text-muted-foreground">{inside.kicker}</p>
          <h2 className="mt-3 text-xl md:text-3xl">{inside.title}</h2>
          <ul className="mt-8 space-y-4">
            {inside.items.map((i) => (
              <li key={i.name} className="max-w-[65ch] text-muted-foreground">
                <span className="label-caps mr-2 text-foreground">{i.name}.</span>
                {i.line}
              </li>
            ))}
          </ul>
          <a href="#featured" className="label-caps mt-8 inline-block underline underline-offset-4">
            Try the Skin Glow Tea
          </a>
        </Reveal>
      </div>
      <img
        src={images.inside}
        alt="Hands pouring golden tea from a glass teapot at a sunlit table"
        loading="lazy"
        className="aspect-[4/5] h-full w-full object-cover lg:aspect-auto"
      />
    </section>
  );
}

/* 6. US VS THEM */
export function UsVsThem() {
  return (
    <section className="section-y">
      <div className="container-x max-w-4xl">
        <Heading title={comparison.title} />
        <Reveal delay={80} className="mt-12">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b pb-4">
            <span />
            {comparison.columns.map((c, k) => (
              <span
                key={c}
                className={`label-caps text-center text-[0.65rem] ${k ? "text-muted-foreground" : ""}`}
              >
                {c}
              </span>
            ))}
          </div>
          {comparison.rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b py-5"
            >
              <span>{r.label}</span>
              {r.values.map((v, k) => (
                <span key={k} className="flex justify-center">
                  {v ? (
                    <Check size={22} weight="light" className="text-primary" aria-label="Yes" />
                  ) : (
                    <X size={20} weight="light" className="text-muted-foreground" aria-label="No" />
                  )}
                </span>
              ))}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* 7. OUR STANDARDS */
const stdIcons = {
  hand: HandHeart,
  plant: Plant,
  house: HouseLine,
  leaf: Leaf,
  drop: Drop,
  sun: Sun,
};
const stdTones = {
  peach: "bg-pastel-peach",
  pink: "bg-pastel-pink",
  blue: "bg-pastel-blue",
  green: "bg-pastel-green",
  orange: "bg-pastel-orange",
  yellow: "bg-pastel-yellow",
};
export function OurStandards() {
  return (
    <section className="section-y border-t">
      <div className="container-x">
        <Heading title="Our standards" />
        <div className="mt-14 grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {standards.map((s, k) => {
            const I = stdIcons[s.icon];
            return (
              <Reveal
                key={s.label}
                delay={k * 80}
                className="flex flex-col items-center text-center"
              >
                <span
                  className={`grid h-24 w-24 place-items-center rounded-full ${stdTones[s.tone]}`}
                >
                  <I size={34} weight="light" />
                </span>
                <span className="label-caps mt-5 max-w-[12ch] text-[0.68rem]">{s.label}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 8. MISSION */
export function OurMission() {
  return (
    <section id="mission" className="section-y scroll-mt-32 bg-blush">
      <Reveal className="container-x max-w-3xl text-center">
        <h2 className="text-xl md:text-3xl">Our mission</h2>
        <p className="mx-auto mt-8 text-lg leading-relaxed md:text-xl">{mission}</p>
        <a href="#journal" className="label-caps mt-8 inline-block underline underline-offset-4">
          Learn more
        </a>
      </Reveal>
    </section>
  );
}

/* 9. REVIEWS */
export function Reviews() {
  return (
    <section className="section-y">
      <div className="container-x">
        <Heading title="What our customers say" />
        <Reveal
          delay={80}
          className="mx-auto mt-12 grid max-w-3xl items-center gap-10 md:grid-cols-2"
        >
          <div className="text-center">
            <p className="text-6xl font-light">{reviews.average}</p>
            <div className="mt-3">
              <Stars value={reviews.average} size={20} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{reviews.totalLabel}</p>
            <p className="label-caps mt-4 text-[0.68rem]">{reviews.recommend}</p>
          </div>
          <div className="space-y-2">
            {reviews.bars.map((b) => (
              <div
                key={b.stars}
                className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 text-sm"
              >
                <span>{b.stars} star</span>
                <div className="h-1.5 overflow-hidden bg-beige">
                  <div
                    className="h-full origin-left bg-primary"
                    style={{ transform: `scaleX(${b.pct / 100})` }}
                  />
                </div>
                <span className="text-right text-muted-foreground">{b.pct}%</span>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.items.map((r, k) => (
            <Reveal key={r.name} delay={k * 80} as="article" className="border bg-background p-7">
              <Stars value={r.rating} />
              <h3 className="mt-4 text-sm">{r.title}</h3>
              <p className="mt-3 text-muted-foreground">{r.text}</p>
              <p className="label-caps mt-6 text-[0.65rem]">
                {r.name} · {r.city}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 10. JOURNAL */
export function Journal() {
  return (
    <section id="journal" className="section-y scroll-mt-32 border-t">
      <div className="container-x">
        <Heading kicker={journal.kicker} title={journal.title} />
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {journal.items.map((j, k) => (
            <Reveal key={j.title} delay={k * 80} as="article" className="group">
              <div className="overflow-hidden bg-beige">
                <img
                  src={j.image}
                  alt={j.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <p className="label-caps mt-5 text-[0.65rem] text-muted-foreground">{j.tag}</p>
              <h3 className="mt-2 text-sm leading-relaxed">{j.title}</h3>
              <p className="mt-2 line-clamp-2 text-muted-foreground">{j.excerpt}</p>
              <a
                href="#journal"
                className="label-caps mt-4 inline-block text-[0.68rem] underline underline-offset-4"
              >
                Read more
              </a>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a href="#journal" className="btn btn-primary">
            View all articles
          </a>
        </div>
      </div>
    </section>
  );
}
