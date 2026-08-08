import Header from "./Header";
import Footer from "./Footer";

function getCollectionSlug(collection = "") {
  const normalized = collection.toLowerCase();

  if (normalized.includes("residence")) return "residences";
  if (normalized.includes("commercial")) return "commercial";
  if (normalized.includes("v avenue")) return "v-avenue";

  return "villas";
}

export default function PropertyDetailPage({ property, collectionSlug: collectionSlugOverride }) {
  const collectionSlug = collectionSlugOverride || getCollectionSlug(property.collection);
  const propertyName = encodeURIComponent(property.title);
  const inquiryHref = `/register-interest?collection=${collectionSlug}&property=${propertyName}`;
  const visitHref = `/arrange-site-visit?collection=${collectionSlug}&property=${propertyName}`;
  const brochureHref = `/request-brochure?collection=${collectionSlug}&property=${propertyName}`;

  const productType = collectionSlug === "villas" ? "villa" : "property";

  const salesHeading = `Explore this ${productType} with our property team`;

  const brochureLabel = `Request full details for ${property.title}`;

  return (
    <main className="propertyDetailPage">
      <Header />

      <section
        className="propertyDetailHero"
        style={{ backgroundImage: `url("${property.heroImage}")` }}
      >
        <div className="propertyDetailHeroOverlay" />

        <div className="propertyDetailHeroContent">
          <h1>{property.title}</h1>
        </div>

        <a href="#property-overview" className="propertyDetailScroll">
          Explore <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="propertyDetailOverview" id="property-overview">
        <div className="propertyDetailOverviewText">
          <p className="sectionLabel">{property.eyebrow}</p>
          <h2>{property.overviewTitle}</h2>
          <p>{property.description}</p>

          <div className="propertyDetailOverviewActions">
            <a href={inquiryHref} className="propertyDetailPrimaryButton">
              Request availability
            </a>
            <a href={visitHref} className="propertyDetailTextLink">
              Arrange a private visit <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="propertyDetailFacts" aria-label="Property facts">
          {property.facts.map((fact) => (
            <div key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="propertyDetailGallery" aria-label="Property gallery">
        {property.gallery.map((image, index) => (
          <article
            className={`propertyDetailGalleryItem ${
              index === 0 ? "propertyDetailGalleryItemLarge" : ""
            }`}
            key={image.title}
          >
            <div
              className="propertyDetailGalleryImage"
              style={{ backgroundImage: `url("${image.url}")` }}
            >
              <div className="propertyDetailGalleryOverlay" />
              <div className="propertyDetailGalleryCaption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{image.title}</h3>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="propertyDetailFeaturesSection">
        <div className="propertyDetailFeaturesHeading">
          <p className="sectionLabel">PROPERTY FEATURES</p>
          <h2>Designed for a more considered way of living</h2>
          <p>
            Every detail supports privacy, comfort and an effortless connection
            between home, garden and Zanzibar&apos;s tropical climate.
          </p>
        </div>

        <div className="propertyDetailFeaturesGrid">
          {property.features.map((feature, index) => (
            <article key={feature.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="propertyDetailLayout">
        <div
          className="propertyDetailLayoutImage"
          style={{ backgroundImage: `url("${property.layoutImage}")` }}
          role="img"
          aria-label={`${property.title} layout and spaces`}
        />

        <div className="propertyDetailLayoutContent">
          <p className="sectionLabel">LAYOUT &amp; SPACES</p>
          <h2>{property.layoutTitle}</h2>
          <p>{property.layoutDescription}</p>

          <ul>
            {property.layoutPoints.map((point) => (
              <li key={point}>
                <span aria-hidden="true">—</span>
                {point}
              </li>
            ))}
          </ul>

          <a
            href={brochureHref}
            className="propertyDetailPrimaryButton propertyDetailFullDetailsButton"
            aria-label={brochureLabel}
          >
            Request full details
          </a>
        </div>
      </section>

      <section className="propertyDetailInquiry">
        <div className="propertyDetailInquiryCopy">
          <p className="sectionLabel">YOUR NEXT STEP</p>
          <h2>{salesHeading}</h2>
          <p>
            Receive current information, discuss your requirements or arrange a
            private introduction to ONIRIA City in Fumba.
          </p>
        </div>

        <div className="propertyDetailInquiryActions">
          <a href={inquiryHref} className="propertyDetailPrimaryButton">
            Register interest
          </a>
          <a href={visitHref} className="propertyDetailSecondaryButton">
            Arrange site visit
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
