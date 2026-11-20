import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useLoaderData } from "@tanstack/react-router";
import {
  User,
  Handbag,
  List,
  X,
  Plus,
  Minus,
  WhatsappLogo,
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
import { useNotify } from "@/lib/notify-context";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { MOTION_CONDITIONS } from "@/lib/animations/media";
import { footerReveal } from "@/lib/animations/presets";
import { afterInitialLoad } from "@/lib/animations/hydration";
import { safely } from "@/lib/animations/safety";
import { inr } from "@/lib/format";
import { money } from "@/lib/shopify/types";
import { ProductImage } from "./ProductImage";

const ICON = 22;

/** Wordmark with a small sliced-jujube mark (twelve petals around a stone). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span translate="no" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="text-[1.05rem] font-medium tracking-[0.06em] md:text-[1.35rem]">
        SkinFusion
      </span>
      <svg viewBox="0 0 40 40" aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse
            key={i}
            cx="20"
            cy="8.5"
            rx="2.2"
            ry="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            transform={`rotate(${i * 30} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="3.2" fill="currentColor" />
      </svg>
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

/** Jujube top bar. Desktop shows every message; phones show the first one. No motion. */
function AnnouncementBar() {
  return (
    <div className="bg-wine text-cream">
      <ul className="mx-auto flex min-h-10 max-w-[80rem] items-center justify-center gap-8 px-4 py-2 text-center text-[0.7rem] font-medium uppercase tracking-[0.18em]">
        {announcement.map((m, i) => (
          <li key={m} className={i === 0 ? "" : "hidden lg:block"}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

const NAV_LINK =
  "inline-flex h-11 items-center text-[0.75rem] font-medium uppercase tracking-[0.18em] underline-offset-[6px] hover:underline";

/**
 * Announcement bar, then a sticky header: links on the left, centred logo, account and cart
 * on the right. Phones: menu button, logo, cart. The header hides while scrolling down and
 * comes back on scroll up or when anything inside gets keyboard focus.
 */
export function Header() {
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { count, setOpen } = useCart();
  const session = useLoaderData({ from: "__root__" });
  useScrollLock(menu);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (Math.abs(y - last) < 8) return;
        setHidden(y > last && y > 240);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const cartButton = (
    <button
      type="button"
      aria-label={`Open cart, ${count} items`}
      onClick={() => setOpen(true)}
      className="relative grid h-11 w-11 place-items-center"
    >
      <Handbag size={ICON} weight="light" />
      {count > 0 && (
        <span className="absolute right-0.5 top-1 grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-coral px-1 text-[10px] font-medium text-wine">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <AnnouncementBar />
      <div
        data-hero="header"
        onFocusCapture={() => setHidden(false)}
        className={`sticky top-0 z-40 border-b border-ink/10 bg-surface/95 text-ink backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${hidden && !menu ? "-translate-y-full" : ""}`}
      >
        <header className="mx-auto max-w-[80rem] px-3 md:px-6">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 lg:h-[4.5rem]">
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menu}
                aria-controls="mobile-menu"
                onClick={() => setMenu(true)}
                className="grid h-11 w-11 place-items-center lg:hidden"
              >
                <List size={ICON} weight="light" />
              </button>
              <span className="hidden lg:block">
                <NavLink href={nav.cta.href} className={NAV_LINK}>
                  {nav.cta.label}
                </NavLink>
              </span>
            </div>
            <Link to="/" aria-label="SkinFusion home" className="flex h-11 items-center text-ink">
              <Logo />
            </Link>
            <div className="flex items-center justify-end gap-3">
              <div className="hidden lg:block">
                <AccountLink />
              </div>
              {cartButton}
            </div>
          </div>
          <nav aria-label="Main" className="hidden justify-center gap-10 pb-2 lg:flex">
            {nav.main.map((n) => (
              <NavLink key={n.label} href={n.href} className={NAV_LINK}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </header>
      </div>

      {menu && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={(e) => {
            if (e.key === "Escape") setMenu(false);
          }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-background text-ink"
        >
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b px-3">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              autoFocus
              className="grid h-11 w-11 place-items-center"
            >
              <X size={ICON} weight="light" />
            </button>
            <Logo />
            <span />
          </div>
          <nav className="mt-8 flex flex-col px-6" aria-label="Mobile">
            {[...nav.main, ...nav.more].map((n, k) => (
              <NavLink
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                style={{ animationDelay: `${k * 60}ms` }}
                className="animate-fade-up border-b border-ink/10 py-5 text-lg font-medium uppercase tracking-[0.18em]"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div
            className="mt-auto flex animate-fade-up flex-col gap-3 px-6 pb-8 pt-10"
            style={{ animationDelay: `${(nav.main.length + nav.more.length) * 60}ms` }}
          >
            <NavLink
              href={nav.cta.href}
              onClick={() => setMenu(false)}
              className="btn btn-primary w-full"
            >
              {nav.cta.label}
            </NavLink>
            {session.signedIn ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/account"
                  onClick={() => setMenu(false)}
                  className="btn btn-outline w-full"
                >
                  My account
                </Link>
                <a href="/account/logout" className="btn btn-outline w-full">
                  Sign out
                </a>
              </div>
            ) : (
              <Link
                to="/account/login"
                onClick={() => setMenu(false)}
                className="btn btn-outline w-full"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, setQty, subtotal, checkoutUrl, checkout } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  useScrollLock(open);
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} inert={!open}>
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
            className="grid h-11 w-11 place-items-center hover:bg-blush"
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
              className="h-full origin-left bg-jujube transition-transform duration-700"
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
                  <div className="flex items-center border border-input">
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
          {/* checkoutUrl is null for the local cart (Shopify not configured) */}
          <button
            className="btn btn-primary w-full"
            disabled={!lines.length || !checkoutUrl}
            onClick={() => void checkout()}
          >
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

// Account link in the right nav pill: "Sign in" when signed out, a round initial badge
// linking to the account when signed in. Session comes from the root loader (httpOnly
// cookies, read on the server).
function AccountLink() {
  const session = useLoaderData({ from: "__root__" });
  const initial = session.firstName?.trim().charAt(0).toUpperCase();
  if (!session.signedIn)
    return (
      <Link to="/account/login" className={NAV_LINK}>
        Sign in
      </Link>
    );
  return (
    <Link
      to="/account"
      aria-label={session.firstName ? `My account, ${session.firstName}` : "My account"}
      className="grid h-11 w-11 place-items-center"
    >
      {initial ? (
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full bg-jujube text-sm text-cream"
        >
          {initial}
        </span>
      ) : (
        <User size={ICON} weight="light" />
      )}
    </Link>
  );
}

/** Short confirmations from useNotify ("Address saved", "You've been signed out"). */
export function Notice() {
  const { notice } = useNotify();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-40 left-1/2 z-50 -translate-x-1/2 transition-[transform,opacity] duration-500 ${notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      {notice ? (
        <p className="flex items-center gap-3 bg-ink px-5 py-3.5 text-sm whitespace-nowrap text-cream">
          <CheckCircle size={20} weight="light" aria-hidden="true" /> {notice}
        </p>
      ) : null}
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
        className="flex items-center gap-3 bg-ink px-5 py-3.5 text-sm text-cream"
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
      data-float
      className="fixed bottom-4 right-4 z-30 grid h-12 w-12 lg:bottom-5 lg:left-5 lg:right-auto lg:h-14 lg:w-14 place-items-center rounded-full bg-surface text-jujube ring-1 ring-ink/10 transition-transform hover:bg-blush active:scale-95"
    >
      <WhatsappLogo size={28} weight="light" />
    </a>
  );
}

export function NewsletterForm({
  id,
  tone = "light",
  consent,
}: {
  id: string;
  tone?: "light" | "dark";
  consent?: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const dark = tone === "dark";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  };
  if (done) return <p role="status">Thank you. Your 10% code is on its way to {email}.</p>;
  const describedBy = [error && `${id}-err`, consent && `${id}-consent`].filter(Boolean).join(" ");
  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={`min-h-[52px] border px-5 outline-none ${dark ? "border-cream/40 bg-cream/10 text-cream placeholder:text-cream/75 focus:border-cream" : "border-input bg-surface focus:border-ink"}`}
        />
        <button className="btn btn-primary">Subscribe</button>
      </div>
      {error && (
        <p
          id={`${id}-err`}
          className={`mt-2 text-sm ${dark ? "text-error-on-dark" : "text-destructive"}`}
        >
          {error}
        </p>
      )}
      {consent && (
        <p
          id={`${id}-consent`}
          className={`mt-3 text-xs ${dark ? "text-cream/80" : "text-muted-foreground"}`}
        >
          {consent}
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
        data-float
        onClick={() => setOpen(true)}
        className="label-caps fixed bottom-5 right-5 z-30 hidden h-20 w-20 lg:grid place-items-center rounded-full bg-jujube text-center text-[0.62rem] leading-tight text-cream transition-transform active:scale-95"
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
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center hover:bg-blush"
            >
              <X size={ICON} weight="light" />
            </button>
            <h2 id="disc-title" className="title">
              Get 10% off
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join our list for 10% off your first order, plus calm rituals in your inbox.
            </p>
            <div className="mt-6">
              <NewsletterForm id="nl-modal" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    (_ctx, contextSafe) => {
      const footer = ref.current;
      if (!footer || !contextSafe) return;
      let mm: gsap.MatchMedia | undefined;
      const setup = contextSafe(() => {
        mm = gsap.matchMedia();
        mm.add(MOTION_CONDITIONS, (ctx) => {
          const { isDesktop, isReduced } = ctx.conditions as Record<string, boolean>;
          if (isReduced) return;
          let cleanup = () => {};
          safely("footer", footer, () => {
            cleanup = footerReveal(footer, isDesktop ? "desktop" : "mobile");
          });
          return cleanup;
        });
      });
      const cancel = afterInitialLoad(setup);
      return () => {
        cancel();
        mm?.revert();
      };
    },
    { scope: ref },
  );
  return (
    <footer ref={ref} className="overflow-clip bg-blush text-ink">
      <div
        data-footer-columns
        className="container-x grid gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_2fr] lg:gap-20"
      >
        <div>
          <Logo />
          <p className="mt-5 max-w-sm leading-relaxed text-ink/80">{footer.mission}</p>
          <p className="mt-10 text-[0.8rem] font-medium uppercase tracking-[0.2em]">
            {footer.newsletter.title}
          </p>
          <div className="mt-4">
            <NewsletterForm id="nl-footer" consent={footer.newsletter.consent} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {footer.columns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="container-x grid gap-2 py-6 text-xs text-muted-foreground md:grid-cols-[auto_1fr] md:gap-8">
          <p className="uppercase tracking-[0.16em]">{footer.legal}</p>
          <p className="md:text-right">{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="label-caps">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            {l.href ? (
              <a
                href={l.href}
                {...(l.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                className="inline-flex min-h-6 text-ink/85 underline-offset-4 hover:text-ink hover:underline"
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
}
