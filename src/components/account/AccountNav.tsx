import { Link } from "@tanstack/react-router";
import { SignOut } from "@phosphor-icons/react";

const ITEMS = [
  { to: "/account", label: "Overview", exact: true },
  { to: "/account/orders", label: "Orders", exact: false },
  { to: "/account/addresses", label: "Addresses", exact: true },
  { to: "/account/details", label: "Account details", exact: true },
] as const;

const item =
  "label-caps flex min-h-11 shrink-0 items-center whitespace-nowrap px-4 text-[0.7rem] transition-colors lg:px-0";

// Section navigation for the account area: horizontally scrollable tabs on phones, a sidebar
// from 1024px. Real links with aria-current, so keyboard and back/forward work as expected.
// Sign out is set apart from the other items.
export function AccountNav() {
  return (
    <nav aria-label="Account" className="-mx-6 border-b lg:mx-0 lg:border-b-0">
      <ul className="no-scrollbar flex snap-x overflow-x-auto px-2 lg:grid lg:gap-1 lg:overflow-visible lg:px-0">
        {ITEMS.map((i) => (
          <li key={i.to} className="snap-start">
            <Link
              to={i.to}
              activeOptions={{ exact: i.exact }}
              className={`${item} border-b-2 border-transparent text-muted-foreground hover:text-foreground lg:border-b-0 lg:border-l-2 lg:pl-4`}
              activeProps={{
                className: "!border-primary !text-foreground",
                "aria-current": "page",
              }}
            >
              {i.label}
            </Link>
          </li>
        ))}
        <li className="ml-2 border-l pl-2 lg:mt-6 lg:ml-0 lg:border-t lg:border-l-0 lg:pt-4 lg:pl-0">
          <a
            href="/account/logout"
            className={`${item} gap-2 text-muted-foreground hover:text-foreground lg:pl-4`}
          >
            <SignOut size={16} weight="light" aria-hidden="true" />
            Sign out
          </a>
        </li>
      </ul>
    </nav>
  );
}
