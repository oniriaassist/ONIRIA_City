import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function FinalSalesCTA() {
  return (
    <section
      className="finalSalesSection finalSalesSectionPremium"
      aria-label="Start your MALǓA journey"
    >
      <div
        className="finalSalesBackground"
        style={{ backgroundImage: "url('/media/oniria/villa-pool-rear.png')" }}
      >
        <div className="finalSalesOverlay" />

        <div className="finalSalesContent finalSalesPremiumContent">
          <p className="finalSalesLabel">BEGIN YOUR</p>

          <h2
            className="finalSalesBrandHeading finalSalesPremiumHeading"
            aria-label="MALǓA story"
          >
            <BrandLogo className="finalSalesBrandLogo" />
            <span>story</span>
          </h2>

          <p className="finalSalesDescription">
            Choose your next step and our team will help you explore the
            collection that best fits the way you want to live, visit or invest.
          </p>

          <div className="finalSalesActions finalSalesPremiumActions">
            <Link href="/request-brochure" className="finalSalesPrimaryButton">
              Request brochure
            </Link>

            <Link href="/register-interest" className="finalSalesSecondaryButton">
              Register interest
            </Link>

            <Link href="/arrange-site-visit" className="finalSalesSecondaryButton">
              Arrange site visit
            </Link>
          </div>

          <div className="finalSalesInformation finalSalesPremiumInformation">
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
