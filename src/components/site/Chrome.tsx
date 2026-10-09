import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  MagnifyingGlass,
  User,
  Handbag,
  List,
  X,
  Plus,
  Minus,
  WhatsappLogo,
  InstagramLogo,
  CaretDown,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  announcement,
  brand,
  nav,
  footer,
  FREE_SHIPPING_THRESHOLD,
  type FooterLink,
} from "@/data/content";
import { useCart } from "@/lib/cart/context";
import { useScrollLock } from "@/lib/scroll-lock";
import { inr } from "@/lib/format";
import { money } from "@/lib/shopify/types";
import { ProductImage } from "./ProductImage";

const ICON = 22;

export function AnnouncementBar() {
  const text = announcement.join("  ·  ");
  return (
    <div className="overflow-hidden bg-primary text-primary-foreground">
      <p className="label-caps hidden py-2.5 text-center text-[0.68rem] md:block">{text}</p>
      <p className="sr-only md:hidden">{text}</p>
      <div className="flex w-max animate-marquee py-2.5 md:hidden" aria-hidden="true">
        {[0, 1].map((k) => (
          <span
            key={k}
            aria-hidden
            className="label-caps shrink-0 whitespace-pre px-4 text-[0.68rem]"
          >
            {text} · {text} ·{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`text-xl font-medium uppercase tracking-[0.3em] md:text-2xl ${className}`}>
      SkinFusion
    </span>
  );
}

// Page routes use the router's Link (no full reload); "/#section" anchors stay plain links.
function NavLink({
  href,
  ...props
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (href.startsWith("/#")) return <a href={href} {...props} />;
  return <Link to={href} {...props} />;
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [explore, setExplore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const { count, setOpen } = useCart();

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useScrollLock(menu);

  const solid = scrolled || !isHome;
  const tone = solid ? "text-foreground" : "text-on-image";

  return (
    <>
      <div
        ref={sentinel}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-32 w-px"
      />
      <div data-hero="header" className="fixed inset-x-0 top-0 z-40">
        <AnnouncementBar />
        <header
          className={`relative transition-colors duration-500 ${solid ? "bg-blush" : "bg-header-scrim"} ${tone}`}
        >
          <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
            <div className="flex items-center">
              <button
                aria-label="Open menu"
                onClick={() => setMenu(true)}
                className="-ml-3 grid h-11 w-11 place-items-center lg:hidden"
              >
                <List size={ICON} weight="light" />
              </button>
              <span className="label-caps hidden lg:inline">INR ₹</span>
            </div>
            <Link to="/" aria-label="SkinFusion home">
              <Logo />
            </Link>
            <div className="flex items-center justify-end">
              <button aria-label="Account" className="hidden h-11 w-11 place-items-center sm:grid">
                <User size={ICON} weight="light" />
              </button>
              <button aria-label="Search" className="grid h-11 w-11 place-items-center">
                <MagnifyingGlass size={ICON} weight="light" />
              </button>
              <button
                aria-label={`Open cart, ${count} items`}
                onClick={() => setOpen(true)}
                className="relative -mr-3 grid h-11 w-11 place-items-center"
              >
                <Handbag size={ICON} weight="light" />
                {count > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
          <nav
            data-hero="nav"
            className="hidden justify-center gap-12 pb-4 lg:flex"
            aria-label="Main"
          >
            {nav.main.map((n) => (
              <NavLink key={n.label} href={n.href} className="label-caps py-2 hover:opacity-70">
                {n.label}
              </NavLink>
            ))}
            <div className="relative" onMouseLeave={() => setExplore(false)}>
              <button
                onClick={() => setExplore(!explore)}
                onMouseEnter={() => setExplore(true)}
                aria-expanded={explore}
                className="label-caps flex items-center gap-1.5 py-2 hover:opacity-70"
              >
                Explore <CaretDown size={12} weight="light" />
              </button>
              {explore && (
                <div className="absolute left-1/2 top-full z-10 min-w-48 -translate-x-1/2 border bg-background py-2 text-foreground">
                  {nav.explore.map((n) => (
                    <NavLink
                      key={n.label}
                      href={n.href}
                      onClick={() => setExplore(false)}
                      className="label-caps block px-5 py-3 text-[0.7rem] hover:bg-blush"
                    >
                      {n.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className={`h-px w-full ${solid ? "bg-border" : "bg-on-image/30"}`} />
        </header>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-blush text-foreground">
          <div className="container-x flex h-16 items-center justify-between">
            <Logo />
            <button
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              className="-mr-3 grid h-11 w-11 place-items-center"
            >
              <X size={ICON} weight="light" />
            </button>
          </div>
          <nav className="container-x mt-8 flex flex-col" aria-label="Mobile">
            {[...nav.main, ...nav.explore].map((n, k) => (
              <NavLink
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                style={{ animationDelay: `${k * 70}ms` }}
                className="label-caps animate-fade-up border-b py-5 text-base"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, setQty, subtotal, checkoutUrl } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  useScrollLock(open);
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <span className="label-caps">Your cart</span>
          <button
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="grid h-11 w-11 place-items-center"
          >
            <X size={ICON} weight="light" />
          </button>
        </div>
        <div className="border-b px-6 py-5">
          <p className="text-sm text-muted-foreground">
            {remaining > 0 ? (
              <>
                You are <span className="text-foreground">{inr(remaining)}</span> away from free
                shipping
              </>
            ) : (
              "You have unlocked free shipping"
            )}
          </p>
          <div className="mt-3 h-1 overflow-hidden bg-blush">
            <div
              className="h-full origin-left bg-primary transition-transform duration-700"
              style={{ transform: `scaleX(${pct / 100})` }}
            />
          </div>
        </div>
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6">
          {lines.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">Your cart is empty.</p>
          )}
          {lines.map((l) => (
            <div key={l.id} className="flex gap-4 border-b py-5">
              {l.merchandise.image ? (
                <ProductImage
                  image={l.merchandise.image}
                  alt={l.merchandise.product.title}
                  className="h-24 w-20"
                />
              ) : (
                <div className="h-24 w-20 bg-beige" />
              )}
              <div className="flex-1">
                <p className="label-caps text-[0.7rem]">{l.merchandise.product.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{l.merchandise.title}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQty(l.id, l.quantity - 1)}
                      className="grid h-11 w-11 place-items-center"
                    >
                      <Minus size={14} weight="light" />
                    </button>
                    <span className="w-6 text-center text-sm">{l.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQty(l.id, l.quantity + 1)}
                      className="grid h-11 w-11 place-items-center"
                    >
                      <Plus size={14} weight="light" />
                    </button>
                  </div>
                  <span>{inr(money(l.merchandise.price) * l.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t px-6 py-6">
          <div className="mb-4 flex justify-between">
            <span className="label-caps">Subtotal</span>
            <span>{inr(subtotal)}</span>
          </div>
          {/* checkoutUrl is null until the Shopify cart store is connected */}
          <button
            className="btn btn-primary w-full"
            disabled={!lines.length}
            onClick={() => {
              if (checkoutUrl) window.location.href = checkoutUrl;
            }}
          >
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

export function Toast() {
  const { toast, setOpen } = useCart();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 bg-ink px-5 py-3 text-sm text-background"
      >
        <CheckCircle size={20} weight="light" /> {toast ?? "Added to cart"}{" "}
        <span className="label-caps text-[0.65rem] underline">View</span>
      </button>
    </div>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={brand.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:bg-primary-hover active:scale-95"
    >
      <WhatsappLogo size={28} weight="light" />
    </a>
  );
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  };
  if (done)
    return (
      <p className="text-foreground" role="status">
        Thank you. Your 10% code is on its way to {email}.
      </p>
    );
  return (
    <form onSubmit={submit} noValidate className={compact ? "" : "max-w-md"}>
      <label htmlFor={compact ? "nl-modal" : "nl-footer"} className="sr-only">
        Email address
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          id={compact ? "nl-modal" : "nl-footer"}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          aria-invalid={!!error}
          aria-describedby="nl-err"
          className="min-h-12 border border-input bg-background px-4 outline-none focus:border-foreground"
        />
        <button className="btn btn-primary">Subscribe</button>
      </div>
      {error && (
        <p id="nl-err" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

export function DiscountBadge() {
  const [open, setOpen] = useState(false);
  useScrollLock(open);
  return (
    <>
      <button
        data-hero="badge"
        onClick={() => setOpen(true)}
        className="label-caps fixed bottom-5 right-5 z-30 grid h-20 w-20 place-items-center rounded-full bg-ink text-center text-[0.62rem] leading-tight text-background transition-transform active:scale-95"
      >
        10% off?
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disc-title"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md animate-fade-up bg-background p-8 md:p-10">
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center"
            >
              <X size={ICON} weight="light" />
            </button>
            <h2 id="disc-title" className="text-xl">
              Get 10% off
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join our list for 10% off your first order, plus calm rituals in your inbox.
            </p>
            <div className="mt-6">
              <NewsletterForm compact />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const Col = ({ title, links }: { title: string; links: FooterLink[] }) => (
    <div>
      <p className="label-caps">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            {l.href ? (
              <a
                href={l.href}
                {...(l.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                className="text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            ) : (
              <span className="text-muted-foreground">{l.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="bg-blush text-foreground">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1.6fr] lg:py-24">
        <div>
          <Logo />
          <p className="mt-4 text-muted-foreground">{brand.city}</p>
          <p className="text-muted-foreground">{brand.tagline}</p>
          <div className="mt-5 flex gap-2">
            <a
              href={brand.instagram}
              aria-label="SkinFusion on Instagram"
              className="-ml-3 grid h-11 w-11 place-items-center"
            >
              <InstagramLogo size={ICON} weight="light" />
            </a>
            <a
              href={brand.whatsapp}
              aria-label="SkinFusion on WhatsApp"
              className="grid h-11 w-11 place-items-center"
            >
              <WhatsappLogo size={ICON} weight="light" />
            </a>
          </div>
        </div>
        <Col title="Menu" links={footer.menu} />
        <Col title="Support" links={footer.support} />
        <Col title="Join us" links={footer.join} />
        <div>
          <p className="label-caps">Sign up to get 10% off your 1st order</p>
          <div className="mt-5">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container-x grid gap-1 py-6 text-xs text-muted-foreground md:grid-cols-2">
          <p>{footer.legal}</p>
          <p className="md:text-right">{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
