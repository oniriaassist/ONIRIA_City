import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "../data/socialLinks";
import { contactDetails } from "../data/contactDetails";
import BrandLogo from "./BrandLogo";
import oniriaInvestmentsLogo from "../../assets/partners/oniria-investments.png";

export default function Footer() {
  return (
    <footer className="oniriaMinimalFooter">
      <div className="oniriaMinimalFooterInner">
        <section className="oniriaMinimalFooterContact" aria-label="Company contact details">
          <div className="oniriaMinimalFooterDeveloperLogo">
            <Image
              src={oniriaInvestmentsLogo}
              alt="ONIRIA Investments"
              width={751}
              height={262}
              className="oniriaMinimalFooterDeveloperLogoImage"
              sizes="(max-width: 600px) 190px, 250px"
              unoptimized
              priority={false}
            />
          </div>

          <div className="oniriaMinimalFooterContactLinks">
            <a href={contactDetails.phoneHref}>{contactDetails.phoneDisplay}</a>
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          </div>
        </section>

        <div className="oniriaMinimalFooterBrand">
          <Link href="/" aria-label="Return to MALǓA homepage">
            <BrandLogo />
          </Link>
        </div>

        <section className="oniriaMinimalFooterLinks" aria-label="Footer links">
          <nav className="oniriaMinimalFooterLegal" aria-label="Press and legal links">
            <span>PRESS</span>
            <span aria-hidden="true">/</span>
            <span>TERMS AND CONDITIONS</span>
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
