"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "../../actions";

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  items: NavItem[];
  displayName: string;
  role: string;
}

// /admin should only be active on the board itself, not its sub-pages; the
// others match their section including any nested routes.
function isActiveFor(href: string, pathname: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="rounded-full bg-fill px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-secondary-label">
      {role}
    </span>
  );
}

// The desktop row holds up to eight links plus the user block, which is far
// wider than a phone. Below xl the links collapse behind a menu button so the
// header never pushes the page sideways.
export default function DashboardNav({ items, displayName, role }: Props) {
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so any navigation (a link,
  // the back button) closes it rather than leaving the new page hidden.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  return (
    <>
      <nav className="hidden flex-1 flex-wrap gap-1 text-sm font-medium xl:flex">
        {items.map((item) => {
          const isActive = isActiveFor(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? "bg-foreground text-white"
                  : "text-secondary-label hover:bg-fill hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden shrink-0 items-center gap-4 text-sm text-secondary-label xl:flex">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {displayName}
          <RoleBadge role={role} />
        </span>
        <form action={signOut}>
          <button type="submit" className="font-semibold text-foreground underline">
            Sign out
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="dashboard-mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground outline-none transition hover:bg-fill focus-visible:ring-2 focus-visible:ring-foreground xl:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="dashboard-mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-black/5 bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.08)] xl:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3 text-[15px] font-medium sm:px-6">
            {items.map((item) => {
              const isActive = isActiveFor(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-foreground ${
                    isActive ? "bg-foreground text-white" : "text-foreground hover:bg-fill"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-t border-black/5 px-5 py-3.5 text-sm text-secondary-label sm:px-6">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{displayName}</span>
              <RoleBadge role={role} />
            </span>
            <form action={signOut}>
              <button type="submit" className="font-semibold text-foreground underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
