import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Residences | MALǓA",
  description:
    "Explore contemporary residences at MALǓA in Fumba, Zanzibar — thoughtfully planned homes with natural light, refined interiors and connected island living.",
};

const residences = [
  {
    title: "Three-Bedroom Garden Residence",
    eyebrow: "GARDEN RESIDENCE",
    image: "/media/oniria/residence-parking-garden.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "210 m²",
    description:
      "A generous family residence shaped around natural light, open-plan living and a close relationship with the landscaped community.",
    link: "/residences/garden-residence",
    featured: true,
  },
  {
    title: "Two-Bedroom Island Residence",
    eyebrow: "ISLAND RESIDENCE",
    image: "/media/oniria/residence-roundabout.png",
    bedrooms: "2 bedrooms",
    bathrooms: "2 bathrooms",
    area: "145 m²",
    description:
      "A balanced two-bedroom home for modern island living, with efficient planning, comfortable rooms and flexible everyday use.",
    link: "/residences/island-residence",
  },
  {
    title: "One-Bedroom Studio Residence",
    eyebrow: "STUDIO RESIDENCE",
    image: "/media/malua/interior-staircase.webp",
    bedrooms: "1 bedroom",
    bathrooms: "1 bathroom",
    area: "82 m²",
    description:
      "A refined one-bedroom residence with efficient proportions, contemporary interiors and an easy fit for personal or investment-focused ownership.",
    link: "/residences/studio-residence",
  },
];

const principles = [
  {
    label: "THOUGHTFUL PLANNING",
    title: "Space that works beautifully.",
    description:
      "Layouts balance privacy, storage, circulation and shared living so each residence feels considered from arrival to everyday use.",
  },
  {
    label: "LIGHT & LANDSCAPE",
    title: "Designed to feel open.",
    description:
      "Natural light, calm material choices and a relationship with landscaped surroundings bring an easy sense of space to daily life.",
  },
  {
    label: "CONNECTED LIVING",
    title: "Close to what matters.",
    description:
      "Homes sit within the wider MALǓA destination, keeping landscape, lifestyle spaces and V Avenue within convenient reach.",
  },
];

export default function ResidencesPage() {
  return (
    <main className="residencesPremiumPage">
      <Header />

      <section
        className="residencesPremiumHero"
        style={{
          backgroundImage:
            'url("/media/oniria/residence-aerial-masterplan.png")',
        }}
      >
        <div className="residencesPremiumHeroOverlay" />

        <div className="residencesPremiumHeroInner">
          <h1>
            Contemporary homes.
            <em> Connected living.</em>
          </h1>

          <p className="residencesPremiumHeroCopy">
            A considered collection of one, two and three-bedroom residences
            shaped around natural light, refined interiors and the convenience
            of life within MALǓA.
          </p>

          <div className="residencesPremiumHeroActions">
            <a href="/register-interest" className="residencesPremiumGhostButton residencesPremiumHeroRegister">
              Register interest <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="residencesPremiumFacts" aria-label="Residence collection summary">
          <div>
            <small>Collection</small>
            <strong>1–3 bedrooms</strong>
          </div>
          <div>
            <small>Residence sizes</small>
            <strong>82–210 m²</strong>
          </div>
          <div>
            <small>Location</small>
            <strong>Fumba, Zanzibar</strong>
          </div>
          <div>
            <small>Availability</small>
            <strong>Register interest</strong>
          </div>
        </div>
      </section>

      <section className="residencesPremiumIntro" id="page-content">
        <div className="residencesPremiumIntroCopy">
          <p className="sectionLabel">THE RESIDENCE COLLECTION</p>
          <h2>Homes designed around the way life actually happens.</h2>
          <p>
            MALǓA residences bring efficient planning, refined interiors and
            everyday convenience together in one connected destination. Each
            home is designed to feel calm, practical and naturally at home in
            Zanzibar.
          </p>

        </div>

        <div
          className="residencesPremiumIntroImage"
          role="img"
          aria-label="Refined MALǓA residential interior"
          style={{
            backgroundImage: 'url("/media/malua/interior-staircase.webp")',
          }}
        >
          <div className="residencesPremiumIntroImageCaption">
            <span>REFINED INTERIORS</span>
            <strong>Light, material and calm proportions.</strong>
          </div>
        </div>
      </section>

      <section className="residencesPremiumPrinciples" aria-label="Residence design principles">
        {principles.map((principle) => (
          <article key={principle.title}>
            <p>{principle.label}</p>
            <h3>{principle.title}</h3>
            <span>{principle.description}</span>
          </article>
        ))}
      </section>

      <section className="residencesPremiumCollection" id="residence-collection">
        <div className="residencesPremiumCollectionHeading">
          <div>
            <p className="sectionLabel">AVAILABLE COLLECTION</p>
            <h2>Choose the residence that fits your way of living.</h2>
          </div>
          <p>
            Explore layouts from a generous three-bedroom family residence to
            a refined one-bedroom home, then open the full property page for
            details, features and enquiry options.
          </p>
        </div>

        <div className="residencesPremiumGrid">
          {residences.map((residence) => (
            <article
              className={`residencesPremiumCard${
                residence.featured ? " residencesPremiumCardFeatured" : ""
              }`}
              key={residence.title}
            >
              <a
                href={residence.link}
                className="residencesPremiumCardImageLink"
                aria-label={`View ${residence.title}`}
              >
                <div
                  className="residencesPremiumCardImage"
                  style={{ backgroundImage: `url("${residence.image}")` }}
                >
                  <div className="residencesPremiumCardImageOverlay" />

                  {residence.featured && (
                    <span className="residencesPremiumFeaturedBadge">
                      FEATURED RESIDENCE
                    </span>
                  )}

                  <span className="residencesPremiumCardView">
                    View residence <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>

              <div className="residencesPremiumCardContent">
                <p className="residencesPremiumCardEyebrow">{residence.eyebrow}</p>
                <h3>{residence.title}</h3>

                <div className="residencesPremiumSpecs" aria-label={`${residence.title} specifications`}>
                  <span>{residence.bedrooms}</span>
                  <span>{residence.bathrooms}</span>
                  <span>{residence.area}</span>
                </div>

                <p className="residencesPremiumCardDescription">
                  {residence.description}
                </p>

                <div className="residencesPremiumCardFooter">
                  <div>
                    <small>Availability</small>
                    <strong>Register interest</strong>
                  </div>
                  <a href={residence.link}>
                    Explore <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="residencesPremiumEnquiry" aria-label="Private residence enquiry">
        <div>
          <p className="sectionLabel">PRIVATE RESIDENCE ENQUIRY</p>
          <h2>Explore the collection in more detail.</h2>
        </div>
        <p>
          Request property information or arrange a private site visit with the
          MALǓA team to discuss the residence that best fits your plans.
        </p>
        <div className="residencesPremiumEnquiryActions">
          <a href="/register-interest">Register interest <span aria-hidden="true">→</span></a>
          <a href="/arrange-site-visit">Arrange a site visit</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
