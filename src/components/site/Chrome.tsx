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
import { brand, nav, footer, FREE_SHIPPING_THRESHOLD, type FooterLink } from "@/data/content";
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

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      translate="no"
      className={`text-base font-medium uppercase tracking-[0.3em] md:text-lg ${className}`}
    >
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

// Translucent cream pill with a light blur: used only by the nav.
const PILL =
  "flex h-14 items-center rounded-full border border-green/10 bg-background/80 backdrop-blur-md";

/**
 * Floating pill nav. Desktop: left pill (logo + main links) and right pill (account, cart,
 * "Get started"). Phones: one pill with logo, cart and menu button. Hides while scrolling
 * down, comes back on scroll up or when anything inside gets keyboard focus.
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
        setHidden(y > last && y > 160);
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
      className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-blush"
    >
      <Handbag size={ICON} weight="light" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div
        data-hero="header"
        onFocusCapture={() => setHidden(false)}
        className={`fixed inset-x-0 top-0 z-40 text-green transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${hidden && !menu ? "-translate-y-[calc(100%+0.5rem)]" : ""}`}
      >
        <header className="mx-auto mt-4 flex max-w-[84rem] items-center justify-between gap-3 px-4 md:mt-6 md:px-6">
          <div className={`${PILL} flex-1 justify-between pl-5 pr-1.5 lg:flex-none lg:pr-2`}>
            <Link to="/" aria-label="SkinFusion home" className="lg:mr-6">
              <Logo />
            </Link>
            <nav aria-label="Main" className="hidden items-center lg:flex">
              {nav.main.map((n) => (
                <NavLink
                  key={n.label}
                  href={n.href}
                  className="grid h-11 place-items-center rounded-full px-4 hover:bg-blush"
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center lg:hidden">
              {cartButton}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menu}
                aria-controls="mobile-menu"
                onClick={() => setMenu(true)}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-blush"
              >
                <List size={ICON} weight="light" />
              </button>
            </div>
          </div>
          <div className={`${PILL} hidden gap-1 py-1.5 pl-2 pr-1.5 lg:flex`}>
            <AccountLink />
            {cartButton}
            <NavLink href={nav.cta.href} className="btn btn-primary min-h-11 px-5 py-2">
              {nav.cta.label}
            </NavLink>
          </div>
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
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-background text-green"
        >
          <div className="mx-4 mt-4 flex h-14 items-center justify-between pl-5 pr-1.5">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              autoFocus
              className="grid h-11 w-11 place-items-center rounded-full bg-blush"
            >
              <X size={ICON} weight="light" />
            </button>
          </div>
          <nav className="mt-10 flex flex-col px-9" aria-label="Mobile">
            {[...nav.main, ...nav.more].map((n, k) => (
              <NavLink
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                style={{ animationDelay: `${k * 60}ms` }}
                className="animate-fade-up py-3 text-3xl tracking-[-0.02em]"
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
  const { open, setOpen, lines, setQty, subtotal, checkoutUrl } = useCart();
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
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background sm:rounded-l-[2rem] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <span className="label-caps">Your cart</span>
          <button
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-blush"
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
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-blush">
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
                  className="h-24 w-20 rounded-xl"
                />
              ) : (
                <div className="h-24 w-20 rounded-xl bg-beige" />
              )}
              <div className="flex-1">
                <p className="label-caps text-[0.7rem]">{l.merchandise.product.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{l.merchandise.title}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-input">
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

// Account link in the right nav pill: "Sign in" when signed out, a round initial badge
// linking to the account when signed in. Session comes from the root loader (httpOnly
// cookies, read on the server).
function AccountLink() {
  const session = useLoaderData({ from: "__root__" });
  const initial = session.firstName?.trim().charAt(0).toUpperCase();
  if (!session.signedIn)
    return (
      <Link
        to="/account/login"
        className="grid h-11 place-items-center rounded-full px-4 hover:bg-blush"
      >
        Sign in
      </Link>
    );
  return (
    <Link
      to="/account"
      aria-label={session.firstName ? `My account, ${session.firstName}` : "My account"}
      className="grid h-11 w-11 place-items-center rounded-full hover:bg-blush"
    >
      {initial ? (
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full bg-green text-sm text-cream"
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
        <p className="flex items-center gap-3 rounded-full bg-green px-5 py-3 text-sm whitespace-nowrap text-cream">
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
        className="flex items-center gap-3 rounded-full bg-green px-5 py-3 text-sm text-cream"
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
          className={`min-h-12 rounded-full border px-5 outline-none ${dark ? "border-cream/40 bg-cream/10 text-cream placeholder:text-cream/75 focus:border-cream" : "border-input bg-background focus:border-green"}`}
        />
        <button className="btn btn-primary">Subscribe</button>
      </div>
      {error && (
        <p
          id={`${id}-err`}
          className={`mt-2 px-5 text-sm ${dark ? "text-error-on-dark" : "text-destructive"}`}
        >
          {error}
        </p>
      )}
      {consent && (
        <p
          id={`${id}-consent`}
          className={`mt-3 px-5 text-xs ${dark ? "text-cream/80" : "text-muted-foreground"}`}
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
        onClick={() => setOpen(true)}
        className="label-caps fixed bottom-5 right-5 z-30 grid h-20 w-20 place-items-center rounded-full bg-green text-center text-[0.62rem] leading-tight text-cream transition-transform active:scale-95"
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
          <div className="relative w-full max-w-md animate-fade-up rounded-card bg-background p-8 md:p-10">
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full hover:bg-blush"
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
    <footer
      ref={ref}
      className="overflow-clip rounded-t-[2rem] bg-green text-cream md:rounded-t-[3rem]"
    >
      <div
        data-footer-columns
        className="container-x grid gap-12 py-16 md:py-24 lg:grid-cols-[1.2fr_2fr]"
      >
        <div>
          <Logo className="text-xl text-cream md:text-2xl" />
          <p className="mt-5 max-w-sm text-lg leading-snug text-cream/90">{footer.mission}</p>
          <p className="mt-10 text-xl tracking-[-0.01em]">{footer.newsletter.title}</p>
          <div className="mt-5">
            <NewsletterForm id="nl-footer" tone="dark" consent={footer.newsletter.consent} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {footer.columns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="container-x grid gap-2 py-6 text-xs text-cream/80 md:grid-cols-[auto_1fr] md:gap-8">
          <p>{footer.legal}</p>
          <p className="md:text-right">{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="label-caps text-cream/80">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            {l.href ? (
              <a
                href={l.href}
                {...(l.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                className="text-cream underline-offset-4 hover:underline"
              >
                {l.label}
              </a>
            ) : (
              <span className="text-cream/80">{l.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
