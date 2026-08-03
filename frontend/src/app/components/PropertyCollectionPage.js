import Header from "./Header";
import PublicPageHero from "./PublicPageHero";
import PropertyCard from "./PropertyCard";
import FinalSalesCTA from "./FinalSalesCTA";
import Footer from "./Footer";

export default function PropertyCollectionPage({
  hero,
  introduction,
  properties,
  features = [],
  showFinalCTA = true,
  showCardLabels = true,
}) {
  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        image={hero.image}
      />

      <section className="propertyCollectionIntroduction" id="page-content">
        <p className="sectionLabel">{introduction.label}</p>

        <h2>{introduction.title}</h2>

        <p>{introduction.description}</p>
      </section>

      {features.length > 0 && (
        <section className="propertyCollectionFeatures">
          {features.map((feature, index) => (
            <article key={feature.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>
      )}

      <section className="propertyListingSection">
        <div className="propertyListingHeading">
          <div>
            <p className="sectionLabel">AVAILABLE COLLECTION</p>
            <h2>Explore the properties</h2>
          </div>

          <p>
            Select a property to view its design, rooms, features and enquiry
            options.
          </p>
        </div>

        <div className="propertyListingGrid">
          {properties.map((property) => (
            <PropertyCard
              property={property}
              showImageLabels={showCardLabels}
              key={property.title}
            />
          ))}
        </div>
      </section>

      {showFinalCTA && <FinalSalesCTA />}
      <Footer />
    </main>
  );
}