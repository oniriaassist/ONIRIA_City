import Link from "next/link";
import { socialLinks } from "../data/socialLinks";
import { contactDetails } from "../data/contactDetails";

export default function Footer() {
  return (
    <footer className="oniriaMinimalFooter">
      <div className="oniriaMinimalFooterInner">
        <section className="oniriaMinimalFooterContact" aria-label="Company contact details">
          <p className="oniriaMinimalFooterCompany">VIGOR GROUP OF COMPANIES</p>
          <p>{contactDetails.location.toUpperCase()}</p>

          <div className="oniriaMinimalFooterContactLinks">
            <a href={contactDetails.phoneHref}>{contactDetails.phoneDisplay}</a>
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          </div>
        </section>

        <div className="oniriaMinimalFooterBrand">
          <Link href="/" aria-label="Return to ONIRIA City homepage">
            ONIRIA CITY
          </Link>
        </div>

        <section className="oniriaMinimalFooterLinks" aria-label="Footer links">
          <nav className="oniriaMinimalFooterLegal" aria-label="Press and legal links">
            <Link href="/journal">PRESS</Link>
            <span aria-hidden="true">/</span>
            <Link href="/terms">TERMS AND CONDITIONS</Link>
          </nav>

          <nav className="oniriaMinimalFooterSocial" aria-label="Social media links">
            {socialLinks.filter(({ name }) => name.toLowerCase() !== "youtube").map(({ name, href }, index) => (
              <span key={name}>
                {index > 0 && <span aria-hidden="true">/</span>}
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {name.toUpperCase()}
                </a>
              </span>
            ))}
          </nav>
        </section>
      </div>
    </footer>
  );
}
