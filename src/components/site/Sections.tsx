import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Coffee, Leaf, SealCheck, HandHeart, Star, Check, X, InstagramLogo, ArrowRight } from "@phosphor-icons/react";
import {
  images, product, packs, SUBSCRIBE_DISCOUNT, trust, ingredients, ritualWeeks, comparison,
  brewSteps, reviews, instagram, journal, brand,
} from "@/data/content";
import { useCart, inr } from "@/lib/cart";
import { Reveal } from "./Reveal";

/* ---------------- HERO ---------------- */
export function Hero() {
  const slides = [images.hero1, images.hero2];
  const [i, setI] = useState(0);
  const bg = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const on = () => { if (bg.current) bg.current.style.transform = `translateY(${window.scrollY * 0.15}px)`; };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const chips = [
    { t: "Jujube", c: "left-0 top-[18%]", d: "0s" },
    { t: "Snow Fungus", c: "right-0 top-[40%]", d: "1.5s" },
    { t: "Goji", c: "left-[6%] bottom-[14%]", d: "3s" },
  ];
  return (
    <section className="relative -mt-16 overflow-hidden md:-mt-20">
      <div ref={bg} className="absolute inset-0 will-change-transform">
        {slides.map((s, k) => (
          <img key={k} src={s} alt="" width={1920} height={1088} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${i === k ? "opacity-100" : "opacity-0"}`} />
        ))}
      </div>
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="container-x relative grid min-h-[100dvh] items-center gap-10 pb-16 pt-28 md:grid-cols-2 md:pt-32">
        <div className="max-w-xl">
          <p className="label-caps text-brand">Traditional Chinese Medicine, reimagined</p>
          <h1 className="mt-6 text-5xl text-foreground sm:text-6xl lg:text-7xl">Glow <em className="italic text-brand">from within.</em></h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">A caffeine-free skin glow tea of jujube, snow fungus and goji, made for one calm cup a day.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#shop" className="btn btn-primary">Shop Skin Glow Tea</a>
            <Link to="/quiz" className="btn btn-outline">Take the Skin Quiz</Link>
          </div>
          <div className="mt-10 flex gap-2">
            {slides.map((_, k) => (
              <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className="grid h-11 w-8 place-items-center">
                <span className={`block h-1 rounded-full transition-all duration-500 ${i === k ? "w-8 bg-foreground" : "w-3 bg-foreground/30"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm md:max-w-md">
          <div className="absolute -inset-12 bg-glow blur-2xl" />
          <img src={images.pouch} alt={product.name} className="relative aspect-[4/5] w-full animate-float rounded-xl object-cover shadow-soft" />
          {chips.map((c) => (
            <span key={c.t} style={{ animationDelay: c.d }} className={`label-caps absolute ${c.c} animate-drift rounded-full border bg-background/90 px-4 py-2 text-[0.65rem] text-brand backdrop-blur`}>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />{c.t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUST ---------------- */
const trustIcons = { coffee: Coffee, leaf: Leaf, seal: SealCheck, hand: HandHeart } as const;
export function TrustStrip() {
  return (
    <section className="border-y">
      <div className="container-x grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
        {trust.map((t, k) => {
          const I = trustIcons[t.icon as keyof typeof trustIcons];
          return (
            <Reveal key={t.label} delay={k * 80} className="flex flex-col items-center gap-3 text-center">
              <I size={30} weight="light" className="text-teal" />
              <span className="label-caps text-[0.68rem]">{t.label}</span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- INGREDIENTS ---------------- */
export function IngredientStory() {
  return (
    <section id="ingredients" className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="label-caps text-teal">What is inside</p>
          <h2 className="mt-5 text-4xl md:text-6xl">Four ingredients. <em className="italic text-brand">One ritual.</em></h2>
          <p className="mt-6 max-w-md text-muted-foreground">Whole, recognisable ingredients from the TCM pantry. Nothing hidden, nothing added.</p>
        </div>
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:px-0">
          {ingredients.map((g, k) => (
            <Reveal key={g.name} delay={k * 80} as="article" className={`w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto ${k % 2 ? "lg:mt-16" : ""}`}>
              <div className="overflow-hidden rounded-lg">
                <img src={g.image} alt={g.name} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3">
                <h3 className="text-2xl">{g.name}</h3>
                <span className="text-xs text-muted-foreground">{g.chinese}</span>
              </div>
              <p className="mt-2 text-muted-foreground">{g.line}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURED PRODUCT ---------------- */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex text-primary">
      {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={size} weight={s <= Math.round(value) ? "fill" : "light"} />)}
    </span>
  );
}

export function FeaturedProduct() {
  const [img, setImg] = useState(0);
  const [pack, setPack] = useState("2");
  const [sub, setSub] = useState(false);
  const { add } = useCart();
  const p = packs.find((x) => x.id === pack)!;
  const unit = product.price * (1 - p.discount) * (sub ? 1 - SUBSCRIBE_DISCOUNT : 1);
  const total = unit * p.qty;
  const mrpTotal = product.mrp * p.qty;
  return (
    <section id="shop" className="section-y bg-blush">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="overflow-hidden rounded-lg bg-background">
            <img src={product.gallery[img] ?? images.pouch} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.gallery.map((g, k) => (
              <button key={k} onClick={() => setImg(k)} aria-label={`View image ${k + 1}`} className={`overflow-hidden rounded-md border-2 transition-colors ${img === k ? "border-primary" : "border-transparent"}`}>
                <img src={g} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal delay={80} className="lg:pt-6">
          <p className="label-caps text-teal">TCM Edition · {product.size}</p>
          <h2 className="mt-4 text-4xl md:text-5xl">{product.name}</h2>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <Stars value={product.rating} />
            <span className="text-muted-foreground">{product.rating} · {product.reviewCount} reviews</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-4xl">{inr(product.price)}</span>
            <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
            <span className="label-caps rounded-sm bg-primary px-2 py-1 text-[0.6rem] text-primary-foreground">{Math.round((1 - product.price / product.mrp) * 100)}% off</span>
          </div>
          <p className="mt-6 max-w-[65ch] text-muted-foreground">{product.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {product.benefits.map((b) => <li key={b} className="label-caps rounded-full border border-teal/40 px-3 py-1.5 text-[0.62rem] text-teal">{b}</li>)}
          </ul>

          <p className="label-caps mt-9">Choose your pack</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {packs.map((x) => (
              <button key={x.id} onClick={() => setPack(x.id)} className={`relative rounded-lg border bg-background px-3 py-4 text-left transition-colors ${pack === x.id ? "border-foreground" : "hover:border-foreground/30"}`}>
                {x.popular && <span className="label-caps absolute -top-2.5 left-3 rounded-sm bg-primary px-2 py-0.5 text-[0.55rem] text-primary-foreground">Most popular</span>}
                <span className="label-caps block text-[0.68rem]">{x.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{x.note}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {[{ v: false, t: "One-time purchase", s: "" }, { v: true, t: "Subscribe & save 15%", s: "Delivered monthly, skip or cancel anytime" }].map((o) => (
              <label key={o.t} className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-4 py-3 ${sub === o.v ? "border-foreground" : ""}`}>
                <input type="radio" name="buy" checked={sub === o.v} onChange={() => setSub(o.v)} className="accent-primary" />
                <span className="flex-1">
                  <span className="block">{o.t}</span>
                  {o.s && <span className="block text-xs text-muted-foreground">{o.s}</span>}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={() => add({ key: `${pack}-${sub}`, name: product.short, image: images.pouch, packLabel: p.label, unitPrice: total, qty: 1, subscribe: sub })}
            className="btn btn-primary mt-7 w-full"
          >
            Add to cart · {inr(total)} <span className="line-through opacity-60">{inr(mrpTotal)}</span>
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Free shipping above ₹699 · Extra 5% off on prepaid orders</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- RITUAL ---------------- */
export function GlowRitual() {
  return (
    <section id="ritual" className="section-y">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="overflow-hidden rounded-banner">
          <img src={images.ritual} alt="Pouring tea from a glass teapot" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full object-cover" />
        </Reveal>
        <div>
          <p className="label-caps text-teal">A gentle routine</p>
          <h2 className="mt-5 text-4xl md:text-6xl">The 21-Day <em className="italic text-brand">Glow Ritual</em></h2>
          <p className="mt-6 max-w-md text-muted-foreground">Not a challenge, just a habit. Three weeks to make a warm cup part of your day.</p>
          <ol className="relative mt-12 space-y-10 border-l pl-8">
            {ritualWeeks.map((w, k) => (
              <Reveal as="li" key={w.week} delay={k * 80} className="relative">
                <span className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="label-caps text-primary">{w.week}</p>
                <h3 className="mt-2 text-2xl">{w.title}</h3>
                <p className="mt-2 max-w-[65ch] text-muted-foreground">{w.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- COMPARISON ---------------- */
export function Comparison() {
  return (
    <section className="section-y bg-blush">
      <div className="container-x max-w-5xl">
        <Reveal className="text-center">
          <h2 className="text-4xl md:text-5xl">Why a cup, <em className="italic text-brand">not a capsule</em></h2>
        </Reveal>
        <Reveal delay={80} className="mt-12 overflow-x-auto rounded-lg bg-background">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b">
                <th className="p-5" />
                {comparison.columns.map((c, k) => (
                  <th key={c} className={`label-caps p-5 text-center text-[0.65rem] ${k === 0 ? "text-brand" : "text-muted-foreground"}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((r) => (
                <tr key={r.label} className="border-b last:border-0">
                  <td className="p-5">{r.label}</td>
                  {r.values.map((v, k) => (
                    <td key={k} className={`p-5 text-center ${k === 0 ? "bg-blush/50" : ""}`}>
                      {v ? <Check size={20} weight="light" className="mx-auto text-brand" /> : <X size={18} weight="light" className="mx-auto text-muted-foreground/60" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- BREW ---------------- */
export function HowToBrew() {
  return (
    <section className="section-y">
      <div className="container-x">
        <Reveal><h2 className="max-w-xl text-4xl md:text-5xl">How to <em className="italic text-brand">brew</em></h2></Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {brewSteps.map((s, k) => (
            <Reveal key={s.n} delay={k * 80} as="article">
              <div className="overflow-hidden rounded-lg">
                <img src={s.image} alt={s.title} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover" />
              </div>
              <div className="mt-6 flex gap-5">
                <span className="font-serif text-6xl leading-none text-primary">{s.n}</span>
                <div>
                  <h3 className="text-xl">{s.title}</h3>
                  <p className="mt-1 text-muted-foreground">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- QUIZ TEASER ---------------- */
export function QuizTeaser() {
  return (
    <section className="container-x">
      <Reveal className="relative overflow-hidden rounded-banner bg-blush px-6 py-16 text-center md:py-24">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 bg-glow blur-3xl" />
        <div className="relative">
          <p className="label-caps text-teal">Skin quiz</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl md:text-5xl">Not sure where to start? <em className="italic text-brand">Find your glow ritual</em> in 60 seconds.</h2>
          <Link to="/quiz" className="btn btn-primary mt-9">Take the quiz <ArrowRight size={16} weight="light" /></Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- REVIEWS ---------------- */
export function Reviews() {
  return (
    <section className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_2fr]">
        <Reveal>
          <p className="label-caps text-teal">Reviews</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-serif text-7xl leading-none">{reviews.average}</span>
            <span className="pb-2 text-muted-foreground">/ 5</span>
          </div>
          <div className="mt-3"><Stars value={reviews.average} size={18} /></div>
          <p className="mt-2 text-sm text-muted-foreground">Based on {reviews.total} reviews</p>
          <div className="mt-6 space-y-2">
            {reviews.bars.map((b) => (
              <div key={b.stars} className="flex items-center gap-3 text-sm">
                <span className="w-3">{b.stars}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blush">
                  <div className="h-full origin-left bg-primary" style={{ transform: `scaleX(${b.pct / 100})` }} />
                </div>
                <span className="w-9 text-right text-muted-foreground">{b.pct}%</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-4 gap-2">
            {reviews.photos.map((ph, k) => <img key={k} src={ph} alt="Customer photo" loading="lazy" className="aspect-square w-full rounded-md object-cover" />)}
          </div>
        </Reveal>
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 lg:mx-0 lg:px-0">
          {reviews.items.map((r) => (
            <article key={r.name} className="flex w-[82%] shrink-0 snap-start flex-col rounded-lg border bg-background p-7 sm:w-[46%] lg:w-[40%]">
              <Stars value={r.rating} />
              <p className="mt-5 flex-1 font-serif text-xl leading-snug">{r.text}</p>
              <p className="label-caps mt-6 text-[0.68rem]">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.city} · Verified buyer</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- INSTAGRAM ---------------- */
export function InstagramStrip() {
  return (
    <section className="pb-16 lg:pb-28">
      <div className="container-x mb-8 flex items-end justify-between">
        <h2 className="text-3xl md:text-4xl">Cups of <em className="italic text-brand">calm</em></h2>
        <a href="#" className="label-caps text-primary">{brand.instagram}</a>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6">
        {instagram.map((src, k) => (
          <a key={k} href="#" className="group relative overflow-hidden" aria-label="View on Instagram">
            <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center bg-foreground/30 text-background opacity-0 transition-opacity group-hover:opacity-100">
              <InstagramLogo size={30} weight="light" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------------- JOURNAL ---------------- */
export function Journal() {
  return (
    <section id="journal" className="section-y bg-blush">
      <div className="container-x">
        <Reveal className="flex items-end justify-between">
          <h2 className="text-4xl md:text-5xl">From the <em className="italic text-brand">journal</em></h2>
          <a href="#" className="label-caps hidden text-primary sm:block">All stories</a>
        </Reveal>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {journal.map((j, k) => (
            <Reveal key={j.title} delay={k * 80} as="article" className="group">
              <div className="overflow-hidden rounded-lg">
                <img src={j.image} alt={j.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="label-caps mt-5 text-[0.65rem] text-teal">{j.tag} · {j.read}</p>
              <h3 className="mt-2 text-2xl">{j.title}</h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- NEWSLETTER ---------------- */
export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="section-y">
      <Reveal className="container-x max-w-2xl text-center">
        <h2 className="text-4xl md:text-6xl">Get <em className="italic text-brand">10% off</em> your first order</h2>
        <p className="mt-5 text-muted-foreground">Rituals, recipes and early access to new blends. No spam, ever.</p>
        {done ? (
          <p className="mt-9 text-brand">Thank you. Your code is on its way.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
            <input required type="email" placeholder="Your email" className="min-h-12 flex-1 rounded-md border border-input bg-background px-4 outline-none focus:border-primary" />
            <button className="btn btn-primary">Subscribe</button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
