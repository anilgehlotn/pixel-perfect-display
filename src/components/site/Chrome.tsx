import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MagnifyingGlass, User, Handbag, List, X, Plus, Minus, WhatsappLogo, InstagramLogo, FacebookLogo, YoutubeLogo } from "@phosphor-icons/react";
import { announcement, brand, nav, footer, FREE_SHIPPING_THRESHOLD } from "@/data/content";
import { useCart, inr } from "@/lib/cart";

export function AnnouncementBar() {
  const line = [...announcement, ...announcement];
  return (
    <div className="overflow-hidden bg-primary text-primary-foreground">
      <div className="flex w-max animate-marquee py-2.5">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0" aria-hidden={k === 1}>
            {line.map((t, i) => (
              <span key={i} className="label-caps px-6 text-[0.68rem]">{t}<span className="pl-12 opacity-60">·</span></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return <span className={`font-serif text-2xl tracking-tight ${className}`}>Skin<em className="italic">Fusion</em></span>;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { count, setOpen } = useCart();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${scrolled || menu ? "border-b bg-background" : "border-b border-transparent bg-transparent"}`}>
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <div className="flex items-center gap-2">
          <button aria-label="Menu" className="-ml-2 grid h-11 w-11 place-items-center lg:hidden" onClick={() => setMenu(!menu)}>
            {menu ? <X size={22} weight="light" /> : <List size={22} weight="light" />}
          </button>
          <Link to="/" className="text-brand"><Logo /></Link>
        </div>
        <nav className="hidden gap-9 lg:flex">
          {nav.map((n) => <a key={n.label} href={`/${n.href}`} className="label-caps text-foreground/80 transition-colors hover:text-primary">{n.label}</a>)}
        </nav>
        <div className="flex items-center">
          <button aria-label="Search" className="grid h-11 w-11 place-items-center"><MagnifyingGlass size={21} weight="light" /></button>
          <button aria-label="Account" className="hidden h-11 w-11 place-items-center sm:grid"><User size={21} weight="light" /></button>
          <button aria-label="Open cart" onClick={() => setOpen(true)} className="relative grid h-11 w-11 place-items-center">
            <Handbag size={22} weight="light" />
            {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count}</span>}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="container-x flex flex-col pb-6 lg:hidden">
          {nav.map((n) => <a key={n.label} href={`/${n.href}`} onClick={() => setMenu(false)} className="label-caps border-b py-4">{n.label}</a>)}
        </nav>
      )}
    </header>
  );
}

export function CartDrawer() {
  const { open, setOpen, items, setQty, subtotal } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-foreground/30 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b px-6 py-5">
          <span className="label-caps">Your cart</span>
          <button aria-label="Close cart" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center"><X size={22} weight="light" /></button>
        </div>
        <div className="border-b px-6 py-5">
          <p className="text-sm text-muted-foreground">
            {remaining > 0 ? <>You are <span className="text-foreground">{inr(remaining)}</span> away from free shipping</> : "You have unlocked free shipping"}
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-blush">
            <div className="h-full origin-left bg-primary transition-transform duration-700" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 && <p className="py-16 text-center text-muted-foreground">Your cart is empty. A calm cup is one click away.</p>}
          {items.map((i) => (
            <div key={i.key} className="flex gap-4 border-b py-5">
              <img src={i.image} alt={i.name} className="h-24 w-20 rounded-md object-cover" />
              <div className="flex-1">
                <p className="label-caps text-[0.7rem]">{i.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{i.packLabel}{i.subscribe ? " · Subscribe & save" : ""}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <button aria-label="Decrease" onClick={() => setQty(i.key, i.qty - 1)} className="grid h-11 w-11 place-items-center"><Minus size={14} weight="light" /></button>
                    <span className="w-6 text-center text-sm">{i.qty}</span>
                    <button aria-label="Increase" onClick={() => setQty(i.key, i.qty + 1)} className="grid h-11 w-11 place-items-center"><Plus size={14} weight="light" /></button>
                  </div>
                  <span>{inr(i.unitPrice * i.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t px-6 py-6">
          <div className="mb-4 flex justify-between"><span className="label-caps">Subtotal</span><span>{inr(subtotal)}</span></div>
          <button className="btn btn-primary w-full" disabled={!items.length}>Checkout</button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Extra 5% off on prepaid orders at checkout</p>
        </div>
      </aside>
    </div>
  );
}

export function WhatsAppButton() {
  return (
    <a href={brand.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-soft transition-transform active:scale-95">
      <WhatsappLogo size={28} weight="light" />
    </a>
  );
}

export function Footer() {
  return (
    <footer id="story" className="bg-brand text-brand-foreground">
      <div className="container-x grid gap-12 py-16 md:grid-cols-5 lg:py-24">
        <div className="md:col-span-2">
          <Logo className="text-3xl" />
          <p className="mt-4 max-w-xs text-brand-foreground/70">Traditional Chinese Medicine ingredients, brewed into a gentle daily ritual. Made in India in small batches.</p>
          <div className="mt-6 flex gap-2">
            {[InstagramLogo, FacebookLogo, YoutubeLogo].map((I, k) => (
              <a key={k} href="#" aria-label="Social link" className="grid h-11 w-11 place-items-center rounded-full border border-brand-foreground/20 hover:bg-brand-foreground/10"><I size={20} weight="light" /></a>
            ))}
          </div>
        </div>
        {footer.columns.map((c) => (
          <div key={c.title}>
            <p className="label-caps text-brand-foreground/60">{c.title}</p>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => <li key={l}><a href="#" className="text-brand-foreground/90 hover:text-brand-foreground">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-brand-foreground/10">
        <p className="container-x py-6 text-xs text-brand-foreground/60">{footer.legal}</p>
      </div>
    </footer>
  );
}
