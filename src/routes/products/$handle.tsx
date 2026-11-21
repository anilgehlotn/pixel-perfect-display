import { useEffect, useRef, useState, type RefObject } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CaretRight } from "@phosphor-icons/react";
import { brand, pdp, productDetails, type ProductDetails } from "@/data/content";
import { media } from "@/data/media";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";
import { absoluteUrl, site } from "@/lib/seo";
import { getProduct, getProducts } from "@/lib/catalog/products";
import { money } from "@/lib/catalog/types";
import { useScrollAnimations } from "@/lib/animations/useScrollAnimations";
import { BuyBox } from "@/components/product/BuyBox";
import { usePurchase, type Purchase } from "@/components/product/purchase";
import { Gallery } from "@/components/product/Gallery";
import { fromMedia, fromProduct } from "@/components/product/gallery-image";
import { ProductCard } from "@/components/home/Sections";
import {
  ComparisonTable,
  Disclosure,
  Faq,
  Ingredients,
  Reviews,
  Steps,
} from "@/components/product/Blocks";
import { Icon } from "@/components/product/icons";
import type { Product } from "@/lib/catalog/types";

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ params }) => {
    const [product, all] = await Promise.all([getProduct(params.handle), getProducts()]);
    if (!product) throw notFound();
    return { product, related: all.filter((p) => p.handle !== product.handle).slice(0, 4) };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return {};
    const title = `${p.title} | ${site.name}`;
    const details = productDetails[p.handle];
    const description =
      details?.tagline ?? (p.description || `${p.title} from ${site.name}, Mumbai.`);
    const image = p.featuredImage?.url ?? media.products[p.handle]?.fallback.src;
    const imageUrl = image ? (image.startsWith("http") ? image : absoluteUrl(image)) : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(imageUrl
          ? [
              { property: "og:image", content: imageUrl },
              { name: "twitter:image", content: imageUrl },
            ]
          : []),
        { property: "product:price:amount", content: p.priceRange.minVariantPrice.amount },
        { property: "product:price:currency", content: p.priceRange.minVariantPrice.currencyCode },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const details = productDetails[product.handle];
  const scope = useRef<HTMLElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const purchase = usePurchase(product);
  useScrollAnimations(scope, [product.handle]);

  const images = [
    ...product.images.map((img) => fromProduct(img, product.title)),
    ...(media.gallery[product.handle] ?? []).map(fromMedia),
  ];
  if (!images.length) {
    const art = media.products[product.handle] ?? media.productDefault;
    images.push(fromMedia(art.fallback));
  }

  return (
    <main ref={scope} key={product.handle}>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[80rem] px-4 pt-24 md:px-6 md:pt-28">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="inline-flex min-h-11 items-center hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <CaretRight size={12} weight="light" />
          </li>
          <li>
            <a href="/#shop" className="inline-flex min-h-11 items-center hover:text-ink">
              {pdp.breadcrumbShop}
            </a>
          </li>
          <li aria-hidden="true">
            <CaretRight size={12} weight="light" />
          </li>
          <li aria-current="page" className="text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <section className="mx-auto grid max-w-[80rem] gap-10 px-4 pb-16 pt-4 md:px-6 lg:grid-cols-[1.12fr_1fr] lg:gap-16 lg:pb-24 xl:gap-24">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div data-anim="media">
            <Gallery images={images} label={product.title} />
          </div>
        </div>
        <div data-anim="fade" className="min-w-0 lg:pt-2">
          <BuyBox
            product={product}
            details={details}
            purchase={purchase}
            addRef={addRef}
            heading={<h1 className="headline text-green">{product.title}</h1>}
          />
          <div className="mt-8 border-t">
            <Disclosure title={pdp.accordions.description} defaultOpen>
              <p>{product.description || pdp.comingSoon}</p>
              {details && <p className="mt-3">{details.taste}</p>}
            </Disclosure>
            {details && (
              <Disclosure title={pdp.accordions.ingredients}>
                <ul className="space-y-2">
                  {details.ingredients.map((i) => (
                    <li key={i.name}>
                      <span className="text-ink">{i.name}</span>{" "}
                      <span lang="zh-Hans">({i.hanzi})</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  Nothing else: no added sugar, flavourings, colour or preservatives.
                </p>
              </Disclosure>
            )}
            {details && (
              <Disclosure title={pdp.accordions.brew}>
                <ol className="list-decimal space-y-2 pl-5">
                  {details.steps.map((s) => (
                    <li key={s.title}>{s.text}</li>
                  ))}
                </ol>
              </Disclosure>
            )}
            <Disclosure title={pdp.accordions.shipping}>
              <p>
                {pdp.shipping}{" "}
                <a
                  href={brand.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink underline underline-offset-4"
                >
                  WhatsApp
                </a>
              </p>
            </Disclosure>
          </div>
        </div>
      </section>

      {details && (
        <>
          <Benefits benefits={details.benefits} />
          <Steps
            steps={details.steps}
            title={pdp.ritual.title}
            aside={
              <div className="mt-10 border-t border-ink/10 pt-6">
                <p className="font-serif text-xl text-green">{pdp.ritual.taste}</p>
                <p className="mt-2 leading-relaxed text-ink/80">{details.taste}</p>
              </div>
            }
          />
          <Ingredients
            id="pdp-ingredients"
            items={details.ingredients}
            eyebrow={pdp.ingredients.eyebrow}
            title={pdp.ingredients.title}
          />
          <ComparisonTable />
        </>
      )}

      <Reviews rating={product.rating} />
      {details && <Faq items={details.faqs} title={pdp.faq.title} />}

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="section-y px-4 md:px-6">
          <div className="mx-auto max-w-[80rem]">
            <h2 id="related-title" data-anim="fade" className="title text-center text-gold">
              {pdp.related.title}
            </h2>
            <ul
              data-anim="cards"
              className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 [&>li]:w-[72%] [&>li]:shrink-0 [&>li]:snap-start md:[&>li]:w-auto"
            >
              {related.map((p) => (
                <ProductCard key={p.id} p={p} sizes="(min-width: 768px) 26rem, 72vw" />
              ))}
            </ul>
          </div>
        </section>
      )}

      <p className="mx-auto max-w-3xl px-6 pb-16 text-center text-xs leading-relaxed text-muted-foreground">
        {pdp.disclaimer}
      </p>

      <StickyBar product={product} purchase={purchase} target={addRef} />
    </main>
  );
}

function Benefits({ benefits }: { benefits: ProductDetails["benefits"] }) {
  return (
    <section aria-labelledby="benefits-title" className="bg-blush px-4 py-16 md:px-6 lg:py-20">
      <div className="mx-auto max-w-[72rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p data-anim="fade" className="mb-2 text-sm font-medium tracking-[0.06em] text-ink">
            {pdp.benefits.eyebrow}
          </p>
          <h2 id="benefits-title" data-anim="fade" className="title text-gold">
            {pdp.benefits.title}
          </h2>
          <p data-anim="fade" className="mt-4 leading-relaxed text-muted-foreground">
            {pdp.benefits.text}
          </p>
        </div>
        <ul
          data-anim="cards"
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6"
        >
          {benefits.map((b) => (
            <li key={b.title} className="flex flex-col rounded-card bg-surface p-7 md:p-8">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/50 text-gold-deep">
                <Icon name={b.icon} size={28} />
              </span>
              <h3 className="mt-5 font-serif text-[1.4rem] leading-snug">{b.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/80">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Phones and tablets: a slim bar with the price and "Add to cart" appears once the main
 * button scrolls out of view. Floating buttons move up while it shows (data-sticky-cta).
 */
function StickyBar({
  product,
  purchase,
  target,
}: {
  product: Product;
  purchase: Purchase;
  target: RefObject<HTMLButtonElement | null>;
}) {
  const { add } = useCart();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(!!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  useEffect(() => {
    const root = document.documentElement;
    if (show) root.dataset["stickyCta"] = "";
    else delete root.dataset["stickyCta"];
    return () => {
      delete root.dataset["stickyCta"];
    };
  }, [show]);
  const { variant, qty } = purchase;
  if (!variant) return null;
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 px-4 py-3 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-[0.14em]">
            {product.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {variant.title} · {inr(money(variant.price) * qty)}
          </p>
        </div>
        <button
          type="button"
          disabled={!variant.availableForSale}
          onClick={() => add(product, variant, qty, { openDrawer: true })}
          className="btn btn-primary min-h-12 px-6"
        >
          {variant.availableForSale ? pdp.sticky : pdp.soldOut}
        </button>
      </div>
    </div>
  );
}
