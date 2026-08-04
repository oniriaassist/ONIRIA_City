export default function FinalSalesCTA() {
  return (
    <section className="finalSalesSection">
      <div
        className="finalSalesBackground"
        style={{
          backgroundImage:
            "url('/media/oniria/villa-pool-rear.png')",
        }}
      >
        <div className="finalSalesOverlay" />

        <div className="finalSalesContent">
          <p className="finalSalesLabel">BEGIN YOUR</p>

          <h2>ONIRIA story</h2>

          <p className="finalSalesDescription">
            Explore a collection shaped around the way you want to live.
          </p>

          <div className="finalSalesActions">
            <a href="/request-brochure" className="finalSalesPrimaryButton">
              Request brochure
            </a>

            <a href="/register-interest" className="finalSalesPrimaryButton">
              Register interest
            </a>

            <a href="/arrange-site-visit" className="finalSalesSecondaryButton">
              Arrange site visit
            </a>

            <a href="https://wa.me/255000000000" className="finalSalesSecondaryButton" target="_blank" rel="noopener noreferrer">
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
              <strong>Villas, Residences & V Avenue</strong>
            </div>

            <div>
              <span>Availability</span>
              <strong>Register your interest</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
