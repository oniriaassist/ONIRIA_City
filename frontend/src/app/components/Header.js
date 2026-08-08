"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const leftNavigation = [
  { label: "Vision", href: "/vision" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Masterplan", href: "/masterplan" },
];

const rightNavigation = [
  { label: "Villas", href: "/villas" },
  { label: "Mall", href: "/v-avenue" },
  { label: "Contact", href: "/contact" },
];

function isActiveRoute(pathname, href) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  function renderDesktopLink(item) {
    const active = isActiveRoute(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={active ? "isActive" : undefined}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <header
      className={`edenHeader ${
        isHomePage ? "edenHeaderHome" : "edenHeaderInner"
      } ${scrolled ? "edenHeaderScrolled" : ""}`}
    >
      <nav className="edenHeaderDesktop" aria-label="Main navigation">
        <div className="edenNavGroup edenNavGroupLeft">
          {leftNavigation.map(renderDesktopLink)}
        </div>

        <Link href="/" className="edenHeaderBrand" aria-label="ONIRIA City home">
          ONIRIA CITY
        </Link>

        <div className="edenNavGroup edenNavGroupRight">
          {rightNavigation.map(renderDesktopLink)}
        </div>
      </nav>

      <div className="edenHeaderMobile">
        <Link href="/" className="edenHeaderBrand" onClick={closeMenu}>
          ONIRIA CITY
        </Link>

        <button
          type="button"
          className={`edenMenuButton ${menuOpen ? "isOpen" : ""}`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={`edenMobileMenu ${menuOpen ? "isOpen" : ""}`}>
        {[...leftNavigation, ...rightNavigation].map((item) => {
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "isActive" : undefined}
              aria-current={active ? "page" : undefined}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/request-brochure"
          className="edenMobileSalesCta"
          onClick={closeMenu}
        >
          Request brochure
        </Link>
      </div>
    </header>
  );
}
