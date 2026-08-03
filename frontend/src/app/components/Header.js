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

  return (
    <header
      className={`edenHeader ${
        isHomePage ? "edenHeaderHome" : "edenHeaderInner"
      } ${scrolled ? "edenHeaderScrolled" : ""}`}
    >
      <nav className="edenHeaderDesktop" aria-label="Main navigation">
        <div className="edenNavGroup edenNavGroupLeft">
          {leftNavigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </div>

        <Link href="/" className="edenHeaderBrand" aria-label="ONIRIA City home">
          ONIRIA CITY
        </Link>

        <div className="edenNavGroup edenNavGroupRight">
          {rightNavigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </div>
      </nav>

      <div className="edenHeaderMobile">
        <Link href="/" className="edenHeaderBrand" onClick={closeMenu}>ONIRIA CITY</Link>
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
        {[...leftNavigation, ...rightNavigation].map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>
        ))}
      </div>
    </header>
  );
}
