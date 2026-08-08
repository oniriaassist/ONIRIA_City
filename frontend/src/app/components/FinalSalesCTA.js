import Link from "next/link";
import { buildWhatsAppLink } from "../data/contactDetails";

export default function FinalSalesCTA() {
  const whatsappHref = buildWhatsAppLink(
    "Hello ONIRIA City, I would like to discuss villas, residences or V Avenue opportunities."
  );

  return (
    <section className="finalSalesSection" aria-label="Start your ONIRIA City journey">
      <div
        className="finalSalesBackground"
        style={{
          backgroundImage: "url('/media/oniria/villa-pool-rear.png')",
        }}
      >
        <div className="finalSalesOverlay" />

        <div className="finalSalesContent">
          <p className="finalSalesLabel">BEGIN YOUR</p>
          <h2>ONIRIA story</h2>

          <p className="finalSalesDescription">
            Choose your next step and our team will help you explore the
            collection that best fits the way you want to live, visit or invest.
          </p>

          <div className="finalSalesActions">
            <Link href="/request-brochure" className="finalSalesPrimaryButton">
              Request brochure
            </Link>

            <Link href="/register-interest" className="finalSalesPrimaryButton">
              Register interest
            </Link>

            <Link href="/arrange-site-visit" className="finalSalesSecondaryButton">
              Arrange site visit
            </Link>

            <a
              href={whatsappHref}
              className="finalSalesSecondaryButton"
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue on WhatsApp
            </a>
          </div>

          <div className="finalSalesInformation">
            <div>
              <span>Location</span>
              <strong>Fumba, Zanzibar</strong>
            </div>

            <div>
              <span>Collections</span>
              <strong>Villas, Residences &amp; V Avenue</strong>
            </div>

            <div>
              <span>Private introduction</span>
              <strong>Brochure &amp; site visits</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
